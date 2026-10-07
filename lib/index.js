import { installWebServer } from "./http.js";
import {
  renderStatus,
  rejectIfNeedPrompt,
  handlePurgeCommand,
  handleRulesCommand,
  handleSkillsCommand,
} from "./commands.js";
import {
  promptAllowed,
  validatePromptScope,
  withoutPurgeSections,
} from "./prompt-policy.js";
import * as core from "./core.js";
import * as hostctl from "./host.js";
import * as rules from "./rules.js";
import * as updater from "./update.js";
import {
  GLOBAL_PROMPT_ORDER,
  isMnemonPluginMessage,
  rewritePromptAssembly,
} from "./identity.js";
import * as rewind from "./rewind.js";

export const name = "dsh-purge";

export const inject = ["systemPrompt", "tools"];

const DEFAULTS = {
  enabled: true,
  autoApplyOnStart: false,
  autoUpdateOnStart: false,
  autoRevertOnMissing: false,
  injectOnce: false,
  stripMnemon: false,
  promptScope: "root",
  rewindEnabled: false,
  allowHostMutation: false,
  postPrompt: "",
  postPromptOrder: 5100,
  verbose: false,
  autoRetry: true,
  retryMax: 3,
  autoContinue: true,
  continueMax: 3,
  continueText: "继续",
};

const log = (config, ...args) => {
  if (config?.verbose) console.log("[dsh-purge]", ...args);
};

export function registerPromptSections(ctx, config, _injectFile) {
  ctx.systemPrompt.section({
    name: "dsh-purge",
    order: GLOBAL_PROMPT_ORDER,
    text: (context) => {
      if (!promptAllowed(config, context)) return "";
      return rules.resolveInjectText(core.findDshHome()).text;
    },
  });

  const postPrompt =
    typeof config.postPrompt === "string" ? config.postPrompt.trim() : "";
  if (!postPrompt) return;
  if (
    !Number.isFinite(config.postPromptOrder) ||
    config.postPromptOrder <= GLOBAL_PROMPT_ORDER
  ) {
    throw new TypeError(
      `postPromptOrder must be a finite number greater than ${GLOBAL_PROMPT_ORDER}`,
    );
  }
  ctx.systemPrompt.section({
    name: "dsh-purge:post",
    order: config.postPromptOrder,
    text: (context) => (promptAllowed(config, context) ? postPrompt : ""),
  });
}

function readInjectFallback() {
  return rules.resolveInjectText(core.findDshHome()).text;
}

function installMnemonMessageStrip(ctx, config = {}) {
  if (config.stripMnemon === false) return;
  if (typeof ctx.on !== "function") return;
  if (ctx.__dshPurgeMnemonStrip) return;
  ctx.__dshPurgeMnemonStrip = true;
  const wrap = async (_payload, next) => {
    const decision = await next();
    if (!decision || !Array.isArray(decision.messages)) return decision;
    const messages = decision.messages.filter(
      (message) => !isMnemonPluginMessage(message),
    );
    if (messages.length === decision.messages.length) return decision;
    return { ...decision, messages };
  };
  const late = () => {
    try {
      ctx.on("agent/pre-step", wrap, { global: true, prepend: true });
    } catch {}
  };
  late();
  queueMicrotask(late);
  setTimeout(late, 1500);
}

function installIdentityOverride(ctx, config = {}) {
  if (typeof ctx.on !== "function") return;
  if (ctx.__dshPurgeAssembleHook) return;
  ctx.__dshPurgeAssembleHook = true;
  const hook = async (_assembly, context, next) => {
    const assembled = typeof next === "function" ? await next() : _assembly;
    if (!promptAllowed(config, context, assembled))
      return withoutPurgeSections(assembled);
    const enabled = config.enabled !== false;
    const inject = enabled ? readInjectFallback() : "";
    return rewritePromptAssembly(assembled, {
      fallbackInject: inject,
      dropMnemon: config.stripMnemon !== false,
      dropPurgeAfterFold: false,
      context,
    });
  };
  // 只挂一次。不改 contexts，不改 pre-step 白名单，梁神 phase-1 和其它插件的消息原样保留。
  ctx.on("system-prompt/assemble", hook, { global: true, prepend: true });
}

function shimNeedsPatch(state) {
  if (hostctl.currentSurface() === "desktop") return false;
  return (
    state.shim_cmd === "original" ||
    state.shim_ps1 === "original" ||
    state.shim_bin === "original"
  );
}

