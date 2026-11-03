// Anchors pinned to the real DSH 0.2.1-rc.1 host source. If the host changes shape,
// these fixtures and the patch table must be updated together — that is the point.
import { test } from "node:test";
import assert from "node:assert/strict";
import { ALL_PATCHES, applyReplacementsToText } from "../lib/core.js";

const patch = (id) => {
  const found = ALL_PATCHES.find((p) => p.id === id);
  assert.ok(found, `patch #${id} must exist`);
  return found;
};

const WEB_PROMPT = "const WEB_SURFACE_PROMPT = `You are interacting with the user through the DeepSeek Harness Web GUI whose URL the runtime context names. When the user refers to \"this page\", \"this GUI\", or \"this app\" without naming another target, they mean this GUI. The browser provides no implicit DOM, route, or screenshot context. The client-plugin HMR receiver is active, but client-plugin changes reload without a refresh only while \\`pnpm run dev:web\\` is also running from this same checkout to rebuild their bundles; verify that watcher before promising automatic updates. Every other change — the apps/web shell and plain packages — requires rebuilding the affected Web artifacts and verifying this existing URL after a page refresh. Starting another server does not update this GUI. The apps/web Vite entry builds the shell but is not a standalone application because only dsh web injects window.__DSH_BOOT__. Do not start a replacement server unless the user asks; if one is needed, use a managed background job and verify its exact URL.`;";

const SYSTEM_PROMPT_ASSEMBLE = "\t\tconst transformed = await this.ctx.waterfall(scopeTarget(this, scope), \"system-prompt/assemble\", assembly, context, () => Promise.resolve(assembly));\n\t\tif (completeSection === void 0 && !runtimeContextSuppressed) return transformed;\n\t\tconst requiredContexts = new Set([...contextByName.values()].filter((entry) => entry.required === true).map((entry) => entry.name));\n\t\treturn {\n\t\t\t...transformed,\n\t\t\tsections: completeSection === void 0 ? transformed.sections : [completeSection],\n\t\t\tcontexts: runtimeContextSuppressed ? transformed.contexts.filter((entry) => requiredContexts.has(entry.name)) : transformed.contexts\n\t\t};\n";

const CONVERSATION_APPEND = "\t\t\tappend(record) {\n\t\t\t\tconst event = record.event;\n\t\t\t\tif (this.inputs.has(event.seq)) return \"none\";\n\t\t\t\tif (this.revised.size > 0) this.revised.clear();\n\t\t\t\tthis.inputs.set(event.seq, record);\n";

test("0.2.1 web-surface prompt: #32 neutralizes the product name, #53 drops identity and do-not-start", () => {
  const branded = WEB_PROMPT;
  assert.ok(branded.includes("DeepSeek Harness Web GUI"));
  const after32 = applyReplacementsToText(branded, patch(32)).text;
  assert.ok(!after32.includes("DeepSeek Harness Web GUI"));
  assert.ok(after32.includes("the local web GUI whose URL the runtime context names"));
  const after53 = applyReplacementsToText(after32, patch(53)).text;
  assert.ok(after53.includes("Local web GUI: its URL is named in the runtime context."));
  assert.ok(!after53.includes("Do not start a replacement server"));
  // legacy paragraph text inside the same file must survive: it is used to match old sessions.
  const legacy = 'suffix: "Do not start a replacement server unless the user asks; if one is needed, use a managed background job and verify its exact URL."';
  const kept = applyReplacementsToText(legacy, patch(53)).text;
  assert.equal(kept, legacy);
  // idempotent
  assert.equal(applyReplacementsToText(after53, patch(32)).changed, false);
  assert.equal(applyReplacementsToText(after53, patch(53)).changed, false);
});

test("0.2.1 complete preset still carries the dsh-purge inject after assemble", () => {
  const out = applyReplacementsToText(SYSTEM_PROMPT_ASSEMBLE, patch(40));
  assert.equal(out.changed, true);
  assert.ok(out.text.includes("const dshPurgeSections ="));
  // complete 模式：注入段排在官方段之前（普通分支保持宿主原顺序）。
  assert.ok(out.text.includes("[...dshPurgeSections, ...dshPurgeRest]"));
  assert.ok(out.text.includes("const requiredContexts = new Set("));
  assert.ok(out.text.includes("requiredContexts.has(entry.name)"));
  assert.equal(applyReplacementsToText(out.text, patch(40)).changed, false);
});

