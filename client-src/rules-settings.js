import { h, useT, warnNeedPrompt, rulesApi, TARGETS, useState, useEffect, useCallback, useRef } from "./common.js";
import { formatSize, noticeNode, Btn } from "./widgets.js";
function ruleLabel(r) {
  if (!r) return "";
  if (r.name !== r.id) return r.name + " (" + r.id + ")";
  return r.id;
}

function RulesSection() {
  const t = useT();
  const tRef = useRef(t);
  tRef.current = t;
  const [st, setSt] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editTarget, setEditTarget] = useState("AGENTS.md");
  const [content, setContent] = useState("");
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState("AGENTS.md");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState({ kind: "idle", text: "" });

  const loadStatus = useCallback(() => {
    const tr = tRef.current;
    rulesApi("status")
      .then((d) => {
        if (d && d.ok) setSt(d);
        else {
          setSt({ ok: false, rules: [], active: null });
          setNotice({ kind: "error", text: tr("err.rules", { error: (d && d.error) || "bad response" }) });
        }
      })
      .catch((e) => {
        setSt({ ok: false, rules: [], active: null });
        setNotice({ kind: "error", text: tr("err.rules", { error: e.message }) });
      });
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const doPost = useCallback(
    (action, payload, after) => {
      setBusy(true);
      setNotice({ kind: "idle", text: "" });
      rulesApi(action, payload)
        .then((d) => {
          if (d && d.ok) {
            setNotice({ kind: "ok", text: t("ok.done") });
            if (action === "save" || action === "activate") warnNeedPrompt(d, t);
            loadStatus();
            if (after) after();
          } else {
            warnNeedPrompt(d, t);
            setNotice({ kind: "error", text: t("err.action", { error: (d && d.error) || "" }) });
          }
        })
        .catch((e) => setNotice({ kind: "error", text: t("err.action", { error: e.message }) }))
        .finally(() => setBusy(false));
    },
    [loadStatus, t],
  );

  const openRule = useCallback(
    (id) => {
      setBusy(true);
      rulesApi("read", { id: id })
        .then((d) => {
          if (d.ok) {
            setEditId(id);
            setEditName(d.name || id);
            setEditTarget(d.target || "AGENTS.md");
            setContent(typeof d.content === "string" ? d.content : "");
          } else setNotice({ kind: "error", text: t("err.read", { error: d.error || "" }) });
        })
        .catch((e) => setNotice({ kind: "error", text: t("err.read", { error: e.message }) }))
        .finally(() => setBusy(false));
    },
    [t],
  );

  const clearEditor = () => {
    setEditId(null);
    setEditName("");
    setEditTarget("AGENTS.md");
    setContent("");
  };

  let list;
  if (!st) {
    list = h("div", { className: "dshp-skel", style: { height: 80, margin: 12 } });
  } else if (!st.rules || st.rules.length === 0) {
    list = h("p", { className: "dshp-empty" }, t("rules.empty"));
  } else {
    list = st.rules.map((r) => {
      const isActive = r.id === st.active;
      const isEdit = r.id === editId;
      return h(
        "div",
        {
          key: r.id,
          className: "dshp-ruleitem" + (isEdit ? " is-edit" : ""),
          role: "button",
          tabIndex: 0,
          onClick: () => openRule(r.id),
          onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openRule(r.id);
            }
          },
        },
        h(
          "div",
          { className: "dshp-rule-main" },
          h(
            "span",
            { className: "dshp-rule-name" },
            ruleLabel(r),
            isActive ? h("span", { className: "dshp-pill is-ok" }, t("pill.current")) : null,
          ),
          h("span", { className: "dshp-rule-meta" }, r.target + " · " + formatSize(r.size)),
        ),
        h(
          "div",
          { className: "dshp-rule-ops" },
          h(
            Btn,
            {
              tiny: true,
              kind: isActive ? undefined : "primary",
              disabled: busy || isActive,
              onClick: (e) => {
                e.stopPropagation();
                if (!isActive) doPost("activate", { id: r.id });
              },
            },
            isActive ? t("btn.inUse") : t("btn.use"),
          ),
          h(
            Btn,
            {
              tiny: true,
              kind: "danger",
              disabled: busy,
              onClick: (e) => {
                e.stopPropagation();
                if (!window.confirm(t("confirm.delete", { id: r.id }))) return;
                if (editId === r.id) clearEditor();
                doPost("delete", { id: r.id });
              },
            },
            t("delete"),
          ),
        ),
      );
    });
  }

  return h(
    "section",
    { className: "dshp-panel", "aria-label": t("rules.title") },
    h(
      "div",
      { className: "dshp-head" },
      h("h3", { className: "dshp-title" }, t("rules.title")),
      h(
        "div",
        { className: "dshp-row", style: { margin: 0 } },
        noticeNode(notice),
        h(
          Btn,
          {
            tiny: true,
            kind: "danger",
            disabled: busy,
            onClick: () => {
              if (!window.confirm(t("rules.reset.confirm"))) return;
              clearEditor();
              doPost("reset", {});
            },
          },
          t("rules.reset"),
        ),
      ),
    ),
    h(
      "div",
      { className: "dshp-split" },
      h(
        "div",
        { className: "dshp-rulelist" },
        h("div", { className: "dshp-rulebody" }, list),
        h(
          "div",
          { className: "dshp-create" },
          h(
            "div",
            { className: "dshp-create-row" },
            h("input", {
              className: "dshp-field",
              placeholder: t("ph.id"),
              value: newId,
              onChange: (e) => setNewId(e.target.value),
            }),
            h("input", {
              className: "dshp-field",
              placeholder: t("ph.alias"),
              value: newName,
              onChange: (e) => setNewName(e.target.value),
            }),
            h(
              "select",
              {
                className: "dshp-field",
                style: { minWidth: 120, flex: "0 0 auto" },
                value: newTarget,
                onChange: (e) => setNewTarget(e.target.value),
              },
              TARGETS.map((x) => h("option", { key: x, value: x }, x)),
            ),
            h(
              Btn,
              {
                kind: "primary",
                tiny: true,
                disabled: busy,
                onClick: () => {
                  const id = newId.trim();
                  if (!id) {
                    setNotice({ kind: "error", text: t("need.id") });
                    return;
                  }
                  const name = newName.trim() || id;
                  const target = newTarget;
                  doPost("save", { id, content: "", name, target }, () => {
                    setEditId(id);
                    setEditName(name);
                    setEditTarget(target);
                    setContent("");
                  });
                  setNewId("");
                  setNewName("");
                  setNewTarget("AGENTS.md");
                },
              },
              t("btn.create"),
            ),
          ),
        ),
      ),
      h(
        "div",
        { className: "dshp-editor" },
        editId
          ? [
              h(
                "div",
                { key: "meta", className: "dshp-row" },
                h("input", {
                  className: "dshp-field",
                  placeholder: t("ph.alias.short"),
                  value: editName,
                  onChange: (e) => setEditName(e.target.value),
                }),
                h(
                  "select",
                  {
                    className: "dshp-field",
                    style: { minWidth: 120 },
                    value: editTarget,
                    onChange: (e) => setEditTarget(e.target.value),
                  },
                  TARGETS.map((x) => h("option", { key: x, value: x }, x)),
                ),
              ),
              h("textarea", {
                key: "body",
                className: "dshp-area",
                value: content,
                onChange: (e) => setContent(e.target.value),
                placeholder: "",
              }),
              h(
                "div",
                { key: "save", className: "dshp-row" },
                h(
                  Btn,
                  {
                    kind: "primary",
                    disabled: busy,
                    onClick: () => doPost("save", { id: editId, content, name: editName, target: editTarget }),
                  },
                  t("btn.saveRule"),
                ),
                noticeNode(notice),
              ),
            ]
          : h("div", { className: "dshp-editor-empty" }, t("rules.pick")),
      ),
    ),
  );
}

export { ruleLabel, RulesSection };
