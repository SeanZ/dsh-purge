import * as core from "./core.js";
import * as hostctl from "./host.js";
import * as rules from "./rules.js";
import * as skills from "./skills.js";
import * as updater from "./update.js";
import * as rewind from "./rewind.js";
import * as uninstaller from "./uninstall.js";
import { injectSnapshot, rejectIfNeedPrompt } from "./commands.js";
let webTreeReady = false;

function watchWebTreeReady(ctx) {
  // 必须挂在 connection 上再 await，与官方打印 URL 同一时刻。
  // apply() 里立刻 await 会在后续入口尚未入树时提前结束，session.list 仍是空的。
  const mark = () => {
    webTreeReady = true;
  };
  if (typeof ctx?.inject !== "function") {
    mark();
    return;
  }
  try {
    ctx.inject(["connection"], (host) => {
      const settled = host.get?.("loader")?.await?.();
      if (!settled || typeof settled.then !== "function") {
        mark();
        return;
      }
      settled.then(() => {
        if (
          host.get?.("webServer") !== undefined &&
          host.get?.("connection") !== undefined
        )
          mark();
      }, mark);
    });
  } catch {
    mark();
  }
}

function headerOf(request, name) {
  const headers = request?.headers;
  if (!headers) return "";
  const value = headers[name] ?? headers[String(name).toLowerCase()];
  if (Array.isArray(value)) return String(value[0] || "");
  return String(value || "");
}

function denyCrossOrigin(response) {
  response.writeHead(403, {
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify({ ok: false, error: "cross-origin blocked" }));
}

function allowPluginRequest(request, response) {
  const site = headerOf(request, "sec-fetch-site").toLowerCase();
  if (site === "cross-site") {
    denyCrossOrigin(response);
    return false;
  }
  const origin = headerOf(request, "origin").trim();
  if (origin === "null") {
    denyCrossOrigin(response);
    return false;
  }
  if (!origin) return true;
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    denyCrossOrigin(response);
    return false;
  }
  const host = headerOf(request, "host").trim();
  if (!host || originHost.toLowerCase() !== host.toLowerCase()) {
    denyCrossOrigin(response);
    return false;
  }
  return true;
}

