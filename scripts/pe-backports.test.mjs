import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { once } from "node:events";
import test from "node:test";
import { apply } from "../lib/index.js";
import { ALL_PATCHES, applyReplacementsToText } from "../lib/core.js";
import { rewritePromptAssembly, unwrapInjectShell } from "../lib/identity.js";
import { promptAllowed } from "../lib/prompt-policy.js";

const inject = "PE fixture: 使用当前卡片和任务协议，保留工具与状态输出格式。";
const rootContext = () => ({
  agent: { session: { id: "story-1", header: {}, events: [] } },
});
const render = (assembly) =>
  assembly.sections.map((section) => section.text).join("\n\n");

function fixture() {
  return {
    sections: [
      {
        name: "tavern:character-card",
        text: "【故事设定 · 人物卡】\n你是远航的领航员。",
      },
      {
        name: "tavern:constant-worldbook",
        text: "【常驻世界书】\n港口正在下雨。",
      },
      { name: "tavern:card-system-prompt", text: "人物保持谨慎。" },
      { name: "mnemon:recall", text: "上次留下了一盏灯。" },
      { name: "tool:tavern_submit", text: "按 JSON Schema 提交状态。" },
    ],
    tools: [{ name: "tavern_submit", parameters: { type: "object" } }],
    contexts: [{ name: "mnemon:instructions", text: "长期事实" }],
  };
}

function harness() {
  const hooks = new Map();
  const sections = [];
  const commands = new Map();
  const toolEntries = new Map();
  const routes = new Map();
  const ctx = {
    systemPrompt: { section: (section) => sections.push(section) },
    tools: { register: (tool) => toolEntries.set(tool.name, tool) },
    on: (name, fn) => hooks.set(name, fn),
    get: (name) =>
      name === "commands"
        ? { register: (cmd) => commands.set(cmd.name, cmd) }
        : undefined,
    inject: (deps, setup) => {
      if (deps.includes("connection")) setup({ get: () => undefined });
      if (deps.includes("webServer"))
        setup({
          effect: (fn) => fn(),
          webServer: {
            register: (route) => {
              routes.set(route.path, route.handler);
              return () => {};
            },
          },
        });
    },
  };
  return { ctx, hooks, sections, commands, toolEntries, routes };
}

for (const id of [1, 2, 3]) {
  test(`补丁 #${id} 重复应用后逐字节稳定`, () => {
    const patch = ALL_PATCHES.find((entry) => entry.id === id);

    // 使用真实补丁的原始源码锚点，随后走生产替换器。
    const source = patch.patterns.join("\n");
    const first = applyReplacementsToText(source, patch);
    assert.equal(first.changed, true);
    for (let i = 0; i < 5; i++)
      assert.equal(applyReplacementsToText(first.text, patch).text, first.text);
    // 1.1.15 的旧锚点本身已收敛，因此不回移新版自匹配替换链的修复。
    assert.equal(
      applyReplacementsToText(first.text, { ...patch, skipIfMarked: false })
        .text,
      first.text,
    );
  });
}

test("去壳只移除成对外层，内部标记和空正文不被误改", () => {
  assert.equal(
    unwrapInjectShell(
      `\ufeff<|im_start|>system\n<project_instructions>${inject}</project_instructions><|im_end|>`,
    ),
    inject,
  );
  assert.equal(
    unwrapInjectShell(`<project_instructions>${inject}`),
    `<project_instructions>${inject}`,
  );
  assert.equal(
    unwrapInjectShell(
      `before <project_instructions>${inject}</project_instructions>`,
    ),
    `before <project_instructions>${inject}</project_instructions>`,
  );
  assert.equal(unwrapInjectShell(""), "");
});

test("前台每轮注入一次，保留 Tavern/Mnemon 工具、卡片、世界书和元数据", () => {
  const assembly = fixture();
  const original = structuredClone(assembly);
  assembly.sections.push({ name: "dsh-purge", text: inject });
  assembly.sections.push({
    name: "deployment:persona-prefix",
    text: `${inject}\n\n${inject}\n\n工作目录`,
  });
  for (let turn = 0; turn < 5; turn++) {
    rewritePromptAssembly(assembly, {
      fallbackInject: inject,
      dropMnemon: false,
    });
    assert.equal(
      assembly.sections.filter((section) => section.name === "dsh-purge")
        .length,
      1,
    );
    assert.equal(assembly.sections[0].text, inject);
    for (const section of original.sections)
      assert.deepEqual(
        assembly.sections.find((item) => item.name === section.name),
        section,
      );
    assert.deepEqual(assembly.tools, original.tools);
    assert.deepEqual(assembly.contexts, original.contexts);
  }
});