test("0.2.1 rewind marker drops sent messages on append", () => {
  const out = applyReplacementsToText(CONVERSATION_APPEND, patch(77));
  assert.equal(out.changed, true);
  assert.ok(out.text.includes("if (isRewindMarker(event)) {"));
  assert.ok(out.text.includes("return this.replaceWindow(entries, this.hasMore);"));
  assert.ok(out.text.includes("if (this.revised.size > 0) this.revised.clear();"));
  assert.equal(applyReplacementsToText(out.text, patch(77)).changed, false);
});

test("undo and chained patches declare their settle semantics", () => {
  assert.equal(patch(80).settleWhenAbsent, true);
  assert.equal(patch(88).chainedAfter, 87);
});

test("0.2.1 ask_user_question keeps the requested wait and caps only -1", () => {
  const src = "\t\tasync execute(args, exec) {\n\t\t\tconst timeout = validateTimeout(args.timeout ?? defaultTimeout);\n\t\t\tvalidateQuestionIds(args.questions);";
  const out = applyReplacementsToText(src, patch(89));
  assert.equal(out.changed, true);
  assert.ok(out.text.includes("args.timeout === -1 ? 300 : (args.timeout ?? defaultTimeout)"));
  assert.ok(!out.text.includes("const timeout = 1;"));
  assert.equal(applyReplacementsToText(out.text, patch(89)).changed, false);
});

// The responses path names its role variable `instructionRole`, not `role`.
// Pinning the real host text keeps the #57 anchor from silently drifting to a
// name no host version ever used — the failure mode is invisible because the
// patch is `optional`, so a miss still reports as applied.
const RESPONSES_INSTRUCTION_ROLE =
	'    const instructionRole = model.reasoning && compat?.supportsDeveloperRole !== false ? "developer" : "system";';

test("#57 responses anchor matches the real instructionRole line and gates on the gateway", () => {
  const out = applyReplacementsToText(RESPONSES_INSTRUCTION_ROLE, patch(57));
  assert.equal(out.changed, true);
  assert.ok(out.text.includes("const instructionRole = model.reasoning"));
  assert.ok(out.text.includes('includes("api.openai.com")'));
  assert.ok(out.text.includes('includes("azure.com")'));
  assert.ok(out.text.includes("// [dsh-purge] developer role allowlist: openai/azure"));
  // The rewrite must keep the role variable name, or the host stops compiling.
  assert.ok(out.text.includes('? "developer" : "system";'));
  assert.equal(applyReplacementsToText(out.text, patch(57)).changed, false);
});

test("#57 responses anchor leaves the vendor-native decision intact", () => {
  const apply = (baseUrl) =>
    eval(
      `((model, compat) => ${applyReplacementsToText(RESPONSES_INSTRUCTION_ROLE, patch(57)).text
        .trim()
        .replace(/^const instructionRole = /, "")
        .replace(/;\s*(\/\/.*)?$/, "")})`,
    )({ reasoning: true, baseUrl }, undefined);
  assert.equal(apply("https://api.openai.com/v1"), "developer");
  assert.equal(apply("https://foo.azure.com"), "developer");
  assert.equal(apply("https://gateway.example.com/v1"), "system");
  assert.equal(apply("https://relay.example.net/v1"), "system");
});

// --- #57: real-host verification and legacy upgrade -------------------------
// Everything above uses a single pinned line. The bug this guards against was
// invisible precisely because nobody ran the patch against the real file, so
// this block reads the installed host when it is available and checks the
// whole-file rewrite, its syntax, and idempotency.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const HOST_ROOTS = [
  process.env.PURGE_TEST_HOST,
  "/Applications/DeepSeek Harness.app/Contents/Resources/app/dsh/node_modules",
].filter(Boolean);

function responsesFile() {
  for (const root of HOST_ROOTS) {
    for (const base of [root, path.join(root, "@deepseek-ai")]) {
      const candidate = path.join(base, "@earendil-works/pi-ai/dist/api/openai-responses-shared.js");
      if (fs.existsSync(candidate)) return candidate;
      const direct = path.join(base, "pi-ai/dist/api/openai-responses-shared.js");
      if (fs.existsSync(direct)) return direct;
    }
  }
  return "";
}

function nodeCheck(source) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "purge-syntax-"));
  const file = path.join(dir, "probe.mjs");
  fs.writeFileSync(file, source);
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  fs.rmSync(dir, { recursive: true, force: true });
  return result;
}

