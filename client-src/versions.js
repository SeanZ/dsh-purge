function skillUiAllowed(d) {
  if (!d) return false;
  const ver = String(d.plugin_version || d.localVersion || "").replace(/^v/i, "");
  if (/^1\.1\.11(?:-|$)/.test(ver)) return false;
  const parts = ver.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!parts) return false;
  if (+parts[1] !== 1) return +parts[1] > 1;
  if (+parts[2] !== 1) return +parts[2] > 1;
  return +parts[3] >= 12;
}

function splitListedVersion(raw) {
  const text = String(raw || "")
    .trim()
    .replace(/^v/i, "");
  const cut = text.split("-");
  const core = String(cut[0] || "")
    .split(".")
    .map((n) => parseInt(n, 10) || 0);
  return { core: [core[0] || 0, core[1] || 0, core[2] || 0], pre: cut.slice(1).join("-") };
}

function listedVersionNewer(remote, local) {
  if (!remote || !local || String(remote) === String(local)) return false;
  const a = splitListedVersion(remote);
  const b = splitListedVersion(local);
  for (let i = 0; i < 3; i += 1) {
    if (a.core[i] !== b.core[i]) return a.core[i] > b.core[i];
  }
  if (a.pre && !b.pre) return false;
  if (!a.pre && b.pre) return true;
  return a.pre > b.pre;
}

function listedCeiling(versions, localVer) {
  let best = "";
  const rows = (versions || []).slice();
  const local = String(localVer || "").replace(/^v/i, "");
  if (local && !/(?:^|[-._])(beta|rc|pre|preview|test)(?:\d|$|[-._])/i.test(local)) {
    rows.push({ channel: "stable", version: local });
  }
  for (const item of rows) {
    if (!item || item.channel === "beta") continue;
    const ver = String(item.version || "").replace(/^v/i, "");
    if (!/^\d+\.\d+\.\d+/.test(ver) || /(?:^|[-._])(beta|rc|pre|preview|test)(?:\d|$|[-._])/i.test(ver)) continue;
    if (!best || listedVersionNewer(ver, best)) best = ver;
  }
  return best;
}

function keepListedVersion(item, ceiling) {
  const ver = String((item && (item.version || item.ref)) || "").replace(/^v/i, "");
  if (/^1\.1\.11-beta/i.test(ver)) return false;
  if (item && item.channel === "beta" && ceiling && !listedVersionNewer(ver, ceiling)) return false;
  return true;
}

function preferListed(list, localVer) {
  const ver = String(localVer || "").replace(/^v/i, "");
  return (
    (list || []).find((item) => item.current) ||
    (list || []).find((item) => ver && String(item.version || "").replace(/^v/i, "") === ver) ||
    (list || []).find((item) => item.latest) ||
    (list || [])[0] ||
    null
  );
}

function versionChoiceLabel(item, tr) {
  const ver = String((item && item.version) || "").replace(/^v/i, "");
  const base = ver ? "v" + ver : (item && (item.label || item.ref)) || "—";
  if (item && item.current) return base + " · " + tr("update.current");
  if (item && item.latest) return base + " · " + tr("update.tip");
  return base;
}

export {
  skillUiAllowed,
  splitListedVersion,
  listedVersionNewer,
  listedCeiling,
  keepListedVersion,
  preferListed,
  versionChoiceLabel,
};
