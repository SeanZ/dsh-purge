import { h, useT, apiJson, useState, useEffect } from "./common.js";
import { noticeNode } from "./widgets.js";
function ContinueRetrySection() {
  const t = useT();
  const [cfg, setCfg] = useState(null);
  const [notice, setNotice] = useState({ kind: "idle", text: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiJson("/dsh-purge/continue/settings")
      .then((d) => {
        if (d && d.ok) setCfg(d);
      })
      .catch(() => {});
  }, []);

  const save = (patch) => {
    if (!cfg || busy) return;
    const next = { ...cfg, ...patch };
    if (next.autoRetry && !(Number(next.retryMax) > 0)) next.retryMax = 3;
    if (next.autoContinue && !(Number(next.continueMax) > 0)) next.continueMax = 3;
    setCfg(next);
    setBusy(true);
    apiJson("/dsh-purge/continue/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(next),
    })
      .then((d) => {
        if (d && d.ok) {
          setCfg(d);
          setNotice({ kind: "ok", text: t("saved.continue") });
        } else {
          setNotice({ kind: "error", text: t("err.save", { error: (d && d.error) || "" }) });
        }
      })
      .catch((e) => setNotice({ kind: "error", text: t("err.save", { error: e.message }) }))
      .finally(() => setBusy(false));
  };

  if (!cfg) return null;
  return h(
    "div",
    { className: "dshp-cr" },
    h("div", { className: "dshp-sub" }, h("h4", null, t("continue.title")), noticeNode(notice)),
    h(
      "p",
      { className: "dshp-hint", style: { margin: "0 0 4px", color: "var(--dshp-mute)", fontSize: 12 } },
      t("continue.hint"),
    ),
    h(
      "div",
      { className: "dshp-cr-row" },
      h(
        "label",
        null,
        h("input", {
          type: "checkbox",
          checked: Boolean(cfg.autoRetry),
          disabled: busy,
          onChange: (e) => save({ autoRetry: e.target.checked }),
        }),
        t("continue.autoRetry"),
      ),
      h(
        "label",
        null,
        t("continue.retryMax"),
        h("input", {
          className: "dshp-field dshp-cr-num",
          type: "number",
          min: 0,
          max: 20,
          value: cfg.retryMax,
          disabled: busy,
          onChange: (e) => save({ retryMax: Number(e.target.value) }),
        }),
      ),
    ),
    h(
      "div",
      { className: "dshp-cr-row" },
      h(
        "label",
        null,
        h("input", {
          type: "checkbox",
          checked: Boolean(cfg.autoContinue),
          disabled: busy,
          onChange: (e) => save({ autoContinue: e.target.checked }),
        }),
        t("continue.autoContinue"),
      ),
      h(
        "label",
        null,
        t("continue.continueMax"),
        h("input", {
          className: "dshp-field dshp-cr-num",
          type: "number",
          min: 0,
          max: 20,
          value: cfg.continueMax,
          disabled: busy,
          onChange: (e) => save({ continueMax: Number(e.target.value) }),
        }),
      ),
      h(
        "label",
        null,
        t("continue.text"),
        h("input", {
          className: "dshp-field dshp-cr-text",
          type: "text",
          value: cfg.continueText || "",
          disabled: busy,
          onChange: (e) => save({ continueText: e.target.value }),
        }),
      ),
    ),
  );
}

export { ContinueRetrySection };
