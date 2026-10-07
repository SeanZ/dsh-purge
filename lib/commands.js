import fs from "node:fs";
import * as core from "./core.js";
import * as hostctl from "./host.js";
import * as rules from "./rules.js";
import * as skills from "./skills.js";
import * as uninstaller from "./uninstall.js";

function fsExists(fp) {
  return fs.existsSync(fp);
}

function line(title, value, ok = null) {
  const mark = ok === null ? "·" : ok ? "✓" : "✗";
  return `${mark} ${title}: ${value}`;
}

export function renderStatus(state) {
  const out = [];
  out.push("dsh-purge 状态 / Status");
  out.push(line("宿主 / surface", state.surface || hostctl.currentSurface()));
  out.push(line("DSH_HOME", state.dsh_home));
  if (state.desktop_install)
    out.push(line("桌面安装 / desktop", state.desktop_install));
  if (state.ai_base) {
    out.push(line("插件根 / plugin root", state.ai_base));
    for (const [key, fp] of Object.entries(state.files)) {
      out.push(`    ${fsExists(fp) ? "✓" : "✗"} ${key.padEnd(22)} ${fp}`);
    }
  } else {
    out.push(line("插件根 / plugin root", core.missingAiBaseMessage(), false));
  }
  out.push(
    line("shim 目录", state.shim_dir || "未定位 / not found", !!state.shim_dir),
  );
  if (state.desktop_runtimes?.length) {
    out.push(
      line(
        "Desktop runtime",
        `${state.desktop_runtimes.length} sealed (shim OK; bak external)`,
        true,
      ),
    );
    for (const d of state.desktop_runtimes) out.push(`    · ${d}`);
  }
  out.push(
    line(
      "备份 / backup",
      state.has_backup ? "有 / yes" : "无 / no",
      state.has_backup,
    ),
  );
  out.push(line("注入文件 / inject", state.override_path));
  out.push(line("注入状态 / override", state.override_status));
  out.push("");
  out.push(
    `补丁 / patches: ${state.patches_applied}/${core.ALL_PATCHES.length} applied, ${state.patches_pending} pending`,
  );
  for (const p of core.ALL_PATCHES) {
    const s = state.patch_status[p.id];
    const mark = s === "applied" ? "✓" : s === "pending" ? "✗" : "·";
    out.push(
      `  ${mark} [#${String(p.id).padEnd(2)}] ${p.name.padEnd(30)} ${p.layer}/${p.layer_en} — ${s}`,
    );
  }
  out.push("");
  out.push(
    `shim: dsh.cmd=${state.shim_cmd}  dsh.ps1=${state.shim_ps1}  dsh=${state.shim_bin}`,
  );
  return out.join("\n");
}

export function injectSnapshot(dshHome = core.findDshHome()) {
  const resolved = rules.resolveInjectText(dshHome);
  return {
    injectSource: resolved.source,
    injectRuleId: resolved.ruleId,
    needPrompt: resolved.source === "none",
  };
}

/** 以设置页文本框为准；空框且没有启用中的规则集则必须补提示词。 */
function injectSnapshotFromBox(dshHome, boxText) {
  if (typeof boxText !== "string") return injectSnapshot(dshHome);
  if (core.normalizeOverride(boxText)) {
    return { injectSource: "prompt", injectRuleId: null, needPrompt: false };
  }
  const ruleId = rules.activeRuleId(dshHome);
  if (core.normalizeOverride(rules.activeRuleText(dshHome))) {
    return { injectSource: "rule", injectRuleId: ruleId, needPrompt: false };
  }
  return { injectSource: "none", injectRuleId: ruleId, needPrompt: true };
}

const NEED_PROMPT_ERROR = "提示词和规则集都是空的，必须先添加提示词";

export function rejectIfNeedPrompt(dshHome, boxText) {
  const snap = injectSnapshotFromBox(dshHome, boxText);
  if (!snap.needPrompt) return null;
  return { ...snap, error: NEED_PROMPT_ERROR };
}