test("#57 rewrites the real responses file, keeps it parseable, and is idempotent", () => {
  const file = responsesFile();
  if (!file) return; // host not installed on this machine: pinned-line tests still cover the shape
  const original = fs.readFileSync(file, "utf8");
  // The anchor must exist in the shipped file, not merely in our fixture.
  assert.ok(original.includes('const instructionRole = model.reasoning && compat?.supportsDeveloperRole !== false'));
  assert.equal(original.includes("const role = model.reasoning"), false);

  // The host may already be patched on a developer machine, so the assertion is
  // state-agnostic: either the rewrite happens now, or it happened in an earlier
  // apply and must be a no-op. Both states must stay parseable.
  const marked = original.includes("// [dsh-purge] developer role allowlist: openai/azure");
  const once = applyReplacementsToText(original, patch(57));
  assert.equal(once.changed, !marked, marked ? "already patched host must be a no-op" : "unpatched host must be rewritten");
  assert.ok(once.text.includes("// [dsh-purge] developer role allowlist: openai/azure"));
  assert.ok(once.text.includes("const instructionRole = model.reasoning"));
  assert.equal(nodeCheck(once.text).status, 0, "rewritten host file must still parse");
  assert.equal(applyReplacementsToText(once.text, patch(57)).changed, false, "a second apply must be a no-op");
});

test("#57 upgrades a file that still carries the old deepseek-only marker", () => {
  const legacy =
    '    const instructionRole = model.reasoning && compat?.supportsDeveloperRole !== false && !String(model.baseUrl || "").toLowerCase().includes("deepseek.com") ? "developer" : "system"; // [dsh-purge] deepseek.com keeps system role';
  const out = applyReplacementsToText(legacy, patch(57));
  assert.equal(out.changed, true);
  assert.ok(out.text.includes('includes("api.openai.com")'));
  assert.ok(out.text.includes("// [dsh-purge] developer role allowlist: openai/azure"));
  assert.equal(out.text.includes("deepseek.com"), false);
  assert.equal(applyReplacementsToText(out.text, patch(57)).changed, false);
});

test("#57 covers both pi-ai paths that decide the developer role", () => {
  const files = patch(57).file;
  assert.deepEqual([...files].sort(), ["pi-ai-completions", "pi-ai-responses-shared"]);
});

// --- DSH 0.2.2-alpha.3 -------------------------------------------------------
// 以下 fixture 逐字节抄自 alpha.3 原树；宿主改版必须同步改这里。

// dsh-sandbox/lib/index.js（bundle，tab）与 lib/types/escalation.js（tsc 产物，
// 四空格 + signal 后的尾逗号）。alpha.3 把 displayReason 从内联 {en,zh} 换成了
// escalationDisplayReason(mode, justification)。
const A3_ESCALATION_TAB =
  "\tconst outcome = await approval.approver.request({\n" +
  "\t\tagent: approval.agent,\n" +
  "\t\ttoolName: approval.toolName,\n" +
  "\t\tcallId: approval.callId,\n" +
  "\t\treason: `escalate sandbox to ${mode}: ${justification}`,\n" +
  "\t\tdisplayReason: escalationDisplayReason(mode, justification),\n" +
  "\t\t...approval.signal ? { signal: approval.signal } : {}\n" +
  "\t});";

const A3_ESCALATION_SPACES =
  "    const outcome = await approval.approver.request({\n" +
  "        agent: approval.agent,\n" +
  "        toolName: approval.toolName,\n" +
  "        callId: approval.callId,\n" +
  "        reason: `escalate sandbox to ${mode}: ${justification}`,\n" +
  "        displayReason: escalationDisplayReason(mode, justification),\n" +
  "        ...approval.signal ? { signal: approval.signal } : {},\n" +
  "    });";

// dsh-system-prompt/lib/index.js：早退与正式返回都带宿主补的 tools。
const A3_SYSTEM_PROMPT_ASSEMBLE =
  "\t\tconst transformed = await this.ctx.waterfall(scopeTarget(this, scope), \"system-prompt/assemble\", assembly, context, () => Promise.resolve(assembly));\n" +
  "\t\tif (completeSection === void 0 && !runtimeContextSuppressed) return {\n" +
  "\t\t\t...transformed,\n" +
  "\t\t\ttools\n" +
  "\t\t};\n" +
  "\t\tconst requiredContexts = new Set([...contextByName.values()].filter((entry) => entry.required === true).map((entry) => entry.name));\n" +
  "\t\treturn {\n" +
  "\t\t\t...transformed,\n" +
  "\t\t\ttools,\n" +
  "\t\t\tsections: completeSection === void 0 ? transformed.sections : [completeSection],\n" +
  "\t\t\tcontexts: runtimeContextSuppressed ? transformed.contexts.filter((entry) => requiredContexts.has(entry.name)) : transformed.contexts\n" +
  "\t\t};\n";

