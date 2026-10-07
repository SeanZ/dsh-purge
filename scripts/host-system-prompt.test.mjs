import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import test from "node:test";
import { apply } from "../lib/index.js";
import { ALL_PATCHES, applyReplacementsToText } from "../lib/core.js";

// 显式指定真实 rc.2 产物；不在通用单测里隐式依赖邻接仓库。
const hostFile = process.env.DSH_TEST_SYSTEM_PROMPT_MODULE;
if (!hostFile)
  throw new Error(
    "请设置 DSH_TEST_SYSTEM_PROMPT_MODULE 为 rc.2 的 system-prompt/lib/index.js",
  );
const requireHost = createRequire(path.resolve(hostFile));
const { Context } = await import(
  pathToFileURL(requireHost.resolve("@deepseek-ai/cordis"))
);
const original = fs.readFileSync(hostFile, "utf8");
const patch = ALL_PATCHES.find((entry) => entry.id === 40);
const patched = applyReplacementsToText(original, patch);
assert.ok(
  patched.changed ||
    patched.text.includes("[dsh-purge] complete prompt keeps inject"),
  "真实 rc.2 模块必须命中 #40",
);
const source = patched.text.replace(
  /from\s+(["'])(@[^"']+)\1/g,
  (_all, _quote, specifier) =>
    `from ${JSON.stringify(pathToFileURL(requireHost.resolve(specifier)).href)}`,
);
const { default: SystemPrompt, renderPrompt } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
);
const marker = "PE_HOST_INTEGRATION_CURRENT";
const config = {
  enabled: true,
  autoApplyOnStart: false,
  autoUpdateOnStart: false,
  allowHostMutation: false,
  stripMnemon: false,
  promptScope: "root",
  rewindEnabled: false,
};

const cases = [
  { name: "前台剧情", header: {}, expected: 1 },
  { name: "业务同文案与前后空白", header: {}, expected: 1, collision: true },
  { name: "原生分叉前台", header: { parentSession: "original" }, expected: 1 },
  {
    name: "MVU 后台 complete",
    header: { parentSession: "story", origin: "subagent" },
    complete: true,
    expected: 0,
  },
  {
    name: "历史后台 descriptor",
    header: {},
    descriptor: true,
    complete: true,
    expected: 0,
  },
  {
    name: "未绑卡设计",
    header: {},
    extra: "tavern:resource-workspace",
    expected: 0,
  },
  { name: "已绑卡设计", header: {}, extra: "tavern:card-system", expected: 0 },
];

test("真实 Cordis + 打过 #40 的 SystemPrompt 范围、完整段与字节保留", async (t) => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "purge-host-test-"));
  const prior = process.env.DSH_HOME;
  process.env.DSH_HOME = home;
  fs.writeFileSync(path.join(home, "prompt-inject.md"), marker);
  t.after(() => {
    if (prior === undefined) delete process.env.DSH_HOME;
    else process.env.DSH_HOME = prior;
    fs.rmSync(home, { recursive: true, force: true });
  });
  for (const entry of cases) {
    await t.test(entry.name, async () => {
      const ctx = new Context();
      try {
        await ctx.plugin(SystemPrompt, {
          includeHarnessIdentity: false,
          personaPrefix: "",
          personaSuffix: "",
        });
        apply(ctx, config);
        const originalText =
          "MVU:\n    key:  value\n  人物卡双空格  保持。\nYou are a helpful software engineer assistant.";
        const text = entry.collision
          ? `  \n${marker}\n    ${originalText}  \n`
          : originalText;
        if (entry.complete)
          ctx.systemPrompt.section({
            name: "deployment:persona",
            order: 0,
            complete: true,
            text,
          });
        // 按 Tavern hook 的 next 后投影方式替换 sections，覆盖真实 waterfall 的顺序。
        ctx.on("system-prompt/assemble", async (_assembly, _context, next) => {
          const assembly = await next();
          if (!entry.complete) {
            assembly.sections = [
              { name: "tavern:character-card", text },
              { name: "mnemon:recall", text: "记忆" },
            ];
            if (entry.extra)
              assembly.sections.push({
                name: entry.extra,
                text: "仅按当前任务的 JSON 协议输出。",
              });
          }
          return assembly;
        });
        const context = {
          agent: {
            session: {
              id: entry.name,
              header: entry.header,
              snapshotEvents: () =>
                entry.descriptor
                  ? [
                      {
                        type: "subagent/descriptor",
                        data: { provider: "dsh-tavern" },
                      },
                    ]
                  : [],
            },
          },
        };
        for (let turn = 0; turn < 2; turn++) {
          const assembled = await ctx.systemPrompt.assemble(context);
          const output = renderPrompt(assembled);
          const ownSections = assembled.sections.filter(
            (section) => section.name === "dsh-purge",
          );
          assert.equal(ownSections.length, entry.expected);
          if (entry.expected) assert.equal(ownSections[0].text, marker);
          const section = assembled.sections.find(
            (item) =>
              item.name ===
              (entry.complete ? "deployment:persona" : "tavern:character-card"),
          );
          assert.equal(
            section.text,
            text,
            "Tavern 模板包括缩进和 stock 句逐字保留",
          );
          if (entry.expected) assert.ok(output.startsWith(marker));
        }
      } finally {
        await ctx.fiber.dispose();
      }
    });
  }
});
