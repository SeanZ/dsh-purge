import { h, NS, translate, apiJson, useState, useEffect, useRef, Component } from "./common.js";
import { REWIND_CSS } from "./rewind-styles.js";
const DRAFT_KEY = "dshp-rewind-draft:";
const ARM_KEY = "dshp-rewind-arm:";
const FILL_DELAYS = [0, 50, 180];
const ARM_TTL_MS = 45 * 1000;
let rewindSeenAt = 0;
let rewindSessions = null;
let rewindHost = null;
let pendingComposer = { sessionId: "", text: "", at: 0 };
let armedFill = { sessionId: "", text: "", at: 0 };

function rewindText(t, key, fallback) {
  try {
    if (typeof t === "function") {
      const value = t(key);
      if (value && value !== key) return value;
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

function currentSessionId(sessions) {
  try {
    return sessions?.list?.getSnapshot?.()?.current || "";
  } catch {
    return "";
  }
}

function isPluginDraft(text) {
  const value = String(text || "").trim();
  if (!value) return false;
  return (
    /^\[MNEMON\]/i.test(value) || /MNEMON RUNTIME MEMORY SNAPSHOT/i.test(value) || /^MNEMON VIEW TOOLS/im.test(value)
  );
}

function writeDraft(sessionId, text) {
  if (!sessionId) return;
  const value = isPluginDraft(text) ? "" : text || "";
  pendingComposer = { sessionId, text: value, at: Date.now() };
  try {
    sessionStorage.setItem(DRAFT_KEY + sessionId, value);
  } catch {
    /* ignore */
  }
}

function peekDraft(sessionId) {
  if (!sessionId) return "";
  if (pendingComposer.sessionId === sessionId && pendingComposer.text) return pendingComposer.text;
  try {
    return sessionStorage.getItem(DRAFT_KEY + sessionId) || "";
  } catch {
    return "";
  }
}

function clearStoredDraft(sessionId) {
  if (!sessionId) return;
  if (pendingComposer.sessionId === sessionId) pendingComposer = { sessionId: "", text: "", at: 0 };
  try {
    sessionStorage.removeItem(DRAFT_KEY + sessionId);
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.removeItem(ARM_KEY + sessionId);
  } catch {
    /* ignore */
  }
}

function armComposerFill(sessionId, text) {
  if (!sessionId || !text || isPluginDraft(text)) return;
  const at = Date.now();
  armedFill = { sessionId, text, at };
  writeDraft(sessionId, text);
  try {
    sessionStorage.setItem(ARM_KEY + sessionId, String(at));
  } catch {
    /* ignore */
  }
}

function takeArmedFill(sessionId) {
  if (!sessionId) return "";
  let text = "";
  let at = 0;
  if (armedFill.sessionId === sessionId && armedFill.text) {
    text = armedFill.text;
    at = armedFill.at;
  } else {
    text = peekDraft(sessionId);
    try {
      at = Number(sessionStorage.getItem(ARM_KEY + sessionId) || 0);
    } catch {
      at = 0;
    }
  }
  if (!text || !at || Date.now() - at > ARM_TTL_MS) {
    if (text && (!at || Date.now() - at > ARM_TTL_MS)) clearStoredDraft(sessionId);
    return "";
  }
  clearStoredDraft(sessionId);
  armedFill = { sessionId: "", text: "", at: 0 };
  return text;
}

function conversationInput(sessionId) {
  try {
    const host = rewindHost;
    const conversation = host?.conversation || (typeof host?.get === "function" ? host.get("conversation") : undefined);
    const sessions = host?.sessions || rewindSessions;
    const actx = typeof sessions?.scope === "function" ? sessions.scope(sessionId) : undefined;
    if (conversation?.input?.for && actx) return conversation.input.for(actx);
    return conversation?.input || null;
  } catch {
    return null;
  }
}

function liveDraft(sessionId, inputActions) {
  try {
    const fromActions = inputActions?.state?.getSnapshot?.()?.draft;
    if (typeof fromActions === "string") return fromActions;
  } catch {
    /* ignore */
  }
  try {
    const draft = conversationInput(sessionId)?.state?.getSnapshot?.()?.draft;
    if (typeof draft === "string") return draft;
  } catch {
    /* ignore */
  }
  return "";
}

function hostSetDraft(sessionId, text) {
  if (!sessionId) return false;
  try {
    const input = conversationInput(sessionId);
    if (input && typeof input.setDraft === "function") {
      input.setDraft(text || "");
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

function fillComposer(inputActions, text) {
  if (inputActions && typeof inputActions.setDraft === "function") {
    try {
      inputActions.setDraft(text || "");
    } catch {
      /* ignore */
    }
  }
}

function scheduleComposerFill(sessionId, text, inputActions) {
  if (!sessionId || !text || isPluginDraft(text)) return;
  let stopped = false;
  let filled = false;
  const tryFill = () => {
    if (stopped) return;
    const current = liveDraft(sessionId, inputActions);
    if (filled && current !== text) {
      stopped = true;
      return;
    }
    if (current && current !== text) {
      stopped = true;
      return;
    }
    fillComposer(inputActions, text);
    hostSetDraft(sessionId, text);
    filled = true;
  };
  for (const ms of FILL_DELAYS) window.setTimeout(tryFill, ms);
}

function scheduleEchoClear(sessionId, inputActions) {
  if (!sessionId) return;
  let last = "";
  let stopped = false;
  const tryClear = () => {
    if (stopped || !last) return;
    const current = String(liveDraft(sessionId, inputActions) || "").trim();
    if (!current) {
      stopped = true;
      return;
    }
    if (current !== last) return;
    fillComposer(inputActions, "");
    hostSetDraft(sessionId, "");
    clearStoredDraft(sessionId);
    stopped = true;
  };
  apiJson("/dsh-purge/last-user?sessionId=" + encodeURIComponent(sessionId))
    .then((data) => {
      last = String(data?.text || "").trim();
      if (!last || isPluginDraft(last)) return;
      tryClear();
      for (const ms of [0, 50, 180, 400]) window.setTimeout(tryClear, ms);
    })
    .catch(() => {});
}

async function dropInheritedQueue(sessions, sessionId) {
  if (!sessions || !sessionId) return;
  const drop = async () => {
    try {
      const actx = typeof sessions.scope === "function" ? sessions.scope(sessionId) : undefined;
      const face = typeof sessions.sessionOf === "function" ? sessions.sessionOf(actx) : undefined;
      const queue = face?.getSnapshot?.()?.queue || [];
      for (const item of queue) {
        const id = item?.id || item?.itemId;
        if (!id) continue;
        try {
          await face.updateQueue?.(id, { kind: "remove" });
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* ignore */
    }
  };
  await drop();
  window.setTimeout(() => {
    drop();
  }, 80);
}

async function openRewoundSession(sessions, sessionId) {
  if (!sessions || !sessionId) return;
  try {
    await sessions.refresh?.();
  } catch {
    /* ignore */
  }
  try {
    sessions.open(sessionId);
  } catch {
    /* ignore */
  }
  await dropInheritedQueue(sessions, sessionId);
  window.setTimeout(() => {
    try {
      sessions.open(sessionId);
    } catch {
      /* ignore */
    }
    dropInheritedQueue(sessions, sessionId);
  }, 250);
}

class RewindSafe extends Component {
  constructor(p) {
    super(p);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    try {
      console.error("[dsh-purge] rewind slot:", error);
    } catch {
      /* ignore */
    }
  }
  render() {
    if (this.state.failed) {
      return h(
        "button",
        {
          type: "button",
          className: "dshp-rewind",
          title: "回退上一句",
          onMouseDown: (e) => e.preventDefault(),
          onClick: async () => {
            const sessionId = currentSessionId(rewindSessions);
            if (!sessionId) return;
            try {
              const data = await apiJson("/dsh-purge/rewind", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ sessionId, mode: "once" }),
              });
              if (data && data.ok && data.sessionId) {
                if (data.at) rewindSeenAt = data.at;
                const text = isPluginDraft(data.text) ? "" : data.text || "";
                armComposerFill(data.sessionId, text);
                scheduleComposerFill(data.sessionId, text);
                await openRewoundSession(rewindSessions, data.sessionId);
                scheduleComposerFill(data.sessionId, text);
              }
            } catch (e) {
              window.alert("回退失败: " + String((e && e.message) || e));
            }
          },
        },
        h("style", null, REWIND_CSS),
        "回退",
      );
    }
    return h(RewindButton, this.props);
  }
}

class ContinueSafe extends Component {
  constructor(p) {
    super(p);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    try {
      console.error("[dsh-purge] continue slot:", error);
    } catch {
      /* ignore */
    }
  }
  render() {
    if (this.state.failed) {
      return h(
        "button",
        {
          type: "button",
          className: "dshp-continue",
          title: rewindText(translate, "continue.label", "继续"),
          onMouseDown: (e) => e.preventDefault(),
          onClick: async () => {
            const sessionId = currentSessionId(rewindSessions);
            if (!sessionId) return;
            try {
              const data = await apiJson("/dsh-purge/continue", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ sessionId, force: true }),
              });
              if (!data || !data.ok) throw new Error((data && data.error) || "continue");
            } catch (e) {
              window.alert(
                rewindText(translate, "continue.fail", "继续失败: {error}").replace(
                  "{error}",
                  String((e && e.message) || e),
                ),
              );
            }
          },
        },
        rewindText(translate, "continue.label", "继续"),
      );
    }
    return h(ContinueButton, this.props);
  }
}

function ContinueButton(props) {
  const t = props.t || translate;
  const sessions = rewindSessions;
  const sessionId = props.sessionId || currentSessionId(sessions);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setInfo(null);
      return;
    }
    let cancelled = false;
    const tick = () => {
      apiJson("/dsh-purge/continue?sessionId=" + encodeURIComponent(sessionId))
        .then((data) => {
          if (!cancelled && data && data.ok) setInfo(data);
        })
        .catch(() => {});
    };
    tick();
    const timer = window.setInterval(tick, 1200);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [sessionId]);

  const canContinue = Boolean(info && info.canContinue);
  const left = info ? Math.max(0, (info.continueMax || 0) - (info.continueUsed || 0)) : 0;
  const runContinue = async () => {
    if (!sessionId || busy || !canContinue) return;
    setBusy(true);
    setNotice("");
    try {
      const data = await apiJson("/dsh-purge/continue", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!data || !data.ok) throw new Error((data && data.error) || "continue");
      setInfo((prev) => (prev ? { ...prev, ...data, canContinue: false, continueUsed: data.used } : data));
    } catch (e) {
      setNotice(rewindText(t, "continue.fail", "继续失败: {error}").replace("{error}", String((e && e.message) || e)));
    } finally {
      setBusy(false);
    }
  };

  const label = busy ? rewindText(t, "continue.busy", "继续中…") : rewindText(t, "continue.label", "继续");
  const title =
    notice ||
    (canContinue
      ? rewindText(t, "continue.ready", "继续（还可 {left} 次）").replace("{left}", String(left))
      : info && info.reason && left <= 0
        ? rewindText(t, "continue.limit", "已达继续上限")
        : rewindText(t, "continue.aria", "异常停止后继续"));
  return h(
    "button",
    {
      type: "button",
      className: "dshp-continue" + (canContinue ? " is-ready" : ""),
      title,
      "aria-label": rewindText(t, "continue.aria", "异常停止后继续"),
      disabled: busy || !sessionId || !canContinue,
      onMouseDown: (e) => e.preventDefault(),
      onClick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        runContinue();
      },
    },
    h(
      "svg",
      { viewBox: "0 0 16 16", width: "14", height: "14", "aria-hidden": true },
      h("path", { fill: "currentColor", d: "M4.2 2.8v10.4L13 8 4.2 2.8z" }),
    ),
    label,
  );
}

