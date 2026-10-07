import { h, setTranslate, clientGuessSurface, hostText, useState, useEffect, useCallback } from "./common.js";
import { THEME_KEY, THEME_MODE_KEY, PURGE_CSS } from "./styles.js";
import { PurgifySection } from "./purge-settings.js";
import { RulesSection } from "./rules-settings.js";
import { SkillsSection } from "./skills-settings.js";
function reopenAfterRestart() {
  const url = new URL(window.location.href);
  url.searchParams.delete("token");
  window.location.replace(url.pathname + url.search + url.hash);
}

function waitForRestart(setNotice, setBusy, t) {
  const started = Date.now();
  const ping = () => {
    fetch("/dsh-purge/status", { cache: "no-store", credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (d && d.ok && d.ready !== false) reopenAfterRestart();
        else retry();
      })
      .catch(retry);
  };
  const retry = () => {
    if (Date.now() - started > 90000) {
      setNotice({ kind: "error", text: t("restart.timeout") });
      setBusy(false);
      return;
    }
    setTimeout(ping, 500);
  };
  setTimeout(ping, 800);
}

function restartDsh(setNotice, setBusy, t, surface) {
  const surf = surface || clientGuessSurface() || "web";
  setBusy(true);
  setNotice({ kind: "ok", text: hostText(t, "restarting", surf) });
  fetch("/dsh-purge/restart", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })
    .then((r) => r.json())
    .then((d) => {
      if (!d.ok) throw new Error(d.error || "restart failed");
      const next = (d && d.surface) || surf;
      setNotice({ kind: "ok", text: hostText(t, "restarting", next) });
      // 桌面端整应用会退出重开。先刷新内嵌 web 会单独重启 Host。
      if (next === "desktop" || (d && d.fullApp) || clientGuessSurface() === "desktop") return;
      waitForRestart(setNotice, setBusy, t);
    })
    .catch((e) => {
      if (surf === "desktop" || clientGuessSurface() === "desktop") return;
      if (String(e.message || e).includes("Failed to fetch") || e.name === "TypeError") {
        waitForRestart(setNotice, setBusy, t);
        return;
      }
      setNotice({ kind: "error", text: t("restart.fail", { error: e.message }) });
      setBusy(false);
    });
}

function detectHostTheme() {
  try {
    if (typeof document !== "undefined") {
      if (document.body?.hasAttribute("data-ds-dark-theme")) return "dusk";
      const root = document.documentElement;
      const scheme = (
        root.style.colorScheme ||
        getComputedStyle(root).getPropertyValue("color-scheme") ||
        ""
      ).toLowerCase();
      if (scheme.includes("dark")) return "dusk";
      if (scheme.includes("light")) return "white";
    }
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      return "dusk";
    }
  } catch {
    /* ignore */
  }
  return "white";
}

function readTheme() {
  try {
    if (window.localStorage.getItem(THEME_MODE_KEY) === "manual") {
      const v = window.localStorage.getItem(THEME_KEY);
      if (v === "dusk" || v === "white") return v;
    }
  } catch {
    /* ignore */
  }
  return detectHostTheme();
}

function SettingsRoot(props) {
  const t = typeof props.t === "function" ? props.t : (key) => key;
  const [theme, setTheme] = useState(readTheme);
  const setAndStore = useCallback((next) => {
    setTheme(next);
    try {
      window.localStorage.setItem(THEME_MODE_KEY, "manual");
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    const syncFromHost = () => {
      try {
        if (window.localStorage.getItem(THEME_MODE_KEY) === "manual") return;
      } catch {
        /* ignore */
      }
      if (!cancelled) setTheme(detectHostTheme());
    };
    const syncSoon = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(syncFromHost, 50);
    };
    syncFromHost();
    let mq;
    try {
      mq = window.matchMedia?.("(prefers-color-scheme: dark)");
      mq?.addEventListener?.("change", syncFromHost);
    } catch {
      /* ignore */
    }
    let obs;
    try {
      if (document.body) {
        obs = new MutationObserver(syncSoon);
        obs.observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme"] });
      }
    } catch {
      /* ignore */
    }
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      try {
        mq?.removeEventListener?.("change", syncFromHost);
      } catch {
        /* ignore */
      }
      try {
        obs?.disconnect();
      } catch {
        /* ignore */
      }
    };
  }, []);
  setTranslate(t);
  return h(
    "div",
    { className: "dshp-root", "data-theme": theme },
    h("style", null, PURGE_CSS),
    h(
      "div",
      { className: "dshp-toolbar" },
      h(
        "div",
        { className: "dshp-switch", role: "group", "aria-label": t("theme.aria") },
        h(
          "button",
          {
            type: "button",
            className: theme === "white" ? "is-on" : "",
            onClick: () => setAndStore("white"),
          },
          t("theme.white"),
        ),
        h(
          "button",
          {
            type: "button",
            className: theme === "dusk" ? "is-on" : "",
            onClick: () => setAndStore("dusk"),
          },
          t("theme.ink"),
        ),
      ),
    ),
    h(PurgifySection, null),
    h(RulesSection, null),
    h(SkillsSection, null),
  );
}

export { reopenAfterRestart, waitForRestart, restartDsh, detectHostTheme, readTheme, SettingsRoot };
