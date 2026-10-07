import { h, useT, PATCH_GROUPS, useState } from "./common.js";
function formatSize(bytes) {
  if (typeof bytes !== "number" || !isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes < 1024) return bytes + " B";
  const kb = bytes / 1024;
  return (kb >= 100 ? Math.round(kb) : kb.toFixed(1)) + " KB";
}

function statusKind(st) {
  if (st === "applied" || st === "already") return "ok";
  if (st === "pending") return "wait";
  if (st === "missing_file" || st === "skipped") return "miss";
  return "bad";
}

function statusLabel(st, t) {
  if (st === "applied" || st === "already") return t("status.applied");
  if (st === "pending") return t("status.pending");
  if (st === "skipped") return t("status.skipped");
  if (st === "missing_file") return t("skip");
  return st || t("unknown");
}

function statusSettled(st) {
  return st === "applied" || st === "already" || st === "skipped" || st === "missing_file";
}

function shimKind(v) {
  if (v === "patched") return "ok";
  if (v === "original") return "wait";
  if (v === "missing" || v === "n/a" || !v) return "miss";
  return "bad";
}

function noticeNode(notice) {
  if (!notice || notice.kind === "idle" || !notice.text) return null;
  return h("span", { className: "dshp-notice " + (notice.kind === "error" ? "is-bad" : "is-ok") }, notice.text);
}

function Btn(props) {
  const { kind, tiny, children, className, type, ...rest } = props;
  const cls = ["dshp-btn", kind ? "dshp-btn-" + kind : "dshp-btn-ghost", tiny ? "dshp-btn-tiny" : "", className || ""]
    .filter(Boolean)
    .join(" ");
  return h("button", Object.assign({ type: type || "button", className: cls }, rest), children);
}

function Pill({ value, label }) {
  const t = useT();
  return h("span", { className: "dshp-pill is-" + statusKind(value) }, label || statusLabel(value, t));
}

function PatchGroups({ state }) {
  const t = useT();
  const [open, setOpen] = useState({});
  if (!state || !state.patch_status) return h("div", { className: "dshp-skel", style: { height: 120 } });
  return PATCH_GROUPS.map((group) => {
    const rows = group.ids.map((id) => {
      const st = state.patch_status[id] || state.patch_status[String(id)] || "missing_file";
      return { id, st, label: t("patch." + id) };
    });
    const done = rows.filter((r) => statusSettled(r.st)).length;
    const expanded = !!open[group.key];
    return h(
      "div",
      { key: group.key, className: "dshp-group" },
      h(
        "button",
        {
          type: "button",
          className: "dshp-group-h",
          "aria-expanded": expanded ? "true" : "false",
          onClick: () => setOpen((prev) => Object.assign({}, prev, { [group.key]: !prev[group.key] })),
        },
        h("strong", null, t("group." + group.key)),
        h("span", { className: "dshp-count" }, done + "/" + rows.length),
      ),
      expanded
        ? h(
            "table",
            { className: "dshp-table" },
            h(
              "thead",
              null,
              h("tr", null, h("th", null, "#"), h("th", null, t("table.patch")), h("th", null, t("table.status"))),
            ),
            h(
              "tbody",
              null,
              rows.map((r) =>
                h(
                  "tr",
                  { key: r.id },
                  h("td", { className: "dshp-id" }, "#" + r.id),
                  h("td", null, r.label),
                  h("td", null, h(Pill, { value: r.st })),
                ),
              ),
            ),
          )
        : null,
    );
  });
}

export { formatSize, statusKind, statusLabel, statusSettled, shimKind, noticeNode, Btn, Pill, PatchGroups };