export function installWebServer(ctx, cfg) {
  // 桌面端内嵌 @deepseek-ai/dsh-web-app，设置页同样走 webServer（常见 43120），不是只给官方 dsh web。
  watchWebTreeReady(ctx);
  ctx.inject(["webServer"], (host) => {
    host.effect(() => {
      const registerPluginRoute = (spec, label) =>
        host.webServer.register(
          {
            ...spec,
            handler: async (request, response) => {
              if (!allowPluginRequest(request, response)) return;
              if (
                cfg.allowHostMutation === false &&
                [
                  "/dsh-purge/apply",
                  "/dsh-purge/revert",
                  "/dsh-purge/uninstall",
                  "/dsh-purge/restart",
                  "/dsh-purge/update",
                ].includes(spec.path)
              ) {
                sendJson(response, 403, {
                  ok: false,
                  code: "PURGE_HOST_MUTATION_DISABLED",
                  error: "宿主修改已停用",
                });
                return;
              }
              if (
                cfg.rewindEnabled === false &&
                spec.path.startsWith("/dsh-purge/rewind")
              ) {
                sendJson(response, 403, {
                  ok: false,
                  code: "PURGE_REWIND_DISABLED",
                  error: "purge 回退已停用",
                });
                return;
              }
              return spec.handler(request, response);
            },
          },
          label,
        );
      registerPluginRoute(
        {
          kind: "exact",
          path: "/dsh-purge/status",
          handler: async (request, response) => {
            if (request.method !== "GET") {
              response.writeHead(405, { allow: "GET" });
              response.end();
              return;
            }
            try {
              if (!webTreeReady) {
                sendJson(response, 503, { ok: false, ready: false });
                return;
              }
              const state = await core.gatherState();
              const patch_names = {};
              for (const p of core.ALL_PATCHES)
                patch_names[String(p.id)] = p.name;
              sendJson(response, 200, {
                ok: true,
                ready: true,
                surface: state.surface || hostctl.currentSurface(),
                ai_base: state.ai_base,
                desktop_install: state.desktop_install || "",
                missing_ai_base: state.ai_base
                  ? ""
                  : core.missingAiBaseMessage(),
                patches_applied: state.patches_applied,
                patches_pending: state.patches_pending,
                patches_skipped: state.patches_skipped || 0,
                patches_total: core.ALL_PATCHES.length,
                patch_status: state.patch_status,
                patch_names,
                shim_cmd: state.shim_cmd,
                shim_ps1: state.shim_ps1,
                shim_bin: state.shim_bin,
                has_backup: state.has_backup,
                override_status: state.override_status,
                override_path: state.override_path,
                dsh_home: state.dsh_home,
                allowHostMutation: cfg.allowHostMutation !== false,
                rewindEnabled: cfg.rewindEnabled !== false,
                promptScope: cfg.promptScope,
                plugin_version: updater.localVersion(),
                update: updater.lastUpdateResult(),
                ...updater.channelPublic(),
                ...(await skills
                  .skillsStatus(core.findDshHome())
                  .catch(() => ({ skills: [] }))),
              });
            } catch (e) {
              sendJson(response, 500, { ok: false, error: String(e) });
            }
          },
        },
        "dsh-purge: status",
      );
      registerPluginRoute(
        {
          kind: "exact",
          path: "/dsh-purge/last-user",
          handler: async (request, response) => {
            if (request.method !== "GET") {
              response.writeHead(405, { allow: "GET" });
              response.end();
              return;
            }
            try {
              const url = new URL(request.url, "http://127.0.0.1");
              const sessionId = String(
                url.searchParams.get("sessionId") || "",
              ).trim();
              sendJson(
                response,
                200,
                await rewind.readLastUserText(ctx, sessionId),
              );
            } catch (e) {
              sendJson(response, 500, { ok: false, error: String(e) });
            }
          },
        },
        "dsh-purge: last user",
      );
      registerPluginRoute(
        {
          kind: "exact",
          path: "/dsh-purge/rewind/options",
          handler: async (request, response) => {
            if (request.method !== "GET") {
              response.writeHead(405, { allow: "GET" });
              response.end();
              return;
            }
            try {
              const url = new URL(request.url, "http://127.0.0.1");
              const sessionId = String(
                url.searchParams.get("sessionId") || "",
              ).trim();
              sendJson(
                response,
                200,
                await rewind.analyzeRewind(ctx, sessionId),
              );
            } catch (e) {
              sendJson(response, 500, { ok: false, error: String(e) });
            }
          },
        },
        "dsh-purge: rewind options",
      );
      registerPluginRoute(
        {
          kind: "exact",
          path: "/dsh-purge/rewind",
          handler: async (request, response) => {
            if (request.method === "GET") {
              try {
                const url = new URL(request.url, "http://127.0.0.1");
                const sessionId = url.searchParams.get("sessionId");
                if (sessionId) {
                  const draft = rewind.takeDraft(sessionId);
                  sendJson(response, 200, { ok: true, ...(draft || {}) });
                  return;
                }
                const pending = rewind.getPending();
                sendJson(response, 200, { ok: true, ...(pending || {}) });
              } catch (e) {
                sendJson(response, 500, { ok: false, error: String(e) });
              }
              return;
            }
            if (request.method === "POST") {
              try {
                const body = await readJsonBody(request);
                const sessionId = String(body?.sessionId || "").trim();
                if (!sessionId) {
                  sendJson(response, 400, {
                    ok: false,
                    error: "需要 sessionId",
                  });
                  return;
                }
                const mode = body?.mode === "round" ? "round" : "once";
                const result = await rewind.applyRewind(ctx, sessionId, mode);
                sendJson(response, result.ok ? 200 : 409, result);
              } catch (e) {
                sendJson(response, 500, { ok: false, error: String(e) });
              }
              return;
            }
            response.writeHead(405, { allow: "GET, POST" });
            response.end();
          },
        },
        "dsh-purge: rewind",
      );
      // registerPluginRoute({
      //   kind: "exact",
      //   path: "/dsh-purge/continue",
      //   handler: async (request, response) => {
      //     if (request.method === "GET") {
      //       try {
      //         const url = new URL(request.url, "http://127.0.0.1");
      //         const sessionId = String(url.searchParams.get("sessionId") || "").trim();
      //         sendJson(response, 200, continueStatusPayload(ctx, sessionId));
      //       } catch (e) {
      //         sendJson(response, 500, { ok: false, error: String(e) });
      //       }
      //       return;
      //     }
      //     if (request.method === "POST") {
      //       try {
      //         const body = await readJsonBody(request);
      //         const sessionId = String(body?.sessionId || "").trim();
      //         if (!sessionId) {
      //           sendJson(response, 400, { ok: false, error: "需要 sessionId" });
      //           return;
      //         }
      //         const agent = continueRetry.resolveAgent(ctx, sessionId);
      //         if (!agent || !continueRuntime) {
      //           sendJson(response, 409, { ok: false, error: "当前会话不能继续" });
      //           return;
      //         }
      //         const result = continueRuntime.continueNow(agent, { force: Boolean(body?.force) });
      //         sendJson(response, result.ok ? 200 : 409, result);
      //       } catch (e) {
      //         sendJson(response, 500, { ok: false, error: String(e) });
      //       }
      //       return;
      //     }
      //     response.writeHead(405, { allow: "GET, POST" });
      //     response.end();
      //   },
      // }, "dsh-purge: continue");
      // registerPluginRoute({
      //   kind: "exact",
      //   path: "/dsh-purge/continue/settings",
      //   handler: async (request, response) => {
      //     if (request.method === "GET") {
      //       try {
      //         sendJson(response, 200, { ok: true, ...currentContinueConfig() });
      //       } catch (e) {
      //         sendJson(response, 500, { ok: false, error: String(e) });
      //       }
      //       return;
      //     }
      //     if (request.method === "POST") {
      //       try {
      //         const body = await readJsonBody(request);
      //         savedContinueSettings = await continueRetry.saveSettings(core.findDshHome(), {
      //           ...currentContinueConfig(),
      //           ...body,
      //         });
      //         sendJson(response, 200, { ok: true, ...currentContinueConfig() });
      //       } catch (e) {
      //         sendJson(response, 500, { ok: false, error: String(e) });
      //       }
      //       return;
      //     }
      //     response.writeHead(405, { allow: "GET, POST" });
      //     response.end();
      //   },
      // }, "dsh-purge: continue settings");
      registerPluginRoute(
        {
          kind: "exact",
          path: "/dsh-purge/update",
          handler: async (request, response) => {
            if (request.method === "GET") {
              try {
                sendJson(response, 200, await updater.checkUpdate());
              } catch (e) {
                sendJson(response, 500, { ok: false, error: String(e) });
              }
              return;
            }
            if (request.method === "POST") {
              try {
                const body = await readJsonBody(request);
                sendJson(
                  response,
                  200,
                  await updater.handleUpdateOp(body || {}),
                );
              } catch (e) {
                sendJson(response, 500, { ok: false, error: String(e) });
              }
              return;
            }
            response.writeHead(405, { allow: "GET, POST" });
            response.end();
          },
        },
        "dsh-purge: update",
      );
      registerPluginRoute(
        {
          kind: "exact",
          path: "/dsh-purge/apply",
          handler: async (request, response) => {
            if (request.method !== "POST") {
              response.writeHead(405, { allow: "POST" });
              response.end();
              return;
            }
            try {
              core.applyRuntimeEnv();
              const scrubbed = core.sanitizeDesktopCommandRuntimes();
              const state = await core.gatherState();
              if (!state.ai_base) {
                sendJson(response, 500, {
                  ok: false,
                  error: core.missingAiBaseMessage(),
                });
                return;
              }
              const body = await readJsonBody(request);
              const ui = await core.readOverrideForUi(state.dsh_home);
              const boxText =
                typeof body?.content === "string" ? body.content : ui.content;
              const blocked = rejectIfNeedPrompt(state.dsh_home, boxText);
              if (blocked) {
                sendJson(response, 400, {
                  ok: false,
                  needPrompt: true,
                  override_content: boxText,
                  defaultContent: ui.defaultContent,
                  ...blocked,
                });
                return;
              }
              if (typeof body?.content === "string") {
                await core.saveOverrideContent(state.dsh_home, body.content);
              }
              await core.backupAll(state.ai_base);
              const report = await core.applyPatches(state.ai_base);
              const override = await core.readOverrideForUi(state.dsh_home);
              const shim = await core.patchAllShims();
              const flash = core.silenceCmdFlash(state.ai_base);
              const summary = core.summarizeApplyReport(report);
              const complete = summary.failed.length === 0 && flash.ok === true;
              sendJson(response, 200, {
                ok: true,
                complete,
                applied: summary.applied,
                already: summary.already,
                failed: summary.failed.length,
                failed_items: summary.failed.map((r) => ({
                  id: r.patch_id,
                  name: r.name,
                  status: r.status,
                })),
                report: report.map((r) => ({
                  id: r.patch_id,
                  name: r.name,
                  status: r.status,
                })),
                override_content: override.content,
                defaultContent: override.defaultContent,
                ...injectSnapshot(state.dsh_home),
                override_path: override.path,
                override_installed: override.installed,
                shim,
                desktop_scrubbed: scrubbed,
                cmd_flash: flash,
              });
            } catch (e) {
              sendJson(response, 500, { ok: false, error: String(e) });
            }
          },
        },
        "dsh-purge: apply",
      );
      registerPluginRoute(
        {
          kind: "exact",
          path: "/dsh-purge/revert",
          handler: async (request, response) => {
            if (request.method !== "POST") {
              response.writeHead(405, { allow: "POST" });
              response.end();
              return;
            }
            try {
              const state = await core.gatherState();
              const result = {};
              if (state.ai_base) {
                const { reverted, errors } = await core.revertAll(
                  state.ai_base,
                );
                result.reverted = reverted.length;
                result.errors = errors.length;
              }
              result.shim = await core.revertAllShims();
              sendJson(response, 200, {
                ok: true,
                ...result,
                note: "重启 dsh 恢复; prompt-inject.md 保留",
              });
            } catch (e) {
              sendJson(response, 500, { ok: false, error: String(e) });
            }
          },
        },
        "dsh-purge: revert",
      );
      registerPluginRoute(
        {
          kind: "exact",
          path: "/dsh-purge/uninstall",
          handler: async (request, response) => {
            if (request.method !== "POST") {
              response.writeHead(405, { allow: "POST" });
              response.end();
              return;
            }
            try {
              const result = await uninstaller.uninstallPurge();
              sendJson(response, result.ok ? 200 : 500, {
                ...result,
                surface: hostctl.currentSurface(),
                fullApp: hostctl.currentSurface() === "desktop",
                note: result.ok ? hostctl.restartNote() : undefined,
              });
              if (result.ok) {
                uninstaller.scheduleCleanupRestart({
                  request,
                  cleanup: result.cleanup,
                  ctx,
                });
              }
            } catch (e) {
              sendJson(response, 500, {
                ok: false,
                error: String(e && e.message ? e.message : e),
              });
            }
          },
        },
        "dsh-purge: uninstall",
      );
      registerPluginRoute(
        {
          kind: "exact",
          path: "/dsh-purge/override",
          handler: async (request, response) => {
            if (request.method === "GET") {
              try {
                const home = core.findDshHome();
                const ui = await core.readOverrideForUi(home);
                sendJson(response, 200, {
                  ok: true,
                  ...ui,
                  ...injectSnapshot(home),
                });
              } catch (e) {
                sendJson(response, 500, { ok: false, error: String(e) });
              }
              return;
            }
            if (request.method === "POST") {
              try {
                const body = await readJsonBody(request);
                const content =
                  typeof body?.content === "string" ? body.content : null;
                if (content === null) {
                  sendJson(response, 400, {
                    ok: false,
                    error: "content must be a string",
                  });
                  return;
                }
                const home = core.findDshHome();
                const blocked = rejectIfNeedPrompt(home, content);
                if (blocked) {
                  sendJson(response, 400, {
                    ok: false,
                    content,
                    ...blocked,
                  });
                  return;
                }
                const saved = await core.saveOverrideContent(home, content);
                sendJson(response, 200, {
                  ok: true,
                  ...saved,
                  ...injectSnapshot(home),
                });
              } catch (e) {
                sendJson(response, 500, { ok: false, error: String(e) });
              }
              return;
            }
            response.writeHead(405, { allow: "GET, POST" });
            response.end();
          },
        },
        "dsh-purge: override",
      );
      installRulesHttp(host.webServer);
      installSkillsHttp(host.webServer);
      registerPluginRoute(
        {
          kind: "exact",
          path: "/dsh-purge/restart",
          handler: async (request, response) => {
            if (request.method !== "POST") {
              response.writeHead(405, { allow: "POST" });
              response.end();
              return;
            }
            try {
              const surface = hostctl.currentSurface();
              hostctl.scheduleRestart(request, ctx);
              sendJson(response, 200, {
                ok: true,
                surface,
                fullApp: surface === "desktop",
                note: hostctl.restartNote(),
              });
            } catch (e) {
              sendJson(response, 500, { ok: false, error: String(e) });
            }
          },
        },
        "dsh-purge: restart",
      );
    }, "dsh-purge: http routes");
  });
}