async function autoApply(config) {
  if (config.autoApplyOnStart === false) return "disabled";
  try {
    core.applyRuntimeEnv();
    const sanitized = core.sanitizeDesktopCommandRuntimes();
    if (sanitized.length)
      log(config, "desktop runtime sanitized:", JSON.stringify(sanitized));

    const state = await core.gatherState();
    await core.installOverride(state.dsh_home, false);
    if (!state.ai_base) {
      log(config, "skip auto-apply: plugin root not found");
      return "skip:plugin_root_not_found";
    }
    try {
      const flash = core.silenceCmdFlash(state.ai_base);
      log(config, "cmd-flash:", JSON.stringify(flash));
      if (!flash.ok) log(config, "cmd-flash incomplete:", flash.entry);
    } catch (e) {
      log(config, "cmd-flash failed:", String(e));
    }

    if (state.patches_pending === 0) {
      if (config.autoApplyOnStart && shimNeedsPatch(state)) {
        await core.patchAllShims();
        core.silenceCmdFlash(state.ai_base);
        log(config, "auto-apply: patches clean, shim refreshed");
        return "already_clean:shim_patched";
      }
      log(config, "auto-apply: already clean");
      return "already_clean";
    }
    if (!config.autoApplyOnStart) {
      log(config, "auto-apply disabled");
      return "disabled";
    }
    await core.backupAll(state.ai_base);
    const report = await core.applyPatches(state.ai_base);
    await core.patchAllShims();
    const flash = core.silenceCmdFlash(state.ai_base);
    const applied = report.filter((r) => r.status === "applied").length;
    log(
      config,
      `auto-apply done: ${applied} applied; cmd-flash=${flash.entry} ok=${flash.ok}`,
    );
    return flash.ok
      ? `applied:${applied}`
      : `applied:${applied}:cmd_flash_incomplete`;
  } catch (e) {
    console.warn("[dsh-purge] auto-apply error:", String(e));
    return `error:${e}`;
  }
}

