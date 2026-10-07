import * as react from "react";
const h = react.createElement;
const { useState, useEffect, useCallback, useRef, Component } = react;

const name = "dsh-purge";
const inject = ["slots", "locale"];
const NS = "settings.dsh-purge";
let translator = (key) => key;
function translate(...args) {
  return translator(...args);
}
function setTranslate(next) {
  translator = next;
}
function useT() {
  return translate;
}
function clientGuessSurface() {
  try {
    if (typeof navigator !== "undefined" && /electron/i.test(navigator.userAgent || "")) return "desktop";
    if (typeof location !== "undefined") {
      const port = String(location.port || "");
      if (port === "43120") return "desktop";
      const host = String(location.hostname || "");
      if (host && host !== "127.0.0.1" && host !== "localhost" && /dsh desktop/i.test(String(location.href || "")))
        return "desktop";
    }
  } catch {
    /* ignore */
  }
  return "";
}
function hostSurfaceOf(s) {
  return (s && s.surface) || clientGuessSurface() || "web";
}
function hostText(t, key, surface) {
  if (surface && surface !== "web") {
    const specific = key + "." + surface;
    const hit = t(specific);
    if (hit && hit !== specific) return hit;
  }
  return t(key);
}
function apiUrl(p) {
  try {
    return new URL(p, window.location.origin).toString();
  } catch {
    return p;
  }
}
function apiTimeoutMs(p, init) {
  const path = String(p || "");
  const method = String((init && init.method) || "GET").toUpperCase();
  if (path.indexOf("/dsh-purge/update") !== -1) return method === "POST" ? 180000 : 45000;
  if (path.indexOf("/dsh-purge/uninstall") !== -1) return 90000;
  if (path.indexOf("/dsh-purge/skill") !== -1) return method === "POST" ? 120000 : 20000;
  return 20000;
}
function isAbortError(e) {
  const msg = String((e && e.message) || e || "");
  return (e && e.name === "AbortError") || /aborted|abort/i.test(msg);
}
async function apiJson(p, init) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), apiTimeoutMs(p, init));
  try {
    const r = await fetch(
      apiUrl(p),
      Object.assign({ cache: "no-store", credentials: "same-origin", signal: ctrl.signal }, init || {}),
    );
    const text = await r.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error(r.status + " non-json: " + text.slice(0, 120));
    }
    if (!r.ok) throw new Error((data && (data.error || data.message)) || r.status + " " + r.statusText);
    return data;
  } catch (e) {
    if (isAbortError(e)) throw new Error("timeout");
    const msg = String((e && e.message) || e || "");
    if (/failed to fetch|networkerror|load failed/i.test(msg)) {
      throw new Error("连不上接口，请确认 dsh 还在跑后 Ctrl+F5");
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

function promptBoxEmpty(text) {
  return !String(text || "").trim();
}

function responseNeedsPrompt(d) {
  return Boolean(d && (d.needPrompt || d.injectSource === "none"));
}

function warnNeedPrompt(d, tr) {
  if (!responseNeedsPrompt(d)) return false;
  window.alert(tr("need.prompt"));
  return true;
}

function activeRuleHasBody(st) {
  if (!st || !st.ok) return false;
  const active = st.rules && st.rules.find((r) => r.id === st.active);
  return Boolean(active && active.size > 0);
}

async function bothInjectEmpty(overrideText) {
  if (!promptBoxEmpty(overrideText)) return false;
  try {
    return !activeRuleHasBody(await rulesApi("status"));
  } catch {
    return true;
  }
}

function rulesApi(op, extra) {
  return apiJson("/dsh-purge/rules", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(Object.assign({ op: op }, extra || {})),
  });
}

function skillsRouteMissing(e) {
  return /\b404\b|\b405\b|non-json/i.test(String((e && e.message) || e || ""));
}

function skillsApi(op, extra) {
  const init = {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(Object.assign({ op: op }, extra || {})),
  };
  return apiJson("/dsh-purge/skills", init).catch((e) => {
    if (!skillsRouteMissing(e)) throw e;
    return apiJson("/dsh-purge/skill", init);
  });
}

const TARGETS = ["AGENTS.md", "CLAUDE.md"];
const PATCH_GROUPS = [
  { key: "prompt", ids: [1, 2, 3, 4, 5, 25, 26, 27, 28, 32] },
  { key: "code", ids: [6, 7, 8] },
  { key: "engine", ids: [9, 10, 11, 12, 13, 14, 15, 16, 35] },
  { key: "tools", ids: [17, 18, 19, 20, 21, 22, 23, 24, 29, 30, 31, 33, 34, 36, 37] },
  { key: "compat", ids: [38, 39, 40] },
];

export {
  h,
  name,
  inject,
  NS,
  translator,
  translate,
  setTranslate,
  useT,
  clientGuessSurface,
  hostSurfaceOf,
  hostText,
  apiUrl,
  apiTimeoutMs,
  isAbortError,
  apiJson,
  promptBoxEmpty,
  responseNeedsPrompt,
  warnNeedPrompt,
  activeRuleHasBody,
  bothInjectEmpty,
  rulesApi,
  skillsRouteMissing,
  skillsApi,
  TARGETS,
  PATCH_GROUPS,
  useState,
  useEffect,
  useCallback,
  useRef,
  Component,
};
