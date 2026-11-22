// 0.2.3-alpha.1 起，宿主在跑 waterfall 之前就捕获了 complete 段：
//   const completeSection = {...};  // 捕获
//   const transformed = await waterfall(...);
//   presentation.sections = [completeSection];  // 按捕获快照还原
//   renderedSections = presentation.sections.map(...);  // 真正提交给 systemUpdates 的
// 所以"在返回对象里补一段"只能让界面看见，模型请求里没有。这里用一个同形状的
// 宿主替身锁住这个顺序：注入必须进入捕获快照——注册期包装，或挂载时补写已注册定义。
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  hostCapturesCompleteSection,
  installCompleteSectionGuard,
} from "../lib/identity.js";

/**
 * 只实现本测试需要的宿主形状：捕获 → waterfall → 还原 → 提交。
 * `layers` 与宿主一致（Map<name, registration[]>，每个 registration 持有可替换的
 * definition），用于验证"先注册、后挂 guard"的补写路径。
 */
function fakeHost() {
  const registrations = [];
  const committed = [];
  const prompt = {
    layers: { global: { sections: new Map() }, scoped: new Map() },
    section(spec) {
      const registration = { definition: spec };
      registrations.push(registration);
      const list = prompt.layers.global.sections.get(spec.name) || [];
      list.push(registration);
      prompt.layers.global.sections.set(spec.name, list);
      return () => {
        const at = registrations.indexOf(registration);
        if (at >= 0) registrations.splice(at, 1);
      };
    },
    async assemble(context = {}) {
      const resolve = (spec) =>
        typeof spec.text === "function" ? spec.text(context) : spec.text;
      // 宿主每次组装都从 registration.definition 读当前定义（补写就是换掉它）。
      const captured = registrations.map((registration) => ({
        ...registration.definition,
        text: resolve(registration.definition),
      }));
      const complete = captured.find((spec) => spec.complete === true);
      // waterfall 里运行时补的段。
      const transformed = [
        ...captured,
        {
          name: "dsh-purge",
          order: -100000,
          text: "EXTRA_FROM_WATERFALL",
          interpolate: false,
        },
      ];
      // 宿主只认捕获快照。
      const presentation = complete ? [{ ...complete }] : transformed;
      const rendered = presentation.filter(
        (spec) => spec.text.trim().length > 0,
      );
      const text = rendered.map((spec) => spec.text.trim()).join("\n\n");
      committed.push(text);
      return {
        sections: presentation,
        contexts: [],
        tools: [],
        systemUpdates: () => text,
      };
    },
    systemUpdates() {
      return committed.at(-1) || "";
    },
  };
  return { prompt, registrations, committed };
}

const COMPLETE = {
  name: "deployment:persona-prefix",
  order: 0,
  complete: true,
};

test("the 0.2.3 host drops waterfall additions to a complete prompt", async () => {
  const h = fakeHost();
  h.prompt.section({ ...COMPLETE, text: () => "COMPLETE_PERSONA" });
  const assembly = await h.prompt.assemble();
  // 运行时补的段被还原掉：返回对象和真正提交里都没有它。
  assert.deepEqual(
    assembly.sections.map((s) => s.name),
    [COMPLETE.name],
  );
  assert.equal(h.committed.at(-1), "COMPLETE_PERSONA");
});

test("registration-time composition puts the inject into the committed complete prompt", async () => {
  const h = fakeHost();
  const release = installCompleteSectionGuard(
    h.prompt,
    () => "PURGE_INJECT",
    "installation",
  );
  assert.equal(typeof release, "function");
  h.prompt.section({ ...COMPLETE, text: () => "COMPLETE_PERSONA" });
  h.prompt.section({ name: "tool:read", order: 1100, text: () => "READ_TOOL" });

  await h.prompt.assemble();
  const committed = h.committed.at(-1);
  assert.equal(committed, "COMPLETE_PERSONA\n\nPURGE_INJECT");
  // 注入只出现一次，普通段不被改写。
  assert.equal(committed.split("PURGE_INJECT").length - 1, 1);
  assert.equal(
    h.registrations
      .find((r) => r.definition.name === "tool:read")
      .definition.text(),
    "READ_TOOL",
  );
  assert.equal(
    h.registrations.find((r) => r.definition.name === COMPLETE.name).definition
      .complete,
    true,
  );
  release();
});

test("mounting after the preset already registered still composes (late enable / hot reload)", async () => {
  const h = fakeHost();
  // 预设先注册，Purge 后启用：这里不能提前装任何 guard。
  h.prompt.section({ ...COMPLETE, text: () => "COMPLETE_PERSONA" });
  await h.prompt.assemble();
  assert.equal(h.committed.at(-1), "COMPLETE_PERSONA");

  const release = installCompleteSectionGuard(
    h.prompt,
    () => "LATE_INJECT",
    "installation",
  );
  await h.prompt.assemble();
  assert.equal(h.committed.at(-1), "COMPLETE_PERSONA\n\nLATE_INJECT");

  release();
  await h.prompt.assemble();
  assert.equal(h.committed.at(-1), "COMPLETE_PERSONA");
});

