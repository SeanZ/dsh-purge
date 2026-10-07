import {
  h,
  useT,
  clientGuessSurface,
  hostSurfaceOf,
  hostText,
  apiJson,
  promptBoxEmpty,
  responseNeedsPrompt,
  bothInjectEmpty,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "./common.js";
import { shimKind, noticeNode, Btn, PatchGroups } from "./widgets.js";

import { listedCeiling, keepListedVersion, preferListed, versionChoiceLabel } from "./versions.js";
import { restartDsh } from "./theme-settings.js";

function PurgifySection() {
  const t = useT();
  const tRef = useRef(t);
  tRef.current = t;
  const [state, setState] = useState(null);
  const [override, setOverride] = useState("");
  const [defaultOverride, setDefaultOverride] = useState("");
  const [overrideLoaded, setOverrideLoaded] = useState(false);
  const [patchBusy, setPatchBusy] = useState(false);
  const [updateBusy, setUpdateBusy] = useState(false);
  const [canApplyUpdate, setCanApplyUpdate] = useState(false);
  const [updateJob, setUpdateJob] = useState(null);
  const [askRestart, setAskRestart] = useState(false);
  const [askUninstall, setAskUninstall] = useState(false);
  const [uninstallBusy, setUninstallBusy] = useState(false);
  const [notice, setNotice] = useState({ kind: "idle", text: "" });
  const [updateNotice, setUpdateNotice] = useState({ kind: "idle", text: "" });
  const [updateInfo, setUpdateInfo] = useState(null);
  const [channel, setChannel] = useState("stable");
  const [pick, setPick] = useState({ stable: "", beta: "" });
  const actionTicket = useRef(0);

  const syncPicks = (d) => {
    const versions = (d && d.versions) || [];
    const ceiling = listedCeiling(versions, d && d.localVersion);
    const next = { stable: "", beta: "" };
    for (const id of ["stable", "beta"]) {
      const list = versions.filter((item) => item.channel === id && keepListedVersion(item, ceiling));
      const hit = preferListed(list, d && d.localVersion);
      next[id] = (hit && hit.ref) || "";
    }
    setPick(next);
  };

  const updateErrorText = (tr, e) => {
    const msg = String((e && e.message) || e || "");
    if (msg === "timeout" || /aborted|abort|超时/i.test(msg)) return tr("update.timeout");
    if (/\b404\b/.test(msg) || /non-json/.test(msg)) return tr("update.needRestart");
    return tr("update.fail", { error: msg });
  };

  const applyUpdateInfo = useCallback((d, tr, kind) => {
    if (d.channel) setChannel(d.channel);
    setUpdateInfo((prev) => {
      const versions = d.versions && d.versions.length ? d.versions : (prev && prev.versions) || [];
      return Object.assign({}, prev || {}, d, { versions });
    });
    if (d.versions && d.versions.length) syncPicks(d);
    if (kind === "check") setCanApplyUpdate(Boolean(d.hasUpdate) && !d.error);
    else if (kind === "done" || kind === "switched" || kind === "channel") setCanApplyUpdate(false);
    const version = d.localVersion || d.localSha || "—";
    const remote = d.remoteVersion || d.remoteSha || "—";
    let text = tr("update.latest", { version });
    if (d.hasUpdate) text = tr("update.available", { remote, local: version });
    if (d.pinned && d.hasUpdate) text = tr("update.pinned", { version, remote });
    if (kind === "switched" || kind === "channel")
      text = tr("update.switched", { version: d.localVersion || d.remoteVersion || "—" });
    if (kind === "done") text = tr("update.done", { version: d.localVersion || d.remoteVersion || "—" });
    if (d.error) text = d.error;
    setUpdateNotice({ kind: d.ok === false || d.error ? "error" : "ok", text });
  }, []);

  const checkUpdate = useCallback(
    (id) => {
      setUpdateBusy(true);
      setUpdateJob({ id: id || "", kind: "check" });
      const tr = tRef.current;
      setUpdateNotice({ kind: "ok", text: tr("update.checking") });
      apiJson("/dsh-purge/update")
        .then((d) => {
          if (!d || (!d.ok && !d.channel)) throw new Error((d && d.error) || "check failed");
          applyUpdateInfo(d, tr, "check");
        })
        .catch((e) => setUpdateNotice({ kind: "error", text: updateErrorText(tr, e) }))
        .finally(() => {
          setUpdateBusy(false);
          setUpdateJob(null);
        });
    },
    [applyUpdateInfo],
  );

  const postUpdate = useCallback(
    (body, kind, id) => {
      setUpdateBusy(true);
      setUpdateJob({ id: id || "", kind });
      const tr = tRef.current;
      setUpdateNotice({
        kind: "ok",
        text: kind === "switched" || kind === "channel" ? tr("update.switching") : tr("update.applying"),
      });
      return apiJson("/dsh-purge/update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body || {}),
      })
        .then((d) => {
          if (!d || (d.ok === false && d.error)) throw new Error((d && d.error) || "update failed");
          applyUpdateInfo(d, tr, kind);
          if (d.applied && d.reloadClient !== false) {
            setUpdateNotice({ kind: "ok", text: tr("update.reloading") });
            setTimeout(() => {
              try {
                window.location.reload();
              } catch {
                /* ignore */
              }
            }, 280);
          } else if (d.needRestart) {
            setAskRestart(true);
          }
          return d;
        })
        .catch((e) => {
          setUpdateNotice({ kind: "error", text: updateErrorText(tr, e) });
          throw e;
        })
        .finally(() => {
          setUpdateBusy(false);
          setUpdateJob(null);
        });
    },
    [applyUpdateInfo],
  );

  const doUpdate = useCallback(
    (id) => {
      const lane = id === "beta" ? "beta" : "stable";
      postUpdate({ op: "apply", ref: "v1.1.15-seanz.1", channel: lane }, "done", id).catch(() => {});
    },
    [postUpdate],
  );

  const changeChannel = useCallback(
    (next) => {
      if (!next) return;
      const tr = tRef.current;
      if (!window.confirm(tr("update.confirmChannel", { version: tr("channel." + next) }))) return;
      const prevChannel = channel;
      const prevInfo = updateInfo;
      setChannel(next);
      setUpdateInfo((cur) => Object.assign({}, cur || {}, { channel: next }));
      postUpdate({ op: "channel", channel: next }, "channel", next).catch(() => {
        setChannel(prevChannel);
        setUpdateInfo(prevInfo);
      });
    },
    [channel, postUpdate, updateInfo],
  );

  const switchSelected = useCallback(
    (id) => {
      const tr = tRef.current;
      const ref = pick[id];
      const versions = ((updateInfo && updateInfo.versions) || []).filter((item) => item.channel === id);
      const hit = versions.find((item) => item.ref === ref);
      const label = (hit && (hit.label || hit.version)) || ref;
      if (!ref) return;
      if (!window.confirm(tr("update.confirmSwitch", { version: label }))) return;
      const prevChannel = channel;
      const prevInfo = updateInfo;
      if (hit && hit.channel) {
        setChannel(hit.channel);
        setUpdateInfo((cur) => Object.assign({}, cur || {}, { channel: hit.channel }));
      }
      postUpdate({ op: "switch", ref }, "switched", id).catch(() => {
        setChannel(prevChannel);
        setUpdateInfo(prevInfo);
      });
    },
    [channel, pick, postUpdate, updateInfo],
  );

  const loadAll = useCallback(() => {
    const tr = tRef.current;
    apiJson("/dsh-purge/status")
      .then((d) => {
        if (d && d.ok) {
          setState(d);
          if (d.channel) setChannel(d.channel);
          if (d.update && d.update.ok && !d.update.error) setUpdateInfo(d.update);
        } else {
          setState({
            ok: false,
            patches_total: 0,
            patches_applied: 0,
            patch_status: {},
            shim_cmd: "n/a",
            shim_ps1: "n/a",
            shim_bin: "n/a",
            has_backup: false,
          });
          setNotice({ kind: "error", text: tr("err.status", { error: (d && d.error) || "bad response" }) });
        }
      })
      .catch((e) => {
        setState({
          ok: false,
          patches_total: 0,
          patches_applied: 0,
          patch_status: {},
          shim_cmd: "n/a",
          shim_ps1: "n/a",
          shim_bin: "n/a",
          has_backup: false,
        });
        setNotice({ kind: "error", text: tr("err.status", { error: e.message }) });
      });
    apiJson("/dsh-purge/update")
      .then((d) => {
        if (!d) return;
        if (d.channel) setChannel(d.channel);
        setUpdateInfo(d);
        syncPicks(d);
      })
      .catch(() => {});
    apiJson("/dsh-purge/override")
      .then((d) => {
        if (d && d.ok) {
          const packed = typeof d.defaultContent === "string" ? d.defaultContent : "";
          if (packed) setDefaultOverride(packed);
          setOverride(typeof d.content === "string" ? d.content : packed);
          setOverrideLoaded(true);
        } else setNotice({ kind: "error", text: tr("err.override", { error: (d && d.error) || "" }) });
      })
      .catch((e) => setNotice({ kind: "error", text: tr("err.override", { error: e.message }) }));
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const rejectNeedPrompt = useCallback((tr) => {
    setAskRestart(false);
    setNotice({ kind: "error", text: tr("need.prompt") });
    setTimeout(() => window.alert(tr("need.prompt")), 0);
  }, []);

  const doAction = useCallback(
    (action, actionKey) => {
      const tr = tRef.current;
      const label = tr(actionKey);
      const ticket = ++actionTicket.current;
      const run = () => {
        setPatchBusy(true);
        setAskRestart(false);
        setNotice({ kind: "idle", text: "" });
        fetch("/dsh-purge/" + action, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(action === "apply" ? { content: override } : {}),
        })
          .then((r) => r.json())
          .then((d) => {
            if (ticket !== actionTicket.current) return;
            const applyEmptyBlocked =
              action === "apply" && promptBoxEmpty(override) && (!d || d.injectSource !== "rule");
            if (responseNeedsPrompt(d) || applyEmptyBlocked) {
              rejectNeedPrompt(tr);
              return;
            }
            if (!d.ok) {
              setNotice({ kind: "error", text: tr("err.action", { action: label, error: d.error || "" }) });
              return;
            }
            if (action === "apply") {
              if (typeof d.defaultContent === "string") setDefaultOverride(d.defaultContent);
              if (typeof d.override_content === "string") {
                setOverride(d.override_content);
                setOverrideLoaded(true);
              }
            }
            if (action === "apply" && d.complete === false) {
              const parts = [];
              if (d.failed > 0) {
                const ids = (d.failed_items || [])
                  .map((x) => x.id)
                  .filter((id) => id != null)
                  .join(",");
                parts.push(
                  tr("restart.incomplete.patches", {
                    failed: String(d.failed || 0),
                    ids: ids || "?",
                  }),
                );
              }
              if (d.cmd_flash && d.cmd_flash.ok === false) {
                parts.push(
                  tr("restart.incomplete.flash", {
                    entry: String(d.cmd_flash.entry || "fail"),
                  }),
                );
              }
              if (parts.length === 0) parts.push(tr("restart.incomplete.flash", { entry: "unknown" }));
              setNotice({
                kind: "error",
                text: tr("restart.incomplete", { detail: parts.join("；") }),
              });
              loadAll();
              return;
            }
            setNotice({ kind: "ok", text: tr("ok.done") });
            loadAll();
            if (action === "apply") setAskRestart(true);
          })
          .catch((e) => {
            if (ticket !== actionTicket.current) return;
            setNotice({ kind: "error", text: tr("err.action", { action: label, error: e.message }) });
          })
          .finally(() => {
            if (ticket === actionTicket.current) setPatchBusy(false);
          });
      };
      if (action !== "apply") {
        run();
        return;
      }
      bothInjectEmpty(override).then((empty) => {
        if (ticket !== actionTicket.current) return;
        if (empty) {
          rejectNeedPrompt(tr);
          return;
        }
        run();
      });
    },
    [loadAll, override, rejectNeedPrompt],
  );

  const saveOverride = useCallback(() => {
    const tr = t;
    const ticket = ++actionTicket.current;
    const go = () => {
      setPatchBusy(true);
      setAskRestart(false);
      setNotice({ kind: "idle", text: "" });
      fetch("/dsh-purge/override", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: override }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (ticket !== actionTicket.current) return;
          if (!d.ok || responseNeedsPrompt(d) || (promptBoxEmpty(override) && d.injectSource !== "rule")) {
            rejectNeedPrompt(tr);
            return;
          }
          if (typeof d.content === "string") setOverride(d.content);
          setNotice({ kind: "ok", text: t("saved.override") });
        })
        .catch((e) => {
          if (ticket !== actionTicket.current) return;
          setNotice({ kind: "error", text: t("err.save", { error: e.message }) });
        })
        .finally(() => {
          if (ticket === actionTicket.current) setPatchBusy(false);
        });
    };
    bothInjectEmpty(override).then((empty) => {
      if (ticket !== actionTicket.current) return;
      if (empty) {
        rejectNeedPrompt(tr);
        return;
      }
      go();
    });
  }, [override, t, rejectNeedPrompt]);

  const restoreOverride = useCallback(() => {
    if (!defaultOverride) return;
    setOverride(defaultOverride);
    setNotice({ kind: "ok", text: t("saved.restoreInject") });
  }, [defaultOverride, t]);

  const waitHostAfterUninstall = useCallback((tr) => {
    const started = Date.now();
    const ping = () => {
      fetch("/", { cache: "no-store", credentials: "same-origin" })
        .then((r) => {
          if (r.ok) {
            try {
              window.localStorage.removeItem("dshp-theme");
              window.localStorage.removeItem("dshp-theme-mode");
            } catch {
              /* ignore */
            }
            window.location.reload();
            return;
          }
          retry();
        })
        .catch(retry);
    };
    const retry = () => {
      if (Date.now() - started > 90000) {
        setNotice({ kind: "error", text: tr("restart.timeout") });
        setUninstallBusy(false);
        return;
      }
      setTimeout(ping, 500);
    };
    setTimeout(ping, 800);
  }, []);

  const doUninstall = useCallback(() => {
    setUninstallBusy(true);
    setAskUninstall(false);
    setAskRestart(false);
    const tr = tRef.current;
    setNotice({ kind: "ok", text: tr("uninstall.applying") });
    apiJson("/dsh-purge/uninstall", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })
      .then((d) => {
        if (!d || !d.ok) throw new Error((d && d.error) || "uninstall failed");
        setNotice({
          kind: "ok",
          text: (d && d.note) || hostText(tr, "uninstall.done", d.surface || hostSurfaceOf(state)),
        });
        if ((d && d.surface) === "desktop" || (d && d.fullApp) || hostSurfaceOf(state) === "desktop") return;
        waitHostAfterUninstall(tr);
      })
      .catch((e) => {
        const msg = String((e && e.message) || e || "");
        if (/failed to fetch|networkerror|load failed/i.test(msg)) {
          setNotice({ kind: "ok", text: hostText(tr, "uninstall.done", hostSurfaceOf(state)) });
          if (hostSurfaceOf(state) === "desktop" || clientGuessSurface() === "desktop") return;
          waitHostAfterUninstall(tr);
          return;
        }
        setNotice({ kind: "error", text: tr("uninstall.fail", { error: msg }) });
        setUninstallBusy(false);
      });
  }, [state, waitHostAfterUninstall]);

  const s = state;
  const total = s && s.patches_total ? s.patches_total : 26;
  const applied = s && typeof s.patches_applied === "number" ? s.patches_applied : 0;
  const skipped = s && typeof s.patches_skipped === "number" ? s.patches_skipped : 0;
  const settled = Math.min(total, applied + skipped);
  const pct = total ? Math.round((settled / total) * 100) : 0;

  const hostSurface = hostSurfaceOf(s);
  const versions = (updateInfo && updateInfo.versions) || [];
  const channelNow = (updateInfo && updateInfo.channel) || channel || "stable";
  const localVer = (s && s.plugin_version) || (updateInfo && updateInfo.localVersion) || "";
  const renderEdition = (id) => {
    const lane = (updateInfo && updateInfo.lanes && updateInfo.lanes[id]) || {};
    const ceiling = listedCeiling(versions, localVer || (updateInfo && updateInfo.localVersion));
    const list = versions.filter((item) => item.channel === id && keepListedVersion(item, ceiling));
    const selectedRef = pick[id] || "";
    const hit = list.find((item) => item.ref === selectedRef) || preferListed(list, localVer);
    const onLane = channelNow === id;
    const noBeta = id === "beta" && Array.isArray(updateInfo && updateInfo.versions) && !list.length;
    const pickedOther = Boolean(hit && selectedRef && !hit.current);
    const thisJob = updateJob && updateJob.id === id ? updateJob : null;
    let actionLabel = t("btn.checkUpdate");
    let actionKind;
    let actionClick = () => checkUpdate(id);
    let actionDisabled = updateBusy || Boolean(noBeta);
    if (noBeta) {
      actionLabel = t("update.noBeta");
      actionClick = () => {};
    } else if (pickedOther) {
      actionLabel = t("update.switch");
      actionKind = "primary";
      actionClick = () => switchSelected(id);
    } else if (!onLane) {
      actionLabel = id === "beta" ? t("channel.useBeta") : t("channel.useStable");
      actionKind = "primary";
      actionClick = () => changeChannel(id);
    } else if (canApplyUpdate && lane.hasUpdate) {
      actionLabel = t("btn.doUpdate");
      actionKind = "primary";
      actionClick = () => doUpdate(id);
    }
    if (thisJob) {
      if (thisJob.kind === "check") actionLabel = t("btn.checkUpdate.busy");
      else if (thisJob.kind === "done") actionLabel = t("btn.doUpdate.busy");
      else actionLabel = t("update.switching");
    }
    return h(
      "div",
      {
        className: "dshp-edition" + (onLane ? " is-on" : ""),
        "aria-label": t("channel." + id),
      },
      h(
        "span",
        { className: "dshp-edition-name" },
        t("channel." + id),
        onLane ? h("em", { className: "dshp-now-mark" }, t("update.current")) : null,
      ),
      h(
        "select",
        {
          className: "dshp-field dshp-ver",
          value: list.length ? (hit && hit.ref) || "" : "",
          disabled: updateBusy || !list.length,
          onChange: (e) => setPick((prev) => Object.assign({}, prev, { [id]: e.target.value })),
          "aria-label": t("update.pick"),
        },
        list.length
          ? list.map((item) =>
              h(
                "option",
                {
                  key: item.ref + (item.sha || ""),
                  value: item.ref,
                },
                versionChoiceLabel(item, t),
              ),
            )
          : h("option", { value: "" }, noBeta ? t("update.noBeta") : t("update.pick")),
      ),
      h(Btn, { tiny: true, kind: actionKind, disabled: actionDisabled, onClick: actionClick }, actionLabel),
    );
  };
  return h(
    "section",
    { className: "dshp-panel", "aria-label": t("purge.title") },
    h(
      "div",
      { className: "dshp-head" },
      h("h3", { className: "dshp-title" }, t("purge.title")),
      h("span", { className: "dshp-pill" }, t("surface." + hostSurface)),
    ),
    h(
      "div",
      { className: "dshp-rel" },
      h(
        "div",
        { className: "dshp-now" },
        h("span", { className: "dshp-now-label" }, t("channel.local")),
        h("b", { className: "dshp-now-ver" }, localVer ? "v" + localVer : "—"),
        h("em", { className: "dshp-now-mark" }, t("update.current")),
      ),
      h("div", { className: "dshp-editions" }, renderEdition("stable"), renderEdition("beta")),
      noticeNode(updateNotice),
    ),
    s
      ? h(
          "div",
          { className: "dshp-metrics" },
          h(
            "div",
            { className: "dshp-metric" },
            h("b", null, settled + " / " + total),
            h("span", null, t("metric.purged")),
          ),
          h(
            "div",
            { className: "dshp-metric" },
            h(
              "b",
              { style: { fontSize: 13, fontFamily: "var(--dshp-mono)", fontWeight: 500 } },
              h("span", { className: "dshp-pill is-" + shimKind(s.shim_cmd) }, "cmd"),
              " ",
              h("span", { className: "dshp-pill is-" + shimKind(s.shim_ps1) }, "ps1"),
              " ",
              h("span", { className: "dshp-pill is-" + shimKind(s.shim_bin || "missing") }, "unix"),
            ),
            h("span", null, t("metric.shim")),
          ),
          h(
            "div",
            { className: "dshp-metric" },
            h("b", null, s.has_backup ? t("metric.bak.yes") : t("metric.bak.no")),
            h("span", null, t("metric.bak.hint")),
          ),
        )
      : h(
          "div",
          { className: "dshp-metrics" },
          h(
            "div",
            { className: "dshp-metric" },
            h("div", { className: "dshp-skel" }),
            h("div", { className: "dshp-skel", style: { width: "40%" } }),
          ),
          h(
            "div",
            { className: "dshp-metric" },
            h("div", { className: "dshp-skel" }),
            h("div", { className: "dshp-skel", style: { width: "40%" } }),
          ),
          h(
            "div",
            { className: "dshp-metric" },
            h("div", { className: "dshp-skel" }),
            h("div", { className: "dshp-skel", style: { width: "40%" } }),
          ),
        ),
    h("div", { className: "dshp-bar", "aria-hidden": "true" }, h("i", { style: { width: pct + "%" } })),
    h(PatchGroups, { state: s }),
    h(
      "div",
      { className: "dshp-row", style: { marginTop: 14 } },
      h(
        Btn,
        { kind: "primary", disabled: patchBusy || uninstallBusy, onClick: () => doAction("apply", "action.apply") },
        patchBusy ? t("btn.apply.busy") : t("btn.apply"),
      ),
      h(
        Btn,
        { kind: "danger", disabled: patchBusy || uninstallBusy, onClick: () => doAction("revert", "action.revert") },
        t("btn.revert"),
      ),
      h(
        Btn,
        { kind: "solid-danger", disabled: patchBusy || uninstallBusy, onClick: () => setAskUninstall(true) },
        uninstallBusy ? t("btn.uninstall.busy") : t("btn.uninstall"),
      ),
      noticeNode(notice),
    ),
    askUninstall
      ? h(
          "div",
          {
            className: "dshp-modal-bg",
            role: "dialog",
            "aria-modal": "true",
            "aria-labelledby": "dshp-uninstall-title",
            onClick: (e) => {
              if (e.target === e.currentTarget && !uninstallBusy) setAskUninstall(false);
            },
          },
          h(
            "div",
            { className: "dshp-modal" },
            h("h4", { id: "dshp-uninstall-title" }, t("uninstall.title")),
            h("p", null, t("uninstall.body")),
            h(
              "div",
              { className: "dshp-modal-ops" },
              h(Btn, { disabled: uninstallBusy, onClick: () => setAskUninstall(false) }, t("uninstall.cancel")),
              h(Btn, { kind: "solid-danger", disabled: uninstallBusy, onClick: doUninstall }, t("uninstall.confirm")),
            ),
          ),
        )
      : null,
    h(
      "p",
      { className: "dshp-hint", style: { margin: "8px 0 0", color: "var(--dshp-mute)", fontSize: 12 } },
      t("apply.hint"),
    ),
    s && !s.ai_base
      ? h(
          "p",
          { className: "dshp-hint", style: { margin: "8px 0 0", color: "var(--dshp-danger, #c44)", fontSize: 12 } },
          hostText(t, "warn.noRoot", hostSurface),
        )
      : null,
    s && s.ai_base && s.override_status === "missing"
      ? h(
          "p",
          { className: "dshp-hint", style: { margin: "8px 0 0", color: "var(--dshp-mute)", fontSize: 12 } },
          t("warn.noInject"),
        )
      : null,
    askRestart
      ? h(
          "div",
          { className: "dshp-ask" },
          h("span", null, hostText(t, "restart.confirm", hostSurface)),
          h(Btn, { tiny: true, onClick: () => setAskRestart(false) }, t("restart.later")),
          h(
            Btn,
            {
              tiny: true,
              kind: "primary",
              onClick: () => {
                setAskRestart(false);
                restartDsh(setNotice, function () {}, t, hostSurface);
              },
            },
            t("btn.restart"),
          ),
        )
      : null,
    // h(ContinueRetrySection, null),
    h(
      "div",
      { className: "dshp-sub" },
      h("h4", null, t("override.title")),
      h(
        "div",
        { className: "dshp-row", style: { margin: 0 } },
        h(
          Btn,
          { kind: "primary", tiny: true, disabled: patchBusy || !overrideLoaded, onClick: saveOverride },
          t("btn.saveInject"),
        ),
        h(
          Btn,
          { tiny: true, disabled: patchBusy || !overrideLoaded || !defaultOverride, onClick: restoreOverride },
          t("btn.restoreInject"),
        ),
      ),
    ),
    h("textarea", {
      className: "dshp-area",
      value: override,
      onChange: (e) => setOverride(e.target.value),
      spellCheck: false,
      placeholder: "",
    }),
    promptBoxEmpty(override)
      ? h(
          "p",
          {
            className: "dshp-hint",
            style: { margin: "8px 0 0", color: "var(--dshp-danger, #c44)", fontSize: 12 },
          },
          t("need.prompt"),
        )
      : null,
  );
}

export { PurgifySection };