function methodNotAllowed(request, response, allow) {
  if (allow.includes(request.method)) return false;
  response.writeHead(405, { allow: allow.join(", ") });
  response.end();
  return true;
}

async function handleRulesOp(op, body, queryId) {
  const dshHome = core.findDshHome();
  const id = typeof body?.id === "string" ? body.id : String(queryId || "");
  if (op === "status") {
    return { ok: true, ...(await rules.rulesStatus(dshHome)) };
  }
  if (op === "read") {
    if (!rules.validRuleId(id))
      return { status: 400, ok: false, error: "invalid id" };
    const content = await rules.readRule(dshHome, id);
    if (content === null)
      return { status: 404, ok: false, error: `rule not found: ${id}` };
    const meta = await rules.readRuleMeta(dshHome, id);
    return { ok: true, id, name: meta.name, target: meta.target, content };
  }
  if (op === "save") {
    const content = typeof body?.content === "string" ? body.content : null;
    if (!rules.validRuleId(id) || content === null) {
      return {
        status: 400,
        ok: false,
        error: "id and content (string) required",
      };
    }
    await rules.saveRule(dshHome, id, content, {
      name: typeof body?.name === "string" ? body.name : undefined,
      target: typeof body?.target === "string" ? body.target : undefined,
    });
    return { ok: true, id, ...injectSnapshot(dshHome) };
  }
  if (op === "activate") {
    if (!rules.validRuleId(id))
      return { status: 400, ok: false, error: "invalid id" };
    const meta = await rules.activateRule(dshHome, id);
    return {
      ok: true,
      id,
      name: meta.name,
      target: meta.target,
      agents_path: rules.targetPath(dshHome, meta.target),
      note: "已写入目标文件并注入 systemPrompt，新会话生效",
      ...injectSnapshot(dshHome),
    };
  }
  if (op === "delete") {
    if (!rules.validRuleId(id))
      return { status: 400, ok: false, error: "invalid id" };
    await rules.deleteRule(dshHome, id);
    return { ok: true, id };
  }
  if (op === "reset") {
    const r = await rules.resetToOriginal(dshHome);
    return { ok: true, ...r, note: "已还原出厂状态（无全局指令）；规则库保留" };
  }
  return { status: 400, ok: false, error: `unknown op: ${op}` };
}

