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
  assert.ok(out.text.includes("[...dshPurgeRest, ...dshPurgeSections]"));
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


// --- 0.2.2-alpha.2 anchors (#14 / #40 / #74) ---------------------------------
// 下面三段是从官方 alpha.2 原树里逐字节抄出来的真实片段；alpha.2 改了这三处的
// 内部写法，旧锚点全部落空，而它们的兄弟规则仍然命中 —— 于是出现
// 「前置检查已删、后续调用没改」这种部分应用状态（#14 直接 TypeError）。
// 片段改了就说明宿主又变了，必须和补丁表一起更新，这正是这几条测试的意义。
const ALPHA2_ESCALATION_REQUEST = `	const outcome = await approval.approver.request({
		agent: approval.agent,
		toolName: approval.toolName,
		callId: approval.callId,
		reason: \`escalate sandbox to \${mode}: \${justification}\`,
		displayReason: escalationDisplayReason(mode, justification),
		...approval.signal ? { signal: approval.signal } : {}
	});`;

const ALPHA2_SYSTEM_PROMPT_ASSEMBLE = `		const transformed = await this.ctx.waterfall(scopeTarget(this, scope), "system-prompt/assemble", assembly, context, () => Promise.resolve(assembly));
		if (completeSection === void 0 && !runtimeContextSuppressed) return {
			...transformed,
			tools
		};
		const requiredContexts = new Set([...contextByName.values()].filter((entry) => entry.required === true).map((entry) => entry.name));
		return {
			...transformed,
			tools,
			sections: completeSection === void 0 ? transformed.sections : [completeSection],
			contexts: runtimeContextSuppressed ? transformed.contexts.filter((entry) => requiredContexts.has(entry.name)) : transformed.contexts
		};`;

const ALPHA2_PRESTEP_ASSEMBLE = `		try {
			const assembly = await this.loopCtx.systemPrompt.assemble({
				...assembleContextFor(this, signal),`;

test("alpha.2 #14: displayReason 变成函数调用后仍锁得住调用头/尾", () => {
  const out = applyReplacementsToText(ALPHA2_ESCALATION_REQUEST, patch(14));
  assert.equal(out.changed, true, "alpha.2 的 approver.request 必须命中");
  assert.ok(out.text.includes("approval.approver !== undefined && approval.agent !== undefined ? await approval.approver.request({"));
  assert.ok(out.text.includes('}) : "allowed-once";'));
  // 中间正文必须原样带走：改错一个语言就会让升级请求走错分支。
  assert.ok(out.text.includes("displayReason: escalationDisplayReason(mode, justification),"));
  assert.equal(applyReplacementsToText(out.text, patch(14)).changed, false, "第二次应用必须是 no-op");
});

test("#14 的正文再变也不丢锚点（只锁调用头与收尾）", () => {
  // 上游再加一种语言/换 displayReason 组织方式时，旧的两条精确锚点会落空。
  const future = ALPHA2_ESCALATION_REQUEST.replace(
    "displayReason: escalationDisplayReason(mode, justification),",
    "displayReason: escalationDisplayReason(mode, justification, { locale: true }), // 9th locale",
  );
  const out = applyReplacementsToText(future, patch(14));
  assert.equal(out.changed, true);
  assert.ok(out.text.includes("9th locale"));
  assert.ok(out.text.includes('}) : "allowed-once";'));
});

test("alpha.2 #40: complete 分支保住注入，并且绝不丢 tools", () => {
  const out = applyReplacementsToText(ALPHA2_SYSTEM_PROMPT_ASSEMBLE, patch(40));
  assert.equal(out.changed, true, "alpha.2 的 assemble 返回结构必须命中");
  assert.ok(out.text.includes("const dshPurgeSections ="));
  assert.ok(out.text.includes("[...dshPurgeRest, ...dshPurgeSections]"));
  assert.ok(out.text.includes("requiredContexts.has(entry.name)"));
  // tools 是 alpha.2 新增字段，落在 waterfall 之外；丢掉它模型收不到任何工具声明。
  assert.ok(out.text.includes("return { ...transformed, tools };"), "早退分支必须带上 tools");
  assert.ok(/\n\t\t\ttools,\n/.test(out.text), "完整分支必须带上 tools");
  assert.equal(applyReplacementsToText(out.text, patch(40)).changed, false);
});

test("alpha.2 #74: 装配头两行之前挂上 prepare 钩子，且只挂一次", () => {
  const out = applyReplacementsToText(ALPHA2_PRESTEP_ASSEMBLE, patch(74));
  assert.equal(out.changed, true, "alpha.2 的 preStep 装配调用必须命中");
  const hook = out.text.indexOf("dshPurgePrepare(this.loopCtx)");
  const assemble = out.text.indexOf("const assembly = await this.loopCtx.systemPrompt.assemble({");
  assert.ok(hook > 0 && assemble > hook, "钩子必须排在 assemble 之前");
  assert.equal(out.text.split("dshPurgePrepare(this.loopCtx)").length - 1, 1);
  assert.equal(applyReplacementsToText(out.text, patch(74)).changed, false);
});
