// 端到端接线：installIdentityOverride 必须在宿主捕获 complete 段之前挂上组合，
// 且要覆盖多个 systemPrompt 服务、能补写已经注册的 complete 段。
// 这里的替身与 0.2.3-alpha.1 同形状：服务原型带 systemUpdates（先捕获、后提交），
// 并保留 host 的注册表结构（registration.definition 可被补写）。
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Context, Service } from "@deepseek-ai/cordis";
import {
  installIdentityOverride,
  registerPromptSections,
} from "../lib/index.js";
import { readRuntimeEvidence } from "../lib/runtime-evidence.js";

const INJECT = "WIRING_INJECT_BODY";
const POST = "WIRING_POST_BODY";

/** 给任意对象装上 0.2.3-alpha.1 形状的 systemPrompt 行为（含宿主注册表结构）。 */
function attachFakePrompt(target) {
  target.registrations = [];
  target.committed = "";
  target.layers = { global: { sections: new Map() }, scoped: new Map() };
  target.section = (spec) => {
    const registration = { definition: spec };
    target.registrations.push(registration);
    const list = target.layers.global.sections.get(spec.name) || [];
    list.push(registration);
    target.layers.global.sections.set(spec.name, list);
    return () => {
      const at = target.registrations.indexOf(registration);
      if (at >= 0) target.registrations.splice(at, 1);
    };
  };
  target.assemble = async (context = {}) => {
    const resolve = (spec) =>
      typeof spec.text === "function" ? spec.text(context) : spec.text;
    const captured = target.registrations.map((registration) => ({
      ...registration.definition,
      text: resolve(registration.definition),
    }));
    const complete = captured.find((spec) => spec.complete === true);
    const transformed = [
      ...captured,
      { name: "runtime-only", order: 0, text: "WATERFALL_EXTRA" },
    ];
    const presentation = complete ? [{ ...complete }] : transformed;
    target.committed = presentation
      .map((spec) => String(spec.text || "").trim())
      .filter(Boolean)
      .join("\n\n");
    return {
      sections: presentation,
      contexts: [],
      variables: {},
      tools: [],
      systemUpdates: () => target.committed,
    };
  };
  target.systemUpdates = () => target.committed;
  return target;
}

function fakeService(label = "secondary") {
  return attachFakePrompt({ label });
}

/** 装在 Service 上的替身：cordis 代理下才能验证 symbols.original 路径。 */
class Prompt extends Service {
  constructor(ctx) {
    super(ctx, "systemPrompt");
    attachFakePrompt(this);
  }
}

const CFG = {
  enabled: true,
  capabilityProtocol: false,
  stripMnemon: false,
  injectOnce: false,
  excludePresets: [],
  postPrompt: POST,
  postPromptOrder: 5100,
};

function withHome(fn) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "purge-complete-wiring-"));
  const prev = process.env.DSH_HOME;
  process.env.DSH_HOME = home;
  fs.writeFileSync(path.join(home, "prompt-inject.md"), INJECT);
  // 关掉默认开启的强化段，断言只盯主注入和后置提示。
  fs.mkdirSync(path.join(home, "dsh-purge"), { recursive: true });
  fs.writeFileSync(
    path.join(home, "dsh-purge", "tuning.json"),
    JSON.stringify({ boost: false }),
  );
  return Promise.resolve(fn(home)).finally(() => {
    if (prev === undefined) delete process.env.DSH_HOME;
    else process.env.DSH_HOME = prev;
    fs.rmSync(home, { recursive: true, force: true });
    delete globalThis.__dshPurgePrepareAssemble;
    delete globalThis.__dshPurgeHungPrompt;
  });
}

function mount(inner, cfg = CFG) {
  return inner.plugin({
    name: "complete-wiring-" + Math.random().toString(36).slice(2),
    inject: ["systemPrompt"],
    apply(ctx) {
      registerPromptSections(ctx, cfg);
      installIdentityOverride(ctx, cfg);
    },
  });
}

const COMPLETE = {
  name: "deployment:persona-prefix",
  order: 0,
  complete: true,
};