// dsh-agent-loop/lib/index.js：assemble 移进 try，参数改成对象展开。
const A3_PRESTEP_ASSEMBLE =
  "\t\tconst claimed = this.inbox.claim(target, position.turn);\n" +
  "\t\tconst selection = this.model.current();\n" +
  "\t\tconst toolSet = await this.loopCtx.tools.resolve({\n" +
  "\t\t\tagent: this,\n" +
  "\t\t\tmodelSelection: selection,\n" +
  "\t\t\tsignal\n" +
  "\t\t});\n" +
  "\t\ttry {\n" +
  "\t\t\tconst assembly = await this.loopCtx.systemPrompt.assemble({\n" +
  "\t\t\t\t...assembleContextFor(this, signal),\n" +
  "\t\t\t\tmodelSelection: selection,\n" +
  "\t\t\t\ttoolSet\n" +
  "\t\t\t});\n";

// dsh-agent-loop/lib/index.js：这两行被挪进 try，缩进 4 tab → 5 tab。
const A3_MESSAGES_GUARD =
  "\t\t\t\ttry {\n" +
  "\t\t\t\t\tif (turnEnds && decision.messages.length === 0) break;\n" +
  "\t\t\t\t\tif (phase.step === 0 && decision.messages.length === 0) {\n" +
  "\t\t\t\t\t\tturnEnds = { kind: \"completed\" };\n" +
  "\t\t\t\t\t\tbreak;\n" +
  "\t\t\t\t\t}\n";

test("#14 alpha.3 escalation: both indents keep the displayReason helper and the guard", () => {
  for (const [label, fixture, closing] of [
    ["bundle/tab", A3_ESCALATION_TAB, "\t}) : \"allowed-once\";"],
    ["types/spaces", A3_ESCALATION_SPACES, "    }) : \"allowed-once\";"],
  ]) {
    const out = applyReplacementsToText(fixture, patch(14));
    assert.equal(out.changed, true, `${label}: alpha.3 anchor must hit`);
    assert.ok(
      out.text.includes(
        "const outcome = approval.approver !== undefined && approval.agent !== undefined ? await approval.approver.request({",
      ),
      `${label}: missing approver/agent guard`,
    );
    // 正文原样带回：displayReason 的具体写法交给宿主，不再逐段抄。
    assert.ok(out.text.includes("displayReason: escalationDisplayReason(mode, justification),"), label);
    assert.ok(out.text.includes("reason: `escalate sandbox to ${mode}: ${justification}`,"), label);
    assert.ok(out.text.endsWith(closing), `${label}: closing indent must follow the host`);
    assert.equal(nodeCheck(out.text).status, 0, `${label}: patched escalation must still parse`);
    assert.equal(applyReplacementsToText(out.text, patch(14)).changed, false, `${label}: second apply must be a no-op`);
  }
});