function RewindButton(props) {
  const t = props.t || translate;
  const sessions = rewindSessions;
  const inputActions = props.inputActions;
  const sessionId = props.sessionId || currentSessionId(sessions);
  const wrapRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    const armed = takeArmedFill(sessionId);
    if (armed) {
      scheduleComposerFill(sessionId, armed, inputActions);
      return;
    }
    scheduleEchoClear(sessionId, inputActions);
  }, [sessionId, inputActions]);

  useEffect(() => {
    if (!menu) return;
    const onDoc = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menu]);

  const runRewind = async (mode) => {
    if (!sessionId || busy) return;
    setBusy(true);
    setMenu(false);
    setNotice("");
    try {
      const data = await apiJson("/dsh-purge/rewind", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId, mode }),
      });
      if (!data || !data.ok || !data.sessionId) throw new Error((data && data.error) || "rewind");
      if (data.at) rewindSeenAt = data.at;
      const text = isPluginDraft(data.text) ? "" : data.text || "";
      armComposerFill(data.sessionId, text);
      await openRewoundSession(sessions, data.sessionId);
      scheduleComposerFill(data.sessionId, text);
    } catch (e) {
      setNotice(rewindText(t, "rewind.fail", "回退失败: {error}").replace("{error}", String((e && e.message) || e)));
    } finally {
      setBusy(false);
    }
  };

  const onClick = async (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (!sessionId || busy) return;
    if (menu) {
      setMenu(false);
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      const info = await apiJson("/dsh-purge/rewind/options?sessionId=" + encodeURIComponent(sessionId));
      if (info && info.ok && info.kind === "main") {
        setMenu(true);
        return;
      }
      await runRewind("once");
    } catch (e) {
      setNotice(rewindText(t, "rewind.fail", "回退失败: {error}").replace("{error}", String((e && e.message) || e)));
    } finally {
      setBusy(false);
    }
  };

  const label = busy ? rewindText(t, "rewind.busy", "回退中…") : rewindText(t, "rewind.label", "回退");
  const title = notice || rewindText(t, "rewind.aria", "回退");
  return h(
    "div",
    { className: "dshp-rewind-wrap", ref: wrapRef },
    h("style", null, REWIND_CSS),
    h(
      "button",
      {
        type: "button",
        className: "dshp-rewind",
        title,
        "aria-label": rewindText(t, "rewind.aria", "回退"),
        disabled: busy || !sessionId,
        onMouseDown: (e) => e.preventDefault(),
        onClick,
      },
      h(
        "svg",
        { viewBox: "0 0 16 16", width: "14", height: "14", "aria-hidden": true },
        h("path", {
          fill: "currentColor",
          d: "M7.2 3.2 3.4 7l3.8 3.8V8.6c2.8 0 4.7.7 5.9 2.3-.2-2.8-1.9-5.2-5.9-5.6V3.2z",
        }),
      ),
      label,
    ),
    menu
      ? h(
          "div",
          { className: "dshp-rewind-menu", role: "menu" },
          h(
            "button",
            {
              type: "button",
              className: "dshp-rewind-item",
              onMouseDown: (e) => e.preventDefault(),
              onClick: () => runRewind("once"),
            },
            h("b", null, rewindText(t, "rewind.once", "回退一次")),
            h("span", null, rewindText(t, "rewind.once.hint", "只退当前对话上一句")),
          ),
          h(
            "button",
            {
              type: "button",
              className: "dshp-rewind-item",
              onMouseDown: (e) => e.preventDefault(),
              onClick: () => runRewind("round"),
            },
            h("b", null, rewindText(t, "rewind.round", "回退上一轮")),
            h("span", null, rewindText(t, "rewind.round.hint", "退回上一轮主对话，本轮子代理一并去掉")),
          ),
        )
      : null,
  );
}

