export function normalizeChannel(value) {
  return String(value || "").toLowerCase() === "beta" ? "beta" : "stable";
}

export function isBetaName(name) {
  return /(?:^|[-._])(beta|rc|pre|preview|test)(?:\d|$|[-._])/i.test(
    String(name || ""),
  );
}

export function withdrawnVersion(item) {
  const text = [item?.version, item?.ref, item?.id].filter(Boolean).join(" ");
  return /(?:^|[\sv])1\.1\.11-beta/i.test(String(text).replace(/^v/i, " "));
}

export function splitVersion(raw) {
  const text = String(raw || "")
    .trim()
    .replace(/^v/i, "");
  const cut = text.split("-");
  const core = String(cut[0] || "")
    .split(".")
    .map((n) => parseInt(n, 10) || 0);
  return {
    core: [core[0] || 0, core[1] || 0, core[2] || 0],
    pre: cut.slice(1).join("-"),
  };
}

export function versionIsNewer(remote, local) {
  if (!remote) return false;
  if (!local) return true;
  if (String(remote) === String(local)) return false;
  const a = splitVersion(remote);
  const b = splitVersion(local);
  for (let i = 0; i < 3; i += 1) {
    if (a.core[i] !== b.core[i]) return a.core[i] > b.core[i];
  }
  if (a.pre && !b.pre) return false;
  if (!a.pre && b.pre) return true;
  return a.pre > b.pre;
}

export function latestStableVersion(versions) {
  let best = "";
  for (const item of versions || []) {
    if (!item || item.channel === "beta") continue;
    const ver = String(item.version || "").replace(/^v/i, "");
    if (!/^\d+\.\d+\.\d+/.test(ver) || isBetaName(ver)) continue;
    if (!best || versionIsNewer(ver, best)) best = ver;
  }
  return best;
}

/** 正式版已经追上的测试版不再列出。1.1.11-beta 始终下线。 */
export function hideListedVersion(item, stableVersion = "") {
  if (!item || withdrawnVersion(item)) return true;
  const beta =
    item.channel === "beta" ||
    isBetaName(item.version) ||
    isBetaName(item.ref) ||
    isBetaName(item.id);
  if (!beta) return false;
  const ceiling = String(stableVersion || "").replace(/^v/i, "");
  if (!ceiling || isBetaName(ceiling)) return false;
  const ver = String(item.version || item.ref || item.id || "").replace(
    /^v/i,
    "",
  );
  if (!/^\d+\.\d+/.test(ver)) return false;
  return !versionIsNewer(ver, ceiling);
}