test("#40 alpha.3 complete preset keeps the inject and both copies of tools", () => {
  const out = applyReplacementsToText(A3_SYSTEM_PROMPT_ASSEMBLE, patch(40));
  assert.equal(out.changed, true);
  // 宿主在 waterfall 之后补的 tools 两处都得在：早退分支与正式返回。
  assert.ok(out.text.includes("\t\t\t...transformed,\n\t\t\ttools\n\t\t};"), "early return must keep tools");
  assert.ok(out.text.includes("\t\t\t...transformed,\n\t\t\ttools,\n\t\t\tsections:"), "final return must keep tools");
  assert.ok(out.text.includes("const dshPurgeSections ="));
  assert.ok(out.text.includes("[...dshPurgeSections, ...dshPurgeRest]"));
  assert.ok(out.text.includes("requiredContexts.has(entry.name)"), "host context filtering must survive");
  // fixture 是片段：包一层 async 函数才能做语法检查。
  assert.equal(nodeCheck(`async function assemble() {\n${out.text}}\n`).status, 0);
  assert.equal(applyReplacementsToText(out.text, patch(40)).changed, false);

  // 直接执行打补丁后的这段真实代码：注入段与 tools 都必须在，上下文过滤语义不变。
  const start = out.text.indexOf("const requiredContexts");
  const endMarker = "\t\t};";
  const block = out.text.slice(start, out.text.lastIndexOf(endMarker) + endMarker.length);
  const run = new Function(
    "transformed",
    "completeSection",
    "runtimeContextSuppressed",
    "contextByName",
    "tools",
    block,
  );

  const purge = { name: "dsh-purge", text: "INJECT" };
  const toolsSection = { name: "tools", text: "TOOLS" };
  const complete = { name: "complete", text: "BASE" };
  const transformed = { sections: [toolsSection, purge, complete], contexts: [{ name: "req" }, { name: "opt" }] };
  const contextByName = new Map([
    ["req", { name: "req", required: true }],
    ["opt", { name: "opt" }],
  ]);
  const tools = [{ name: "bash" }];

  const completeKept = run(transformed, complete, false, contextByName, tools);
  assert.deepEqual(completeKept.sections.map((s) => s.name), ["dsh-purge", "tools", "complete"]);
  assert.equal(completeKept.tools, tools, "tools must pass through untouched");
  assert.deepEqual(completeKept.contexts.map((c) => c.name), ["req", "opt"]);

  const completeSuppressed = run(transformed, complete, true, contextByName, tools);
  assert.deepEqual(completeSuppressed.sections.map((s) => s.name), ["dsh-purge", "tools", "complete"]);
  assert.deepEqual(completeSuppressed.contexts.map((c) => c.name), ["req"]);

  const plain = run(transformed, undefined, false, contextByName, tools);
  assert.equal(plain.sections, transformed.sections, "plain mode must keep the host section order");
  assert.equal(plain.tools, tools);
});

test("#74 alpha.3 hangs the prepare hook before the nested assemble, exactly once", () => {
  const out = applyReplacementsToText(A3_PRESTEP_ASSEMBLE, patch(74));
  assert.equal(out.changed, true);
  const hook = out.text.indexOf("dshPurgePrepare(this.loopCtx)");
  const call = out.text.indexOf("const assembly = await this.loopCtx.systemPrompt.assemble({");
  assert.ok(hook > 0 && call > hook, "hook must precede the assemble call");
  // 必须落在装配用的 try 块内（开括号在钩子之前）。
  assert.ok(out.text.lastIndexOf("try {", hook) > 0, "hook must be inside the assemble try block");
  assert.equal(out.text.split("dshPurgePrepare(this.loopCtx)").length - 1, 1, "hook must be inserted once");
  // 宿主新传的字段不能被丢。
  assert.ok(out.text.includes("modelSelection: selection,\n\t\t\t\ttoolSet"));
  assert.ok(out.text.includes("const selection = this.model.current();"));
  // fixture 是片段且 try 未闭合：补上 catch 与函数外壳才能做语法检查。
  assert.equal(
    nodeCheck(`async function preStep() {\n${out.text}\t\t} catch (error) {\n\t\t\tthrow error;\n\t\t}\n}\n`).status,
    0,
  );
  assert.equal(applyReplacementsToText(out.text, patch(74)).changed, false, "skipIfMarked must stop a second insert");
});

test("#67 alpha.3 keeps the messages guard after the try nesting moved it", () => {
  const out = applyReplacementsToText(A3_MESSAGES_GUARD, patch(67));
  assert.equal(out.changed, true);
  assert.ok(out.text.includes("\t\t\t\t\tif (turnEnds && (decision.messages?.length ?? 0) === 0) break;"));
  assert.ok(out.text.includes("\t\t\t\t\tif (phase.step === 0 && (decision.messages?.length ?? 0) === 0) {"));
  assert.ok(!out.text.includes("decision.messages.length"), "no unguarded dereference may survive");
  // fixture 是循环体片段：包进 for(;;) 才能检查 break 的合法性。
  assert.equal(
    nodeCheck(`function run() {\nfor (;;) {\n${out.text}\t\t\t\t} catch (error) {\n\t\t\t\t\tthrow error;\n\t\t\t\t}\n}\n}\n`).status,
    0,
  );
  assert.equal(applyReplacementsToText(out.text, patch(67)).changed, false);

  // 缺省 messages 不再抛 TypeError；空数组与非空数组语义保持。
  const firstStart = out.text.indexOf("if (turnEnds");
  const cond1 = out.text.slice(firstStart + 4, out.text.indexOf(") break;", firstStart));
  const secondStart = out.text.indexOf("if (phase.step === 0", firstStart);
  const cond2 = out.text.slice(secondStart + 4, out.text.indexOf(") {", secondStart));
  const endsTurn = new Function("turnEnds", "decision", `return ${cond1};`);
  const firstStep = new Function("decision", "phase", `return ${cond2};`);
  assert.equal(Boolean(endsTurn(null, {})), false, "no pending turn end: keep stepping");
  assert.equal(endsTurn({ kind: "max-tokens" }, {}), true, "missing messages must end the turn instead of throwing");
  assert.equal(endsTurn({ kind: "max-tokens" }, { messages: [{ role: "user" }] }), false);
  assert.equal(firstStep({}, { step: 0 }), true);
  assert.equal(firstStep({ messages: [] }, { step: 0 }), true);
  assert.equal(firstStep({ messages: [{ role: "user" }] }, { step: 1 }), false);
  // 对照：宿主原文在这里会抛 TypeError，这就是 #67 存在的理由。
  const unguarded = new Function("turnEnds", "decision", "return turnEnds && decision.messages.length === 0;");
  assert.throws(() => unguarded({ kind: "max-tokens" }, {}), TypeError);
});