test("late composition keeps dynamic preset text and empty inject", async () => {
  const h = fakeHost();
  h.prompt.section({
    ...COMPLETE,
    text: (context) => `PERSONA:${context.agent || "none"}`,
  });
  await h.prompt.assemble({ agent: "a1" });
  assert.equal(h.committed.at(-1), "PERSONA:a1");
  const release = installCompleteSectionGuard(
    h.prompt,
    (context) => (context.inject === false ? "" : "INJECT"),
    "installation",
  );
  await h.prompt.assemble({ agent: "a1" });
  assert.equal(h.committed.at(-1), "PERSONA:a1\n\nINJECT");
  await h.prompt.assemble({ agent: "a1", inject: false });
  assert.equal(h.committed.at(-1), "PERSONA:a1");
  release();
});

test("the same installation token does not stack the inject twice", async () => {
  const h = fakeHost();
  const provider = () => "PURGE_INJECT";
  const first = installCompleteSectionGuard(h.prompt, provider, "installation");
  const second = installCompleteSectionGuard(
    h.prompt,
    provider,
    "installation",
  );
  assert.equal(typeof first, "function");
  assert.equal(typeof second, "function");
  h.prompt.section({ ...COMPLETE, text: () => "COMPLETE_PERSONA" });
  await h.prompt.assemble();
  assert.equal(h.committed.at(-1).split("PURGE_INJECT").length - 1, 1);
  // 只有最后一个持有者解绑时才真正移除。
  first();
  await h.prompt.assemble();
  assert.equal(h.committed.at(-1).split("PURGE_INJECT").length - 1, 1);
  second();
  await h.prompt.assemble();
  assert.equal(h.committed.at(-1), "COMPLETE_PERSONA");
});

test("a failing inject provider cannot break the complete prompt", async () => {
  const h = fakeHost();
  const release = installCompleteSectionGuard(
    h.prompt,
    () => {
      throw new Error("inject unavailable");
    },
    "installation",
  );
  h.prompt.section({ ...COMPLETE, text: () => "COMPLETE_PERSONA" });
  await h.prompt.assemble();
  assert.equal(h.committed.at(-1), "COMPLETE_PERSONA");
  release();
});

test("the capability probe only accepts a service with the new captured-complete implementation", () => {
  class NewPrompt {
    async assemble() {}
    systemUpdates() {}
  }
  class OldPrompt {
    async assemble() {}
  }
  const newPrompt = new NewPrompt();
  assert.equal(hostCapturesCompleteSection(newPrompt), true);
  // Cordis 代理通过 symbols.original 指向服务实例。
  assert.equal(
    hostCapturesCompleteSection({ [Symbol.for("cordis.original")]: newPrompt }),
    true,
  );
  assert.equal(hostCapturesCompleteSection(new OldPrompt()), false);
  assert.equal(hostCapturesCompleteSection({}), false);
  assert.equal(hostCapturesCompleteSection(null), false);
});

test("the guard reaches the service behind a Cordis proxy and tolerates a plain object", async () => {
  const h = fakeHost();
  const proxy = { [Symbol.for("cordis.original")]: h.prompt };
  const release = installCompleteSectionGuard(
    proxy,
    () => "PURGE_INJECT",
    "installation",
  );
  assert.equal(typeof release, "function");
  h.prompt.section({ ...COMPLETE, text: () => "COMPLETE_PERSONA" });
  await h.prompt.assemble();
  assert.equal(h.committed.at(-1), "COMPLETE_PERSONA\n\nPURGE_INJECT");
  release();
  // 没有 section() 的服务不抛错，也不安装。
  assert.equal(
    installCompleteSectionGuard({}, () => "x"),
    null,
  );
  assert.equal(
    installCompleteSectionGuard(null, () => "x"),
    null,
  );
});

test("the guard does not rewrite non-complete or retiring sections", async () => {
  const h = fakeHost();
  const release = installCompleteSectionGuard(
    h.prompt,
    () => "PURGE_INJECT",
    "installation",
  );
  h.prompt.section({ name: "ordinary", order: 1, text: () => "ORDINARY" });
  h.prompt.section({
    name: "closing",
    order: 2,
    complete: true,
    retire: true,
    text: () => "CLOSING",
  });
  assert.equal(h.registrations[0].definition.text(), "ORDINARY");
  assert.equal(h.registrations[1].definition.text(), "CLOSING");
  release();
});
