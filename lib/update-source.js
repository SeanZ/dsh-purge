export const REPO = "SeanZ/dsh-purge";
export const STABLE_REF = "v1.1.15-seanz.1";
export const BETA_REF = "compat/dsh-015rc2-tavern-disabled-beta";
export const TARBALL_URL = `https://github.com/${REPO}/archive/refs/tags/${STABLE_REF}.tar.gz`;

export function archiveZipUrl(ref) {
  const value = String(ref || STABLE_REF);
  if (/^[0-9a-f]{40}$/i.test(value))
    return `https://github.com/${REPO}/archive/${value}.zip`;
  if (/^v?\d/.test(value))
    return `https://github.com/${REPO}/archive/refs/tags/${encodeURIComponent(value)}.zip`;
  return `https://github.com/${REPO}/archive/refs/heads/${encodeURIComponent(value)}.zip`;
}

export function archiveTarballUrl(ref) {
  const value = String(ref || STABLE_REF);
  if (/^[0-9a-f]{40}$/i.test(value))
    return `https://github.com/${REPO}/archive/${value}.tar.gz`;
  if (/^v?\d/.test(value))
    return `https://github.com/${REPO}/archive/refs/tags/${encodeURIComponent(value)}.tar.gz`;
  return `https://github.com/${REPO}/archive/refs/heads/${encodeURIComponent(value)}.tar.gz`;
}

// 兼容部署只能更新到本发行标签；升级需发布新的兼容制品并改此锁。
export function safeUpdateRef(ref) {
  const target = String(ref || "").trim();
  return target === STABLE_REF ? target : "";
}