function rulesHttpHandler(forcedOp) {
  return async (request, response) => {
    if (request.method === "OPTIONS") {
      sendOptions(response);
      return;
    }
    try {
      const url = new URL(request.url ?? "", "http://127.0.0.1");
      const tail = url.pathname
        .replace(/^\/dsh-purge\/rules\/?/, "")
        .replace(/\/$/, "");
      let body = {};
      if (request.method === "POST") body = await readJsonBody(request);
      else if (
        methodNotAllowed(
          request,
          response,
          forcedOp ? ["GET", "POST"] : ["GET", "POST"],
        )
      )
        return;
      const op = forcedOp || body.op || tail || "status";
      const result = await handleRulesOp(op, body, url.searchParams.get("id"));
      sendJson(response, result.status || 200, result);
    } catch (e) {
      sendJson(response, 500, {
        ok: false,
        error: String(e && e.message ? e.message : e),
      });
    }
  };
}

async function handleSkillsOp(op, body, queryId) {
  const dshHome = core.findDshHome();
  const id = typeof body?.id === "string" ? body.id : String(queryId || "");
  if (op === "status") {
    return { ok: true, ...(await skills.skillsStatus(dshHome)) };
  }
  if (op === "read") {
    if (!skills.validSkillName(id))
      return { status: 400, ok: false, error: "invalid skill name" };
    const item = await skills.readSkill(dshHome, id);
    if (!item)
      return { status: 404, ok: false, error: `skill not found: ${id}` };
    return { ok: true, ...skills.toPublicSkill(dshHome, item) };
  }
  if (op === "save") {
    if (!skills.validSkillName(id))
      return {
        status: 400,
        ok: false,
        error: "id 必须是 kebab-case，例如 code-review",
      };
    const content = typeof body?.content === "string" ? body.content : "";
    const description =
      typeof body?.description === "string" ? body.description : "";
    const saved = await skills.saveSkill(dshHome, id, content, description);
    return { ok: true, ...skills.toPublicSkill(dshHome, saved) };
  }
  if (op === "delete") {
    if (!skills.validSkillName(id))
      return { status: 400, ok: false, error: "invalid skill name" };
    const removed = await skills.deleteSkill(dshHome, id);
    return { ok: true, ...skills.toPublicSkill(dshHome, removed) };
  }
  if (op === "import") {
    if (body?.path || body?.source || body?.folder) {
      return {
        status: 400,
        ok: false,
        error: "请在本机选择压缩包或文件夹导入",
      };
    }
    if (typeof body?.data === "string" && body.data.trim()) {
      const packed = await skills.importArchive(
        dshHome,
        Buffer.from(body.data, "base64"),
        body.name || "skill.zip",
      );
      return { ok: true, ...packed };
    }
    if (Array.isArray(body?.files) && body.files.length) {
      const packed = await skills.importFileTree(
        dshHome,
        body.files,
        body.name || "",
      );
      return { ok: true, ...packed };
    }
    return { status: 400, ok: false, error: "请选择压缩包或文件夹" };
  }
  return { status: 400, ok: false, error: `unknown op: ${op}` };
}

