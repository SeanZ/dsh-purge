import { STABLE_REF } from "./update-source.js";
import { isBetaName } from "./update-version.js";
export function sameRev(a, b) {
  if (!a || !b) return false;
  return a === b || a.startsWith(b) || b.startsWith(a);
}

export function versionLabel(version, channel, sha = "") {
  const ver =
    String(version || "").replace(/^v/, "") ||
    (sha ? String(sha).slice(0, 7) : "");
  const mark = channel === "beta" ? "测试" : "正式";
  return ver ? `${ver}（${mark}）` : mark;
}

export function rememberVersion(item, seen) {
  if (!item || !item.ref) return null;
  const key = `${item.sha || ""}|${item.ref}`.toLowerCase();
  if (seen.has(key)) return null;
  seen.add(key);
  return item;
}

export function markCurrent(versions, state, localVer, localSha) {
  const pin = String(state?.pin || "");
  const rows = versions || [];
  const ver = String(localVer || "").replace(/^v/i, "");
  const shaMatched = rows.some(
    (item) => localSha && item.sha && sameRev(localSha, item.sha),
  );
  const versionOnLatest = rows.some(
    (item) =>
      item.latest &&
      item.channel === state?.channel &&
      String(item.version || "").replace(/^v/i, "") === ver,
  );
  const versionFallback = versionOnLatest
    ? null
    : rows.find(
        (item) =>
          item.channel === state?.channel &&
          String(item.version || "").replace(/^v/i, "") === ver,
      );
  return rows.map((item) => {
    const shaHit = Boolean(localSha && item.sha && sameRev(localSha, item.sha));
    const pinHit = Boolean(pin && item.ref === pin);
    // 提交号对不上时，只把本通道里和本机版本号相同的那一条标成当前。
    const headHit = Boolean(
      !pin &&
        !shaMatched &&
        ver &&
        (versionOnLatest
          ? item.latest &&
            item.channel === state?.channel &&
            String(item.version || "").replace(/^v/i, "") === ver
          : versionFallback && item === versionFallback),
    );
    return {
      ...item,
      shaShort: item.shaShort || (item.sha ? String(item.sha).slice(0, 7) : ""),
      current: shaHit || pinHit || headHit,
    };
  });
}

export function ensureRunningVersion(versions, state, localVer, localSha) {
  const ver = String(localVer || "").replace(/^v/i, "");
  if (!ver || isBetaName(ver) || state?.channel === "beta") return versions;
  if (
    (versions || []).some(
      (item) =>
        item.channel === "stable" &&
        String(item.version || "").replace(/^v/i, "") === ver,
    )
  ) {
    return versions;
  }
  const ref = (versions || []).some((item) => item.ref === STABLE_REF)
    ? `local-${ver}`
    : STABLE_REF;
  return [
    {
      id: ref,
      ref,
      sha: localSha || "",
      version: ver,
      channel: "stable",
      label: versionLabel(ver, "stable", localSha),
      kind: "local",
      latest: !(versions || []).some(
        (item) => item.channel === "stable" && item.latest,
      ),
    },
    ...(versions || []),
  ];
}
