import { REPO, STABLE_REF } from "./update-source.js";
function isAbortError(e) {
  const msg = String((e && e.message) || e || "");
  return (
    (e && (e.name === "AbortError" || e.name === "TimeoutError")) ||
    /aborted|abort/i.test(msg)
  );
}

export async function fetchRes(url, ms = 20000, headers = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => {
    try {
      ctrl.abort("timeout");
    } catch {
      ctrl.abort();
    }
  }, ms);
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "dsh-purge-update", accept: "*/*", ...headers },
      redirect: "follow",
      cache: "no-store",
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`http ${res.status}`);
    return res;
  } catch (e) {
    if (isAbortError(e)) throw new Error("GitHub 超时");
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchText(url, ms = 20000, headers = {}) {
  return (await fetchRes(url, ms, headers)).text();
}

export async function fetchJson(url, ms = 20000, headers = {}) {
  return JSON.parse(await fetchText(url, ms, headers));
}

function versionFromPackageText(text) {
  const pkg = JSON.parse(text);
  return pkg && pkg.version ? String(pkg.version) : "";
}

export async function remotePackageVersion(sha = "", fallbackRef = STABLE_REF) {
  const ref = sha || fallbackRef;
  const urls = [
    sha ? `https://cdn.jsdelivr.net/gh/${REPO}@${sha}/package.json` : "",
    `https://raw.githubusercontent.com/${REPO}/${ref}/package.json`,
    `https://cdn.jsdelivr.net/gh/${REPO}@${ref}/package.json`,
    `https://api.github.com/repos/${REPO}/contents/package.json?ref=${encodeURIComponent(ref)}`,
  ].filter(Boolean);
  for (const url of urls) {
    try {
      if (url.includes("api.github.com/repos/")) {
        const data = await fetchJson(url, 20000, {
          accept: "application/vnd.github.raw",
        });
        if (typeof data === "string") return versionFromPackageText(data);
        if (data && data.version) return String(data.version);
        if (data && data.content && data.encoding === "base64") {
          return versionFromPackageText(
            Buffer.from(data.content.replace(/\s/g, ""), "base64").toString(
              "utf8",
            ),
          );
        }
        continue;
      }
      const ver = versionFromPackageText(await fetchText(url));
      if (ver) return ver;
    } catch {
      // 换下一个源。
    }
  }
  return "";
}

export async function remoteHeadSha(ref = STABLE_REF) {
  const target = encodeURIComponent(ref || STABLE_REF);
  const fromApi = fetchJson(
    `https://api.github.com/repos/${REPO}/commits/${target}`,
  )
    .then((data) => (data?.sha ? String(data.sha) : ""))
    .catch(() => "");
  const fromAtom = fetchText(`https://github.com/${REPO}/commits/${ref}.atom`)
    .then((atom) => {
      const hit = atom.match(
        /<id>tag:github\.com,2008:Grit::Commit\/([0-9a-f]{40})<\/id>/,
      );
      return hit ? hit[1] : "";
    })
    .catch(() => "");
  const [apiSha, atomSha] = await Promise.all([fromApi, fromAtom]);
  return apiSha || atomSha || "";
}