// 整文件回归：fixture 只能证明"我抄的那几行还对"，证明不了真宿主文件里只有一处、
// 补完还能跑。这段在本机存在宿主树时读真文件，找不到就跳过（CI 无宿主机）。
function hostFile(...candidates) {
  const roots = [
    process.env.PURGE_TEST_HOST,
    path.join(path.dirname(new URL(import.meta.url).pathname), "..", "..", "dsh-baseline-host"),
    "/Applications/DeepSeek Harness.app/Contents/Resources/app/dsh/node_modules/@deepseek-ai",
  ].filter(Boolean);
  for (const root of roots) {
    for (const rel of candidates) {
      const file = path.join(root, rel);
      if (fs.existsSync(file)) return { root, file };
    }
  }
  return undefined;
}

const REAL_HOST_TARGETS = [
  {
    id: 14,
    file: ["@deepseek-ai/dsh-sandbox/lib/index.js", "dsh-sandbox/lib/index.js", "packages/sandbox/sandbox/lib/index.js"],
    ids: [13, 14],
    ok: (text) => text.includes("approval.approver !== undefined && approval.agent !== undefined ? await approval.approver.request({"),
  },
  {
    id: 40,
    file: ["@deepseek-ai/dsh-system-prompt/lib/index.js", "dsh-system-prompt/lib/index.js", "packages/core/system-prompt/lib/index.js"],
    ids: [40],
    ok: (text) => text.includes("[...dshPurgeSections, ...dshPurgeRest]"),
  },
  {
    id: 74,
    file: ["@deepseek-ai/dsh-agent-loop/lib/index.js", "dsh-agent-loop/lib/index.js", "packages/core/agent-loop/lib/index.js"],
    ids: [74],
    ok: (text) => text.split("dshPurgePrepare(this.loopCtx)").length - 1 === 1,
  },
  {
    id: 67,
    file: ["@deepseek-ai/dsh-agent-loop/lib/index.js", "dsh-agent-loop/lib/index.js", "packages/core/agent-loop/lib/index.js"],
    ids: [67],
    ok: (text) => text.includes("(decision.messages?.length ?? 0) === 0"),
  },
];

test("alpha.3 real host files: anchors hit the shipped source, once, and stay parseable", (t) => {
  const seen = new Set();
  for (const target of REAL_HOST_TARGETS) {
    const found = hostFile(...target.file);
    if (!found) return t.skip("no host tree on this machine");
    if (seen.has(`${found.file}:${target.id}`)) continue;
    seen.add(`${found.file}:${target.id}`);

    const original = fs.readFileSync(found.file, "utf8");
    let once = original;
    for (const id of target.ids) once = applyReplacementsToText(once, patch(id)).text;
    // 开发者机器上的宿主可能已被「应用」过：那时第一次就应当是 no-op。
    if (once === original) {
      assert.ok(target.ok(original), `#${target.id}: file already carries the patch but not our marker`);
    }
    assert.ok(target.ok(once), `#${target.id}: ${found.file} did not receive the patch`);
    assert.equal(nodeCheck(once).status, 0, `#${target.id}: patched ${found.file} must still parse`);
    let twice = once;
    for (const id of target.ids) twice = applyReplacementsToText(twice, patch(id)).text;
    assert.equal(twice, once, `#${target.id}: a second apply must be a no-op`);
  }
});