export async function handlePurgeCommand(rawInput, config) {
  const args = (rawInput || "").trim().split(/\s+/).filter(Boolean);
  const sub = (args[0] || "status").toLowerCase();

  if (
    config.allowHostMutation === false &&
    ["apply", "a", "revert", "r", "uninstall", "remove"].includes(sub)
  ) {
    return { kind: "error", text: "宿主修改已停用，请通过部署制品升级。" };
  }

  switch (sub) {
    case "status":
    case "s": {
      const state = await core.gatherState();
      return { kind: "success", text: renderStatus(state) };
    }
    case "apply":
    case "a": {
      core.applyRuntimeEnv();
      const scrubbed = core.sanitizeDesktopCommandRuntimes();
      const state = await core.gatherState();
      if (!state.ai_base) {
        return { kind: "error", text: core.missingAiBaseMessage() };
      }
      const blocked = rejectIfNeedPrompt(state.dsh_home);
      if (blocked) return { kind: "error", text: blocked.error };
      await core.backupAll(state.ai_base);
      const report = await core.applyPatches(state.ai_base);
      const shimResult = await core.patchAllShims();
      const flash = core.silenceCmdFlash(state.ai_base);
      const lines = report.map((r) => {
        const m =
          r.status === "applied"
            ? "✓ 已清洗"
            : r.status === "already"
              ? "- 已是最新"
              : r.status === "missing_file"
                ? "⚠ 文件缺失"
                : `✗ ${r.status}`;
        return `  ${m} patch #${String(r.patch_id).padEnd(2)} ${r.name}`;
      });
      lines.push("", "shim:");
      for (const [dir, st] of Object.entries(shimResult)) {
        lines.push(
          `  · ${dir} → ${typeof st === "object" ? JSON.stringify(st) : st}`,
        );
      }
      lines.push(
        `  cmd-flash=${flash.entry} phase-1=${flash.phase1} ok=${flash.ok}`,
      );
      if (scrubbed.length) {
        lines.push("", "Desktop in-bin .bak scrub:");
        for (const row of scrubbed)
          lines.push(`  ✓ ${row.dir} → ${row.cleaned.join(", ")}`);
      }
      lines.push(
        "",
        "全部完成 / All done。重启 dsh 生效 / Restart dsh to take effect.",
      );
      lines.push(
        "Desktop: host-commands 密封目录只清理不注入；bak 禁止写进 bin（issue #9）。",
      );
      return { kind: "success", text: lines.join("\n") };
    }
    case "revert":
    case "r": {
      const state = await core.gatherState();
      const lines = [];
      if (state.ai_base) {
        const { reverted, errors } = await core.revertAll(state.ai_base);
        lines.push(...reverted.map((p) => `  ✓ 已还原 / Reverted ${p}`));
        for (const [p, e] of errors) lines.push(`  ⚠ 还原失败 ${p}: ${e}`);
        if (reverted.length === 0)
          lines.push("  - 没有补丁备份可还原 / no patch backup");
      }
      const shimRevert = await core.revertAllShims();
      for (const [dir, st] of Object.entries(shimRevert)) {
        lines.push(
          `  shim ${dir}: ${typeof st === "object" ? JSON.stringify(st) : st}`,
        );
      }
      lines.push(
        "",
        "回滚完成 / Revert done。重启 dsh 后恢复 / restart to restore.",
      );
      lines.push(
        "注: prompt-inject.md 保留（用户文件）/ prompt-inject.md kept (user file)",
      );
      return { kind: "success", text: lines.join("\n") };
    }
    case "uninstall":
    case "remove": {
      const result = await uninstaller.uninstallPurge();
      const lines = [];
      if (result.applied) lines.push("已检测到补丁，已还原回原版。");
      else lines.push("未检测到已应用补丁，仍会清除插件文件。");
      if (result.patches) {
        lines.push(`  还原文件 ${result.patches.reverted?.length || 0} 个`);
      }
      if (result.override?.removed)
        lines.push(`  已删除 ${result.override.path}`);
      if (result.stripped?.length)
        lines.push(`  已从 profile 移除: ${result.stripped.join(", ")}`);
      if (result.errors?.length) {
        for (const e of result.errors) lines.push(`  ⚠ ${e}`);
      }
      lines.push("", "请重启 dsh。重启后插件不再加载。");
      return { kind: result.ok ? "success" : "error", text: lines.join("\n") };
    }
    case "edit":
    case "e": {
      const state = await core.gatherState();
      const r = core.editOverride(state.dsh_home);
      if (!r.ok && r.needCreate) {
        await core.installOverride(state.dsh_home, true);
        const r2 = core.editOverride(state.dsh_home);
        return {
          kind: "success",
          text: `已创建默认注入文件并打开编辑器：${r2.path}\n重启 dsh 生效。`,
        };
      }
      return {
        kind: "success",
        text: `已打开 ${r.editor} 编辑注入文件：${r.path}\n编辑完成后重启 dsh 生效。`,
      };
    }
    case "help":
    case "h":
    default:
      return {
        kind: "success",
        text:
          "dsh-purge 命令：\n" +
          "  /purge status     显示状态\n" +
          "  /purge apply      应用全部清洗（提示词+代码+shim+override）\n" +
          "  /purge revert     回滚还原\n" +
          "  /purge uninstall  卸载插件（已应用则先还原）\n" +
          "  /purge edit       编辑注入文件 prompt-inject.md\n" +
          "  /purge help       显示帮助\n" +
          "规则集切换见 /rules（list | use <id> | create | delete | reset）\n" +
          "官方 Skill 安装见 /skills（list | import <路径> | create <id> [说明] | delete <id>）",
      };
  }
}