test("installIdentityOverride composes the inject and postPrompt into a complete preset", async () => {
  await withHome(async () => {
    const root = new Context();
    await root.plugin(Prompt);
    const owner = mount(root);
    await owner;
    try {
      root.systemPrompt.section({
        ...COMPLETE,
        text: () => "COMPLETE_PERSONA",
      });
      await root.systemPrompt.assemble();
      const committed = root.systemPrompt.committed;
      assert.ok(
        committed.includes("COMPLETE_PERSONA"),
        "complete preset text stays",
      );
      assert.ok(committed.includes(INJECT), "complete preset keeps the inject");
      assert.equal(
        committed.split(INJECT).length - 1,
        1,
        "inject appears once",
      );
      // 后置提示曾经在 complete 模式下静默丢失。
      assert.ok(committed.includes(POST), "complete preset keeps postPrompt");
      assert.ok(
        committed.indexOf(POST) > committed.indexOf(INJECT),
        "postPrompt keeps its tail position",
      );
      assert.ok(
        !committed.includes("WATERFALL_EXTRA"),
        "captured snapshot still wins over the waterfall",
      );
      // #40 的状态判定依赖这条证据：插件运行时真的挂上了，才允许报"已由新版接管"。
      assert.equal(
        readRuntimeEvidence(process.env.DSH_HOME, "completeComposition"),
        true,
      );
    } finally {
      await owner.dispose();
      await root.fiber.dispose();
    }
  });
});

test("a preset registered before Purge mounts still receives the inject", async () => {
  await withHome(async () => {
    const root = new Context();
    await root.plugin(Prompt);
    // Purge 后启用：complete 段在没有 guard 的时候就已经注册。
    root.systemPrompt.section({ ...COMPLETE, text: () => "PRESET_FIRST" });
    await root.systemPrompt.assemble();
    assert.equal(root.systemPrompt.committed, "PRESET_FIRST");

    const owner = mount(root);
    await owner;
    try {
      await root.systemPrompt.assemble();
      const committed = root.systemPrompt.committed;
      assert.ok(committed.includes("PRESET_FIRST"));
      assert.ok(
        committed.includes(INJECT),
        "late mount must retro-wrap the registered section",
      );
      assert.equal(committed.split(INJECT).length - 1, 1);
    } finally {
      await owner.dispose();
      await root.fiber.dispose();
    }
  });
});

test("a second, independent prompt service also gets the guard", async () => {
  await withHome(async () => {
    const root = new Context();
    await root.plugin(Prompt);
    const owner = mount(root);
    await owner;
    try {
      root.systemPrompt.section({ ...COMPLETE, text: () => "SERVICE_A" });
      await root.systemPrompt.assemble();
      assert.ok(root.systemPrompt.committed.includes(INJECT));

      // 独立服务 B：同一个插件实例，经 pre-step 钩子遇到。
      const second = fakeService("secondary");
      const prepared = globalThis.__dshPurgePrepareAssemble({
        systemPrompt: second,
      });
      assert.equal(prepared, second);
      second.section({ ...COMPLETE, text: () => "SERVICE_B" });
      await second.assemble();
      assert.ok(second.committed.includes("SERVICE_B"));
      assert.ok(
        second.committed.includes(INJECT),
        "the second service must be mounted too",
      );
      assert.equal(second.committed.split(INJECT).length - 1, 1);
    } finally {
      await owner.dispose();
      await root.fiber.dispose();
    }
  });
});

test("an old-shape service without systemUpdates is left alone", async () => {
  await withHome(async () => {
    const root = new Context();
    // 旧实现：只有 assemble，没有 systemUpdates。
    class LegacyPrompt extends Service {
      constructor(ctx) {
        super(ctx, "systemPrompt");
        this.registrations = [];
      }
      section(spec) {
        this.registrations.push(spec);
        return () => {};
      }
      async assemble() {
        return {
          sections: [],
          contexts: [],
          variables: {},
          tools: [],
          systemUpdates: () => "",
        };
      }
    }
    await root.plugin(LegacyPrompt);
    const owner = mount(root);
    await owner;
    try {
      root.systemPrompt.section({ ...COMPLETE, text: () => "LEGACY_PERSONA" });
      const spec = root.systemPrompt.registrations.find(
        (entry) => entry.complete === true,
      );
      assert.equal(
        spec.text(),
        "LEGACY_PERSONA",
        "old hosts keep #40's separate-section behaviour",
      );
    } finally {
      await owner.dispose();
      await root.fiber.dispose();
    }
  });
});