function skillsHttpHandler(forcedOp) {
  return async (request, response) => {
    if (request.method === "OPTIONS") {
      sendOptions(response);
      return;
    }
    if (request.method !== "GET" && request.method !== "POST") {
      response.writeHead(405, { allow: "GET, POST, OPTIONS" });
      response.end();
      return;
    }
    try {
      const url = new URL(request.url ?? "", "http://127.0.0.1");
      const tail = skillRouteTail(url.pathname);
      const body =
        request.method === "POST"
          ? await readJsonBody(request, 14 * 1024 * 1024)
          : {};
      const op =
        forcedOp ||
        body.op ||
        tail ||
        url.searchParams.get("op") ||
        (url.searchParams.get("id") ? "read" : "status");
      const result = await handleSkillsOp(op, body, url.searchParams.get("id"));
      sendJson(response, result.status || 200, result);
    } catch (e) {
      sendJson(response, 500, {
        ok: false,
        error: String(e && e.message ? e.message : e),
      });
    }
  };
}

function skillRouteTail(pathname) {
  const match = String(pathname || "").match(
    /^\/dsh-purge\/skills?(?:\/(.*))?$/i,
  );
  if (!match) return "";
  return String(match[1] || "").replace(/\/$/, "");
}

function installSkillsHttp(webServer) {
  const stop = [];
  const add = (spec) => stop.push(registerRoute(webServer, spec));
  for (const routePath of ["/dsh-purge/skills", "/dsh-purge/skill"]) {
    add({ kind: "exact", path: routePath, handler: skillsHttpHandler("") });
  }
  add({
    kind: "prefix",
    path: "/dsh-purge/skills",
    handler: skillsHttpHandler(""),
  });
  for (const op of ["status", "read", "save", "delete", "import"]) {
    add({
      kind: "exact",
      path: `/dsh-purge/skills/${op}`,
      handler: skillsHttpHandler(op),
    });
    add({
      kind: "exact",
      path: `/dsh-purge/skill/${op}`,
      handler: skillsHttpHandler(op),
    });
  }
  return () => {
    for (let i = stop.length - 1; i >= 0; i -= 1) {
      try {
        stop[i]?.();
      } catch {
        /* ignore */
      }
    }
  };
}