test("同文案碰撞不改 Tavern 与第三方正文，前后空白逐字保留", () => {
  const protectedSections = [
    { name: "tavern:character-card", text: `  角色对白：${inject}  \n` },
    {
      name: "tavern:constant-worldbook",
      text: `\n\t${inject}\n    世界书结尾  `,
    },
    { name: "mnemon:recall", text: `  ${inject}  ` },
    { name: "other-plugin:instructions", text: `\n${inject}\n` },
  ];
  const assembly = {
    sections: [
      ...structuredClone(protectedSections),
      { name: "dsh-purge", text: inject },
      { name: "dsh-purge", text: inject },
      {
        name: "deployment:persona-prefix",
        text: `${inject}\n\n${inject}\n工作目录`,
      },
    ],
  };
  for (let turn = 0; turn < 5; turn++) {
    rewritePromptAssembly(assembly, {
      fallbackInject: inject,
      dropMnemon: false,
    });
    const ownSections = assembly.sections.filter(
      (section) => section.name === "dsh-purge",
    );
    assert.equal(
      ownSections.length,
      1,
      "只按主注入 section 判断重复，不按业务文案出现次数判断",
    );
    assert.equal(ownSections[0].text, inject);
    assert.equal(
      assembly.sections.find(
        (section) => section.name === "deployment:persona-prefix",
      ).text,
      "工作目录",
    );
    for (const section of protectedSections) {
      assert.deepEqual(
        assembly.sections.find((item) => item.name === section.name),
        section,
      );
    }
  }
});

test("root 范围根据真实 Session 字段排除后台和结构化设计请求", () => {
  const config = { enabled: true, promptScope: "root" };
  assert.equal(promptAllowed(config, rootContext(), fixture()), true);
  assert.equal(promptAllowed(config, {}), false);
  const fork = rootContext();
  fork.agent.session.header.parentSession = "original-story";
  assert.equal(
    promptAllowed(config, fork, fixture()),
    true,
    "原生分叉仍是前台",
  );
  for (const task of ["mvu", "posture", "candidates", "phone", "image"]) {
    const context = rootContext();
    context.agent.session.header.parentSession = "story-1";
    context.agent.session.header.origin = "subagent";
    context.agent.session.events.push({
      type: "subagent/descriptor",
      data: { provider: `dsh-tavern-${task}` },
    });
    assert.equal(promptAllowed(config, context, fixture()), false);
    delete context.agent.session.header.parentSession;
    assert.equal(promptAllowed(config, context, fixture()), false);
  }
  for (const section of [
    { name: "deployment:persona", complete: true },
    { name: "tavern:card-system" },
    { name: "tavern:card-reference" },
    { name: "tavern:resource-workspace" },
  ]) {
    assert.equal(
      promptAllowed(config, rootContext(), { sections: [section] }),
      false,
    );
  }
});

test("旧宿主 #40 complete 返回使用本轮 waterfall 结果且不重复注入", () => {
  const patch = ALL_PATCHES.find((entry) => entry.id === 40);
  const source = patch.replacements[0].pattern;
  const changed = applyReplacementsToText(source, patch);
  assert.equal(changed.changed, true);
  const finish = new Function(
    "transformed",
    "completeSection",
    "runtimeContextSuppressed",
    changed.text,
  );
  const complete = { name: "deployment:persona", text: "当前 JSON 协议" };
  const assembly = {
    sections: [{ name: "dsh-purge", text: inject }, complete],
    tools: [],
    contexts: [],
  };
  const result = finish(assembly, complete, false);
  assert.equal(render(result), `${inject}\n\n当前 JSON 协议`);
  assert.equal(
    render(
      finish(
        {
          ...assembly,
          sections: [{ name: "dsh-purge", text: inject }, ...result.sections],
        },
        complete,
        false,
      ),
    ),
    render(result),
  );
  assert.equal(
    render(finish({ ...assembly, sections: [complete] }, complete, false)),
    "当前 JSON 协议",
  );
});