function renderRulesStatus(st) {
  const out = [];
  out.push("规则集 / Rule Sets");
  out.push(`  存储目录 / store  ${st.rules_dir}`);
  const targetLine = st.active
    ? `${st.agents_path} (${st.active_target})`
    : "(无激活)";
  out.push(
    `  目标文件 / target ${targetLine} — exists=${st.agents_exists}, synced=${st.agents_synced}`,
  );
  out.push("");
  if (st.rules.length === 0) {
    out.push("  (暂无规则 / no rules — 用 /rules create <id> 或设置页新建)");
  }
  for (const r of st.rules) {
    const isActive = r.id === st.active;
    const label = r.name !== r.id ? `${r.name} (${r.id})` : r.id;
    out.push(
      `  ${isActive ? "▶" : "·"} ${label}${isActive ? " ★ 当前" : ""} [${r.target}] (${rules.formatSize(r.size)})`,
    );
  }
  return out.join("\n");
}

export async function handleRulesCommand(rawInput) {
  const args = (rawInput || "").trim().split(/\s+/).filter(Boolean);
  const sub = (args[0] || "list").toLowerCase();
  const dshHome = core.findDshHome();

  switch (sub) {
    case "list":
    case "ls":
    case "s":
      return {
        kind: "success",
        text: renderRulesStatus(await rules.rulesStatus(dshHome)),
      };
    case "use":
    case "activate":
    case "u": {
      const id = args[1];
      if (!id) return { kind: "error", text: "用法: /rules use <id>" };
      try {
        const meta = await rules.activateRule(dshHome, id);
        return {
          kind: "success",
          text: `✓ 已激活规则 ${meta.name}（${id}）→ 写入 ${rules.targetPath(dshHome, meta.target)}，并注入 systemPrompt。新会话生效。`,
        };
      } catch (e) {
        return { kind: "error", text: `激活失败: ${e.message}` };
      }
    }
    case "create":
    case "new":
    case "c": {
      const id = args[1];
      if (!id)
        return {
          kind: "error",
          text: "用法: /rules create <id> [别名] [AGENTS.md|CLAUDE.md]",
        };
      const name = args[2] || id;
      const target = args[3] || "AGENTS.md";
      if (!rules.validTarget(target)) {
        return {
          kind: "error",
          text: `无效目标: ${target}（只能是 AGENTS.md 或 CLAUDE.md）`,
        };
      }
      try {
        await rules.saveRule(dshHome, id, "", { name, target });
        return {
          kind: "success",
          text: `✓ 已创建规则 ${name}（${id} → ${target}）。在设置页「规则设定」编辑内容后保存。`,
        };
      } catch (e) {
        return { kind: "error", text: `创建失败: ${e.message}` };
      }
    }
    case "delete":
    case "rm":
    case "d": {
      const id = args[1];
      if (!id) return { kind: "error", text: "用法: /rules delete <id>" };
      try {
        await rules.deleteRule(dshHome, id);
        return { kind: "success", text: `✓ 已删除规则 ${id}。` };
      } catch (e) {
        return { kind: "error", text: `删除失败: ${e.message}` };
      }
    }
    case "reset":
    case "restore":
    case "还原": {
      try {
        const r = await rules.resetToOriginal(dshHome);
        const lines = [];
        if (r.removed.length > 0)
          lines.push(`✓ 已删除插件写入的目标文件: ${r.removed.join(", ")}`);
        if (r.skipped.length > 0) {
          lines.push(
            `⚠ 跳过（文件内容与规则不一致，可能被手动修改）: ${r.skipped.join(", ")}`,
          );
        }
        lines.push(
          "已清空激活状态。规则库内容保留，随时可重新激活。现在回到出厂状态：无全局指令。",
        );
        return { kind: "success", text: lines.join("\n") };
      } catch (e) {
        return { kind: "error", text: `还原失败: ${e.message}` };
      }
    }
    case "help":
    case "h":
    default:
      return {
        kind: "success",
        text:
          "规则集命令：\n" +
          "  /rules list                         列出所有规则\n" +
          "  /rules use <id>                     激活规则（写入 AGENTS.md/CLAUDE.md，并注入 systemPrompt）\n" +
          "  /rules create <id> [别名] [目标]     新建规则\n" +
          "  /rules delete <id>                  删除规则\n" +
          "  /rules reset                        还原原始状态\n" +
          "  /rules help                         显示帮助",
      };
  }
}