export function apply(ctx, config) {
  const cfg = { ...DEFAULTS, ...(config || {}) };
  validatePromptScope(cfg);
  if (!cfg.enabled) return;
  log(cfg, "plugin enabled");

  // 关闭自动应用时，启动和延迟任务均不得写入宿主、profile 或客户端文件。
  if (cfg.autoApplyOnStart !== false && cfg.allowHostMutation !== false) {
    try {
      core.ensureHiddenConsole();
      core.applyRuntimeEnv();
      core.sanitizeDesktopCommandRuntimes();
      core.seedOverrideSync(core.findDshHome());
    } catch (error) {
      console.warn("[dsh-purge] startup:", String(error));
    }
    setImmediate(() => {
      autoApply(cfg).then((result) => log(cfg, "auto-apply:", result));
      rules
        .ensureInitialState(core.findDshHome())
        .catch((error) =>
          console.warn("[dsh-purge] rules init:", String(error)),
        );
    });
  }
  if (cfg.autoUpdateOnStart !== false && cfg.allowHostMutation !== false) {
    setImmediate(() =>
      updater
        .autoUpdateIfNeeded()
        .catch((error) =>
          console.warn("[dsh-purge] auto-update:", String(error)),
        ),
    );
  }

  installIdentityOverride(ctx, cfg);
  installMnemonMessageStrip(ctx, cfg);
  const injectFile = core.findOverrideFile(core.findDshHome());
  registerPromptSections(ctx, cfg, injectFile);

  // 继续/重试先关掉，需要时再打开下面这段。
  // continuePluginCfg = cfg;
  // savedContinueSettings = continueRetry.loadSettings(core.findDshHome());
  // try { continueRuntime?.dispose?.(); } catch { /* ignore */ }
  // continueRuntime = continueRetry.installContinueRetry(ctx, { getConfig: currentContinueConfig });

  const commands = ctx.get?.("commands");
  if (commands) {
    commands.register({
      name: "purge",
      description:
        "dsh 指令权威性清洗（status/apply/revert/uninstall/edit/help）",
      input: { hint: "status | apply | revert | uninstall | edit | help" },
      handler: async (invocation) =>
        handlePurgeCommand(invocation.rawInput ?? "", cfg),
    });
    commands.register({
      name: "rules",
      description:
        "规则集切换（写入 AGENTS.md/CLAUDE.md）: list | use <id> | create <id> [别名] [目标] | delete <id> | reset | help",
      input: {
        hint: "list | use <id> | create <id> [别名] [目标] | delete <id> | reset | help",
      },
      handler: async (invocation) =>
        handleRulesCommand(invocation.rawInput ?? ""),
    });
    commands.register({
      name: "skills",
      description:
        "官方用户 Skill（$DSH_HOME/skills）：list | import <路径> | create <id> [说明] | delete <id> | help",
      input: {
        hint: "list | import <路径> | create <id> [说明] | delete <id> | help",
      },
      handler: async (invocation) =>
        handleSkillsCommand(invocation.rawInput ?? ""),
    });
    commands.register({
      name: "rewind",
      description:
        "回退：子代理直接回退一次；主代理 /rewind once 或 /rewind round",
      input: { hint: "once | round" },
      handler: async (invocation) => {
        if (cfg.rewindEnabled === false)
          return {
            kind: "error",
            text: "purge 回退已停用，请使用 Tavern 原生回退。",
          };
        const sessionId = rewind.invocationSessionId(invocation);
        const arg =
          String(invocation.rawInput || "")
            .trim()
            .split(/\s+/)[0]
            ?.toLowerCase() || "";
        const info = await rewind.analyzeRewind(ctx, sessionId);
        if (
          info.ok &&
          info.kind === "main" &&
          arg !== "once" &&
          arg !== "round"
        ) {
          return {
            kind: "success",
            text: "主代理请选择：/rewind once 回退一次，/rewind round 回退上一轮（含本轮子代理）。",
          };
        }
        const mode = arg === "round" ? "round" : "once";
        const result = await rewind.applyRewind(ctx, sessionId, mode);
        if (!result.ok) return { kind: "error", text: result.error };
        return {
          kind: "success",
          text:
            mode === "round"
              ? "已回退上一轮。正在打开新的主会话，上一句已填回输入框。"
              : "已回退一次。正在打开新会话，上一句已填回输入框。",
        };
      },
    });
    // commands.register({
    //   name: "continue",
    //   description: "异常停止或中断后发送继续（计入继续次数）",
    //   input: { hint: "继续当前异常停止的会话" },
    //   handler: async (invocation) => {
    //     const sessionId = rewind.invocationSessionId(invocation);
    //     const agent = continueRetry.resolveAgent(ctx, sessionId);
    //     if (!agent || !continueRuntime) return { kind: "error", text: "当前会话不能继续" };
    //     const result = continueRuntime.continueNow(agent);
    //     if (!result.ok) return { kind: "error", text: result.error };
    //     return { kind: "success", text: `已发送继续（${result.used}/${result.max}）` };
    //   },
    // });
  }

  if (ctx.tools) {
    ctx.tools.register({
      name: "purge_status",
      description: `查看 dsh 指令权威性清洗状态（${core.ALL_PATCHES.length} patch 清洗进度、shim 注入、override 文件）。`,
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {},
      },
      output: {
        schema: {
          type: "object",
          additionalProperties: false,
          properties: { text: { type: "string" } },
        },
        render: (_args, value) => [
          { type: "text", text: String(value?.text ?? "") },
        ],
      },
      async execute() {
        const state = await core.gatherState();
        return { text: renderStatus(state) };
      },
    });
    ctx.tools.register({
      name: "purge_apply",
      description: `应用 dsh 指令权威性清洗：${core.ALL_PATCHES.length} patch（提示词层+代码默认+引擎级审批/沙箱绕过）+ shim 注入 + override 文件。需重启 dsh 完全生效。`,
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {},
      },
      output: {
        schema: {
          type: "object",
          additionalProperties: false,
          properties: { text: { type: "string" } },
        },
        render: (_args, value) => [
          { type: "text", text: String(value?.text ?? "") },
        ],
      },
      async execute() {
        if (cfg.allowHostMutation === false)
          return { text: "ERROR: 宿主修改已停用" };
        core.applyRuntimeEnv();
        const scrubbed = core.sanitizeDesktopCommandRuntimes();
        const state = await core.gatherState();
        if (!state.ai_base)
          return { text: "ERROR: " + core.missingAiBaseMessage() };
        const blocked = rejectIfNeedPrompt(state.dsh_home);
        if (blocked) return { text: "ERROR: " + blocked.error };
        await core.backupAll(state.ai_base);
        const report = await core.applyPatches(state.ai_base);
        await core.patchAllShims();
        const flash = core.silenceCmdFlash(state.ai_base);
        const applied = report.filter((r) => r.status === "applied").length;
        const already = report.filter((r) => r.status === "already").length;
        const scrubNote = scrubbed.length
          ? ` desktop_scrub=${scrubbed.length}`
          : "";
        return {
          text: `清洗完成 / applied=${applied}, already=${already}.${scrubNote} phase-1=${flash.phase1} 重启 dsh 生效.`,
        };
      },
    });
    ctx.tools.register({
      name: "purge_revert",
      description:
        "回滚 dsh 指令权威性清洗到备份原件（保留 prompt-inject.md 用户文件）。",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {},
      },
      output: {
        schema: {
          type: "object",
          additionalProperties: false,
          properties: { text: { type: "string" } },
        },
        render: (_args, value) => [
          { type: "text", text: String(value?.text ?? "") },
        ],
      },
      async execute() {
        if (cfg.allowHostMutation === false)
          return { text: "ERROR: 宿主修改已停用" };
        const state = await core.gatherState();
        const lines = [];
        if (state.ai_base) {
          const { reverted, errors } = await core.revertAll(state.ai_base);
          lines.push(
            `reverted=${reverted.length}${errors.length ? ` errors=${errors.length}` : ""}`,
          );
        }
        const shimRevert = await core.revertAllShims();
        lines.push(`shim_dirs=${Object.keys(shimRevert).length}`);
        return { text: `回滚完成 / ${lines.join(", ")}. 重启 dsh 恢复.` };
      },
    });
  }

  installWebServer(ctx, cfg);
}

const plugin = {
  name,
  inject,
  apply,
};

export default plugin;