function installRewindWatch(ctx) {
  const sessions = ctx.sessions;
  if (!sessions) return () => {};
  const tick = async () => {
    try {
      const data = await apiJson("/dsh-purge/rewind");
      if (!data || !data.sessionId || !data.at || data.at <= rewindSeenAt) return;
      rewindSeenAt = data.at;
      const current = currentSessionId(sessions);
      if (current && current !== data.parentId) return;
      const text = isPluginDraft(data.text) ? "" : data.text || "";
      armComposerFill(data.sessionId, text);
      scheduleComposerFill(data.sessionId, text);
      await openRewoundSession(sessions, data.sessionId);
      scheduleComposerFill(data.sessionId, text);
    } catch {
      /* ignore */
    }
  };
  const timer = window.setInterval(tick, 1200);
  return () => window.clearInterval(timer);
}

async function installRewindUi(ctx) {
  const status = await apiJson("/dsh-purge/status").catch(() => null);
  if (!status || status.rewindEnabled === false) return;
  rewindHost = ctx;
  rewindSessions = ctx.sessions;
  ctx.slots.inject("conversation.input.right", () =>
    ctx.slots.register(
      {
        name: "conversation.input.right",
        id: "dsh-purge-rewind",
        order: 20,
        inject: (sessionId) => ({
          sessionId,
          t: ctx.locale.bind(NS),
        }),
      },
      RewindSafe,
    ),
  );
  // ctx.slots.inject("conversation.input.right", () => ctx.slots.register({
  // 	name: "conversation.input.right",
  // 	id: "dsh-purge-continue",
  // 	order: 21,
  // 	inject: (sessionId) => ({
  // 		sessionId,
  // 		t: ctx.locale.bind(NS),
  // 	}),
  // }, ContinueSafe));
  ctx.effect(() => installRewindWatch(ctx), "dsh-purge: rewind watch");
}

export {
  DRAFT_KEY,
  ARM_KEY,
  FILL_DELAYS,
  ARM_TTL_MS,
  rewindSeenAt,
  rewindSessions,
  rewindHost,
  pendingComposer,
  armedFill,
  rewindText,
  currentSessionId,
  isPluginDraft,
  writeDraft,
  peekDraft,
  clearStoredDraft,
  armComposerFill,
  takeArmedFill,
  conversationInput,
  liveDraft,
  hostSetDraft,
  fillComposer,
  scheduleComposerFill,
  scheduleEchoClear,
  dropInheritedQueue,
  openRewoundSession,
  RewindSafe,
  ContinueSafe,
  ContinueButton,
  RewindButton,
  installRewindWatch,
  installRewindUi,
};