function renderSkillsStatus(st) {
  const out = [];
  out.push("官方用户 Skill / $DSH_HOME/skills");
  out.push(`  ${st.skills_dir}`);
  out.push(
    "  插件只安装目录。调用走官方：任务对上 description/whenToUse 时模型调 skill 工具；聊天输入 /名称 立即加载。",
  );
  out.push(
    "  正文里写「激活」不会触发。官方认 name、description、whenToUse、disable-model-invocation、user-invocable。",
  );
  out.push("");
  if (!st.skills.length) {
    out.push(
      "  (暂无用户 Skill — 用 /skills import <压缩包或文件夹> 或设置页导入)",
    );
    return out.join("\n");
  }
  for (const item of st.skills) {
    const mark = item.valid ? "·" : "!";
    const desc = item.description || "(无说明)";
    const how = item.valid
      ? [
          item.userInvocable ? `/${item.id}` : "不可 /名称",
          item.modelInvocable ? "模型可调" : "模型不可调",
        ].join(" · ")
      : "";
    out.push(
      `  ${mark} ${item.id}  ${desc}  (${skills.formatSize(item.size)})`,
    );
    if (how) out.push(`      ${how}`);
    if (!item.valid && item.error) out.push(`      ${item.error}`);
  }
  return out.join("\n");
}

export async function handleSkillsCommand(rawInput) {
  const args = (rawInput || "").trim().split(/\s+/).filter(Boolean);
  const sub = (args[0] || "list").toLowerCase();
  const dshHome = core.findDshHome();

  switch (sub) {
    case "list":
    case "ls":
    case "s":
      return {
        kind: "success",
        text: renderSkillsStatus(await skills.skillsStatus(dshHome)),
      };
    case "create":
    case "new":
    case "c": {
      const id = args[1];
      if (!id)
        return { kind: "error", text: "用法: /skills create <id> [说明]" };
      if (!skills.validSkillName(id)) {
        return {
          kind: "error",
          text: "id 必须是 kebab-case，例如 code-review",
        };
      }
      const description = args.slice(2).join(" ").trim() || id;
      try {
        const saved = skills.toPublicSkill(
          dshHome,
          await skills.saveSkill(dshHome, id, "", description),
        );
        return {
          kind: "success",
          text: `✓ 已写入官方目录 ${saved.path}\n新会话会进官方 Skill 目录；任务对上或输入 /${id} 时由官方加载。`,
        };
      } catch (e) {
        return { kind: "error", text: `安装失败: ${e.message}` };
      }
    }
    case "import":
    case "i": {
      const src = args.slice(1).join(" ").trim();
      if (!src)
        return { kind: "error", text: "用法: /skills import <压缩包或文件夹>" };
      try {
        const packed = await skills.importFromPath(dshHome, src);
        const names = packed.imported.map((item) => item.id).join(", ");
        return {
          kind: "success",
          text: `✓ 已导入到官方 $DSH_HOME/skills：${names}`,
        };
      } catch (e) {
        return { kind: "error", text: `导入失败: ${e.message}` };
      }
    }
    case "delete":
    case "rm":
    case "d": {
      const id = args[1];
      if (!id) return { kind: "error", text: "用法: /skills delete <id>" };
      try {
        const removed = skills.toPublicSkill(
          dshHome,
          await skills.deleteSkill(dshHome, id),
        );
        return {
          kind: "success",
          text: `✓ 已从官方目录删除 ${id}${removed.backup ? `\n备份：${removed.backup}` : ""}`,
        };
      } catch (e) {
        return { kind: "error", text: `删除失败: ${e.message}` };
      }
    }
    case "help":
    case "h":
    default:
      return {
        kind: "success",
        text:
          "官方 Skill 安装：\n" +
          "  /skills list                 列出 $DSH_HOME/skills\n" +
          "  /skills create <id> [说明]   写入 <id>/SKILL.md\n" +
          "  /skills import <路径>        导入压缩包或文件夹到官方目录\n" +
          "  /skills delete <id>          删除该目录（官方会从目录拿掉）\n" +
          "  也可自己删 $DSH_HOME/skills/<id>\n" +
          "  调用：聊天输入 /<id>，或让模型按 description 调 skill 工具\n" +
          "  不注入 systemPrompt，不替代提示词",
      };
  }
}