test("真实临时 profile 文件在重注册和热改后生效；启动/延迟及拒绝入口无写入", async (t) => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "purge-pe-test-"));
  const prior = process.env.DSH_HOME;
  process.env.DSH_HOME = home;
  t.after(() => {
    if (prior === undefined) delete process.env.DSH_HOME;
    else process.env.DSH_HOME = prior;
    fs.rmSync(home, { recursive: true, force: true });
  });
  const snapshot = () =>
    fs
      .readdirSync(home, { recursive: true })
      .sort()
      .map((name) => [
        name,
        fs.statSync(path.join(home, name)).isFile()
          ? fs.readFileSync(path.join(home, name), "hex")
          : "dir",
      ]);
  const config = {
    enabled: true,
    autoApplyOnStart: false,
    autoUpdateOnStart: false,
    allowHostMutation: false,
    stripMnemon: false,
    promptScope: "root",
    rewindEnabled: false,
  };
  const empty = harness();
  apply(empty.ctx, config);
  await new Promise((resolve) => setTimeout(resolve, 1600));
  assert.deepEqual(snapshot(), [], "空 home 不得自愈写入默认文件");
  const manualAllowed = harness();
  apply(manualAllowed.ctx, { ...config, allowHostMutation: true });
  const managed = harness();
  apply(managed.ctx, {
    ...config,
    autoApplyOnStart: true,
    autoUpdateOnStart: true,
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(snapshot(), [], "自动开关和宿主写入开关独立保护启动");
  assert.equal(
    empty.hooks.has("agent/pre-step"),
    false,
    "不得注册 Mnemon 消息过滤",
  );
  fs.writeFileSync(path.join(home, "prompt-inject.md"), inject);
  const before = snapshot();
  for (let restart = 0; restart < 2; restart++) {
    const state = harness();
    apply(state.ctx, config);
    const assembly = fixture();
    const hook = state.hooks.get("system-prompt/assemble");
    const result = await hook(assembly, rootContext(), async () => assembly);
    assert.equal(result.sections[0].text, inject);
    const backend = fixture();
    backend.sections.push({ name: "dsh-purge", text: inject });
    const context = rootContext();
    context.agent.session.header.parentSession = "story-1";
    context.agent.session.header.origin = "subagent";
    assert.deepEqual(
      await hook(backend, context, async () => backend),
      fixture(),
    );
  }
  assert.deepEqual(snapshot(), before);
  fs.writeFileSync(path.join(home, "prompt-inject.md"), inject + "更新");
  const changed = await empty.hooks.get("system-prompt/assemble")(
    fixture(),
    rootContext(),
    async () => fixture(),
  );
  assert.equal(changed.sections[0].text, inject + "更新");
  const frozen = snapshot();
  for (const command of ["apply", "revert", "uninstall"]) {
    assert.equal(
      (await empty.commands.get("purge").handler({ rawInput: command })).kind,
      "error",
    );
  }
  assert.equal(
    (await empty.commands.get("rewind").handler({ rawInput: "once" })).kind,
    "error",
  );
  for (const name of ["purge_apply", "purge_revert"])
    assert.match((await empty.toolEntries.get(name).execute()).text, /已停用/);
  const server = http.createServer((req, res) => {
    const handler = empty.routes.get(req.url);
    if (!handler) {
      res.writeHead(404);
      res.end();
      return;
    }
    Promise.resolve(handler(req, res)).catch((error) => {
      res.writeHead(500);
      res.end(String(error));
    });
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const route of [
    "apply",
    "revert",
    "uninstall",
    "restart",
    "update",
    "rewind",
    "rewind/options",
  ]) {
    assert.ok(empty.routes.has(`/dsh-purge/${route}`), `真实注册 ${route}`);
    for (const method of ["GET", "POST"]) {
      const response = await fetch(`${base}/dsh-purge/${route}`, { method });
      assert.equal(response.status, 403, `${method} ${route}`);
      assert.match(
        (await response.json()).code,
        /^PURGE_(?:HOST_MUTATION|REWIND)_DISABLED$/,
      );
    }
  }
  assert.deepEqual(snapshot(), frozen, "被拒绝请求不得改变磁盘");
});