function installRulesHttp(webServer) {
  const stop = [];
  stop.push(
    registerRoute(webServer, {
      kind: "exact",
      path: "/dsh-purge/rules",
      handler: rulesHttpHandler(""),
    }),
  );
  stop.push(
    registerRoute(webServer, {
      kind: "prefix",
      path: "/dsh-purge/rules",
      handler: rulesHttpHandler(""),
    }),
  );
  for (const op of ["status", "read", "save", "activate", "delete", "reset"]) {
    stop.push(
      registerRoute(webServer, {
        kind: "exact",
        path: `/dsh-purge/rules/${op}`,
        handler: rulesHttpHandler(op),
      }),
    );
  }
  return () => {
    for (let i = stop.length - 1; i >= 0; i -= 1) {
      try {
        stop[i]?.();
      } catch {
        /* ignore */
      }
    }
  };
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

function sendOptions(response) {
  response.writeHead(204, { "cache-control": "no-store" });
  response.end();
}

function registerRoute(webServer, spec) {
  try {
    const handler = spec.handler;
    return webServer.register({
      ...spec,
      handler: async (request, response) => {
        if (!allowPluginRequest(request, response)) return;
        return handler(request, response);
      },
    });
  } catch (e) {
    console.warn(
      "[dsh-purge] route",
      spec?.path,
      String(e && e.message ? e.message : e),
    );
    return () => {};
  }
}

async function readJsonBody(request, maxBytes = 512 * 1024) {
  const chunks = [];
  let size = 0;
  const limit =
    Number.isFinite(maxBytes) && maxBytes > 0 ? maxBytes : 512 * 1024;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > limit) throw new Error("request body too large");
    chunks.push(buffer);
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  return JSON.parse(raw);
}
