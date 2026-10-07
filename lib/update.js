import {
  sameRev,
  versionLabel,
  rememberVersion,
  markCurrent,
  ensureRunningVersion,
} from "./update-list.js";
export { markCurrent } from "./update-list.js";
import {
  REPO,
  STABLE_REF,
  BETA_REF,
  safeUpdateRef,
  archiveZipUrl,
  archiveTarballUrl,
} from "./update-source.js";
export { STABLE_REF, TARBALL_URL, safeUpdateRef } from "./update-source.js";
import {
  fetchRes,
  fetchJson,
  remotePackageVersion,
  remoteHeadSha,
} from "./update-network.js";
import {
  normalizeChannel,
  isBetaName,
  withdrawnVersion,
  versionIsNewer,
  latestStableVersion,
  hideListedVersion,
} from "./update-version.js";
export {
  normalizeChannel,
  versionIsNewer,
  latestStableVersion,
  hideListedVersion,
} from "./update-version.js";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { promises as fsp } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findDshHome } from "./core.js";
import { adapterFor, detectSurface } from "./surface.js";
import { cliInvocation } from "./desktop.js";

const PLUGIN_ROOT = path.resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  "..",
);
const CHANNELS = {
  stable: { id: "stable", ref: STABLE_REF, label: "正式版" },
  beta: { id: "beta", ref: BETA_REF, label: "测试版" },
};
const COPY_NAMES = [
  "lib",
  "bin",
  "docs",
  "client.js",
  "cordis.patch.yml",
  "screenshots.json",
  "package.json",
  "README.md",
  "README.zh-CN.md",
  "LICENSE",
];

const HIDDEN = {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "ignore"],
  windowsHide: true,
  timeout: 20000,
};

export function pluginRoot() {
  return PLUGIN_ROOT;
}

export function localVersion() {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(PLUGIN_ROOT, "package.json"), "utf8"),
    );
    return String(pkg.version || "");
  } catch {
    return "";
  }
}

function channelStatePath() {
  return path.join(findDshHome(), "dsh-purge", "channel.json");
}

function historyPath() {
  return path.join(findDshHome(), "dsh-purge", "version-history.json");
}

function stampPath() {
  return path.join(findDshHome(), "dsh-purge", "installed-rev");
}

export function readChannelState() {
  const raw = readJson(channelStatePath()) || {};
  return {
    channel: normalizeChannel(raw.channel),
    pin: typeof raw.pin === "string" ? raw.pin.trim() : "",
  };
}

function writeChannelState(next) {
  const state = {
    channel: normalizeChannel(next?.channel),
    pin: typeof next?.pin === "string" ? next.pin.trim() : "",
  };
  fs.mkdirSync(path.dirname(channelStatePath()), { recursive: true });
  fs.writeFileSync(
    channelStatePath(),
    `${JSON.stringify(state, null, 2)}\n`,
    "utf8",
  );
  return state;
}

export function channelPublic(state = readChannelState()) {
  const meta = CHANNELS[state.channel] || CHANNELS.stable;
  return {
    channel: meta.id,
    channelLabel: meta.label,
    pin: state.pin || "",
  };
}

function currentChannelRef(_state = readChannelState()) {
  return STABLE_REF;
}

function readHistory() {
  const raw = readJson(historyPath());
  const rows = Array.isArray(raw) ? raw : [];
  return rows.filter((item) => item && !withdrawnVersion(item));
}

function pushHistory(entry) {
  const next = [
    entry,
    ...readHistory().filter((item) => item && item.ref !== entry.ref),
  ].slice(0, 20);
  fs.mkdirSync(path.dirname(historyPath()), { recursive: true });
  fs.writeFileSync(historyPath(), `${JSON.stringify(next, null, 2)}\n`, "utf8");
}

function readStamp() {
  try {
    return fs.readFileSync(stampPath(), "utf8").trim();
  } catch {
    return "";
  }
}

function writeStamp(value) {
  if (!value) return;
  const fp = stampPath();
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, `${value}\n`, "utf8");
}

export function realPath(dir) {
  try {
    return fs.realpathSync(dir);
  } catch {
    return path.resolve(dir);
  }
}

function readJson(fp) {
  try {
    return JSON.parse(fs.readFileSync(fp, "utf8"));
  } catch {
    return null;
  }
}

function isGitCheckout(dir) {
  return fs.existsSync(path.join(dir, ".git"));
}

function canGit(dir) {
  if (!isGitCheckout(dir)) return false;
  try {
    execFileSync(
      "git",
      ["-C", dir, "rev-parse", "--is-inside-work-tree"],
      HIDDEN,
    );
    return true;
  } catch {
    return false;
  }
}

function gitOk() {
  return canGit(PLUGIN_ROOT);
}

function gitHead(dir) {
  try {
    return execFileSync("git", ["-C", dir, "rev-parse", "HEAD"], HIDDEN).trim();
  } catch {
    return "";
  }
}

export function isLinkSpec(spec) {
  const s = String(spec || "");
  return /^(link|file):/i.test(s) || s === "." || /^\.\.?(?:[/\\]|$)/.test(s);
}

export function resolveLinkDir(profileDir, spec) {
  const raw = String(spec).replace(/^(link|file):/i, "");
  return path.resolve(profileDir, raw);
}

export function findPurgeProfiles() {
  const root = path.join(findDshHome(), "profiles");
  if (!fs.existsSync(root)) return [];
  let names = [];
  try {
    names = fs.readdirSync(root);
  } catch {
    return [];
  }
  const out = [];
  for (const name of names) {
    const dir = path.join(root, name);
    const pkg = readJson(path.join(dir, "package.json"));
    const spec =
      pkg?.dependencies?.["dsh-purge"] || pkg?.devDependencies?.["dsh-purge"];
    if (!spec) continue;
    out.push({ name, dir, spec: String(spec) });
  }
  return out;
}

export function profilePluginDir(profileDir) {
  const nm = path.join(profileDir, "node_modules", "dsh-purge");
  return fs.existsSync(nm) ? realPath(nm) : "";
}

function resolveDshBin() {
  try {
    execFileSync(
      process.platform === "win32" ? "where" : "which",
      ["dsh"],
      HIDDEN,
    );
    return "dsh";
  } catch {
    // 桌面进程 PATH 里经常没有 dsh，再到启动器旁找。
  }
  const home = findDshHome();
  const names =
    process.platform === "win32" ? ["dsh.cmd", "dsh.exe", "dsh"] : ["dsh"];
  const dirs = [
    path.join(home, "..", "npm-global"),
    path.join(home, "..", "npm-global-0.1.5-rc.2"),
    path.join(home, "..", "npm-global-0.1.5-rc.1"),
    path.join(home, "bin"),
  ];
  for (const dir of dirs) {
    for (const name of names) {
      const fp = path.join(dir, name);
      if (fs.existsSync(fp)) return fp;
    }
  }
  return "";
}

export function runDshPlugin(profile, args) {
  if (adapterFor(detectSurface()) === "desktop") {
    const inv = cliInvocation();
    if (!inv) throw new Error("找不到 DSH Desktop CLI");
    execFileSync(
      inv.execPath,
      [...inv.argvPrefix, "plugin", "--profile", profile, ...args],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
        timeout: 120000,
        env: {
          ...process.env,
          ...inv.env,
          DSH_HOME: findDshHome(),
          CI: "1",
        },
      },
    );
    return;
  }
  const bin = resolveDshBin();
  if (!bin) throw new Error("找不到 dsh");
  execFileSync(bin, ["plugin", "--profile", profile, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
    timeout: 120000,
    env: {
      ...process.env,
      DSH_HOME: findDshHome(),
      CI: "1",
    },
  });
}

export function pluginAddSpec(spec, ref = currentChannelRef()) {
  if (!safeUpdateRef(ref)) return "";
  const s = String(spec || "");
  // github: / git+https 会让 pnpm 跑 git ls-remote。没装 git 时就是 #30。
  // 公开仓库用 archive tar.gz，不依赖本机 git。
  if (
    /\.(zip|tgz|tar\.gz)(\b|$)/i.test(s) ||
    /^https?:\/\//i.test(s) ||
    /^git\+https?:\/\//i.test(s) ||
    /^github:/i.test(s) ||
    /github\.com\/.+\.git/i.test(s)
  ) {
    return archiveTarballUrl(ref);
  }
  return "";
}

function dshReinstall(profile, _spec, ref = currentChannelRef()) {
  if (!safeUpdateRef(ref)) throw new Error("未知兼容版本");
  // 无论旧 profile 记录 npm、Git 还是本地来源，只从固定 fork 归档重装。
  runDshPlugin(profile, ["add", "--force", archiveTarballUrl(ref)]);
}

function planUpdates() {
  const profiles = findPurgeProfiles();
  const jobs = [];
  const seen = new Set();
  const remember = (dir) => {
    const key = realPath(dir).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  };

  for (const p of profiles) {
    if (isLinkSpec(p.spec)) {
      const dir = resolveLinkDir(p.dir, p.spec);
      if (!remember(dir)) continue;
      jobs.push(
        canGit(dir)
          ? { kind: "git", dir, profile: p.name }
          : { kind: "zip", dir, profile: p.name },
      );
      continue;
    }
    const dir = profilePluginDir(p.dir) || PLUGIN_ROOT;
    jobs.push({ kind: "dsh", profile: p.name, spec: p.spec, dir });
    remember(dir);
  }

  if (!jobs.length) {
    jobs.push(
      canGit(PLUGIN_ROOT)
        ? { kind: "git", dir: PLUGIN_ROOT }
        : { kind: "zip", dir: PLUGIN_ROOT },
    );
    return jobs;
  }
  if (remember(PLUGIN_ROOT)) {
    jobs.push(
      canGit(PLUGIN_ROOT)
        ? { kind: "git", dir: PLUGIN_ROOT }
        : { kind: "zip", dir: PLUGIN_ROOT },
    );
  }
  return jobs;
}

function detectVia() {
  if (gitOk()) {
    const extra = findPurgeProfiles().some((p) => !isLinkSpec(p.spec));
    return extra ? "mixed" : "git";
  }
  if (findPurgeProfiles().some((p) => !isLinkSpec(p.spec))) return "dsh";
  if (findPurgeProfiles().length) return "dsh";
  return "zip";
}

async function listGithubTags() {
  try {
    const rows = await fetchJson(
      `https://api.github.com/repos/${REPO}/tags?per_page=50`,
    );
    if (!Array.isArray(rows)) return [];
    return rows
      .map((row) => {
        const name = String(row?.name || "").trim();
        if (!safeUpdateRef(name)) return null;
        const sha = row?.commit?.sha ? String(row.commit.sha) : "";
        const channel = isBetaName(name) ? "beta" : "stable";
        return {
          id: name,
          ref: name,
          sha,
          version: name.replace(/^v/, ""),
          channel,
          label: versionLabel(name, channel, sha),
          kind: "tag",
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function listRemoteVersions() {
  const state = readChannelState();
  const seen = new Set();
  const out = [];
  const add = (item) => {
    const next = rememberVersion(item, seen);
    if (next) out.push(next);
  };

  const [stableSha, betaSha, tags] = await Promise.all([
    remoteHeadSha(STABLE_REF),
    Promise.resolve(""),
    listGithubTags(),
  ]);

  if (stableSha) {
    const version = await remotePackageVersion(stableSha, STABLE_REF).catch(
      () => "",
    );
    add({
      id: STABLE_REF,
      ref: STABLE_REF,
      sha: stableSha,
      version: version || "",
      channel: "stable",
      label: `${versionLabel(version, "stable", stableSha)} · 最新`,
      kind: "head",
      latest: true,
    });
  }
  if (betaSha) {
    const version = await remotePackageVersion(betaSha, BETA_REF).catch(
      () => "",
    );
    add({
      id: BETA_REF,
      ref: BETA_REF,
      sha: betaSha,
      version: version || "",
      channel: "beta",
      label: `${versionLabel(version, "beta", betaSha)} · 最新`,
      kind: "head",
      latest: true,
    });
  }
  for (const tag of tags) {
    if (!withdrawnVersion(tag)) add(tag);
  }
  for (const item of readHistory()) {
    if (!item || !safeUpdateRef(item.ref) || withdrawnVersion(item)) continue;
    add({
      ...item,
      label: item.label || versionLabel(item.version, item.channel, item.sha),
      kind: item.kind || "history",
    });
  }

  const localVer = localVersion();
  const localSha = (gitOk() ? gitHead(PLUGIN_ROOT) : "") || readStamp();
  const withLocal = ensureRunningVersion(out, state, localVer, localSha);
  const ceiling = latestStableVersion(
    [
      ...withLocal,
      localVer && !isBetaName(localVer)
        ? { channel: "stable", version: localVer }
        : null,
    ].filter(Boolean),
  );
  const visible = withLocal.filter((item) => !hideListedVersion(item, ceiling));
  const betaOpen = visible.some((item) => item.channel === "beta");
  return {
    versions: markCurrent(visible, state, localVer, localSha),
    hasBeta: betaOpen,
    stableSha,
    betaSha: betaOpen ? betaSha : "",
  };
}

function alignChannelState(state, listed, localRev, localVer) {
  if (state.pin) return state;
  if (
    listed.betaSha &&
    localRev &&
    sameRev(localRev, listed.betaSha) &&
    state.channel !== "beta"
  ) {
    return writeChannelState({ channel: "beta", pin: "" });
  }
  if (
    listed.stableSha &&
    localRev &&
    sameRev(localRev, listed.stableSha) &&
    state.channel !== "stable"
  ) {
    return writeChannelState({ channel: "stable", pin: "" });
  }
  if (!localRev && localVer) {
    const inferred = isBetaName(localVer) ? "beta" : "stable";
    if (inferred !== state.channel)
      return writeChannelState({ channel: inferred, pin: "" });
  }
  return state;
}

function describeLane(id, listed, state, localVer, localRev) {
  const sha = id === "beta" ? listed.betaSha : listed.stableSha;
  const versions = listed.versions.filter((item) => item.channel === id);
  const latest = versions.find((item) => item.latest);
  const version = latest?.version || "";
  const onLane = state.channel === id;
  const matchesHead = Boolean(localRev && sha && sameRev(localRev, sha));
  const current =
    matchesHead ||
    versions.some(
      (item) =>
        item.current && (item.latest || (state.pin && item.ref === state.pin)),
    );
  let hasUpdate = false;
  if (onLane && state.pin) {
    hasUpdate = Boolean(sha && localRev && !sameRev(localRev, sha));
  } else if (onLane && sha && localRev) {
    hasUpdate = !sameRev(localRev, sha) || versionIsNewer(version, localVer);
  } else if (onLane && versionIsNewer(version, localVer)) {
    hasUpdate = true;
  }
  return {
    id,
    ref: CHANNELS[id].ref,
    version,
    sha: sha ? String(sha).slice(0, 7) : "",
    current,
    hasUpdate,
    hasRemote: Boolean(sha || versions.length),
  };
}

function lanesOf(listed, state, localVer, localRev) {
  return {
    stable: describeLane("stable", listed, state, localVer, localRev),
    beta: describeLane("beta", listed, state, localVer, localRev),
  };
}

export async function checkUpdate() {
  let state = readChannelState();
  const localVer = localVersion();
  const listed = await listRemoteVersions();
  const gitSha = gitOk() ? gitHead(PLUGIN_ROOT) : "";
  const stamp = readStamp();
  const localRev = gitSha || stamp;
  state = alignChannelState(state, listed, localRev, localVer);
  listed.versions = markCurrent(listed.versions, state, localVer, localRev);
  const channelRef = currentChannelRef(state);
  const lanes = lanesOf(listed, state, localVer, localRev);
  const lane = lanes[state.channel] || lanes.stable;
  if (!lane.hasRemote && state.channel === "beta") {
    return rememberUpdate({
      ok: true,
      hasUpdate: false,
      hasBeta: false,
      error: "还没有测试版",
      localVersion: localVer,
      remoteVersion: "",
      localSha: localRev ? localRev.slice(0, 7) : "",
      remoteSha: "",
      updateTarget: channelRef,
      via: detectVia(),
      versions: listed.versions,
      lanes,
      ...channelPublic(state),
    });
  }
  if (!lanes.stable.hasRemote) throw new Error("无法读取固定兼容发行版本");
  const result = {
    ok: true,
    hasUpdate: Boolean(lane.hasUpdate),
    hasBeta: listed.hasBeta,
    updateTarget: channelRef,
    pinned: Boolean(state.pin),
    localVersion: localVer,
    remoteVersion: lane.version || lane.sha,
    localSha: localRev ? localRev.slice(0, 7) : "",
    remoteSha: lane.sha,
    via: detectVia(),
    versions: listed.versions,
    lanes,
    ...channelPublic(state),
  };
  rememberUpdate(result);
  return result;
}

function gitTrackedDirty(dir) {
  try {
    const out = execFileSync(
      "git",
      [
        "-C",
        dir,
        "status",
        "--porcelain",
        "--untracked-files=no",
        "--",
        ...COPY_NAMES,
      ],
      HIDDEN,
    ).trim();
    return Boolean(out);
  } catch {
    return true;
  }
}

let lastUpdate = null;

function rememberUpdate(result) {
  lastUpdate = result && typeof result === "object" ? result : lastUpdate;
  return lastUpdate;
}

export function lastUpdateResult() {
  return lastUpdate;
}

function runGit(dir, args, timeout = 20000) {
  try {
    return execFileSync("git", ["-C", dir, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
      timeout,
    });
  } catch (e) {
    const detail = [e.stderr, e.stdout, e.message]
      .filter(Boolean)
      .join("\n")
      .trim();
    throw new Error(detail || `git ${args.join(" ")}`);
  }
}

function gitResetTo(dir, ref, { force = false } = {}) {
  if (!force && gitTrackedDirty(dir)) {
    throw new Error("本地插件文件有未提交改动，未覆盖");
  }
  const target = safeUpdateRef(ref || STABLE_REF);
  if (!target) throw new Error("未知版本");
  runGit(
    dir,
    ["fetch", `https://github.com/${REPO}.git`, `refs/tags/${target}`],
    60000,
  );
  runGit(dir, ["reset", "--hard", "FETCH_HEAD"]);
}

function extractZip(zip, dest) {
  try {
    execFileSync("tar", ["-xf", zip, "-C", dest], {
      ...HIDDEN,
      timeout: 60000,
    });
    return;
  } catch {
    // Windows 10+ 自带 tar；没有或失败时改 PowerShell。
  }
  execFileSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      "Expand-Archive -LiteralPath $env:DSH_UPD_ZIP -DestinationPath $env:DSH_UPD_DIR -Force",
    ],
    {
      ...HIDDEN,
      timeout: 60000,
      env: { ...process.env, DSH_UPD_ZIP: zip, DSH_UPD_DIR: dest },
    },
  );
}

async function overlayFromZip(dests, ref = STABLE_REF) {
  const unique = [...new Set(dests.filter(Boolean).map((d) => realPath(d)))];
  if (!unique.length) return;
  const tmp = await fsp.mkdtemp(path.join(os.tmpdir(), "dsh-purge-upd-"));
  const zip = path.join(tmp, "plugin.zip");
  const res = await fetchRes(archiveZipUrl(ref), 45000);
  await fsp.writeFile(zip, Buffer.from(await res.arrayBuffer()));
  extractZip(zip, tmp);
  const names = await fsp.readdir(tmp);
  const unpacked = names
    .map((n) => path.join(tmp, n))
    .find((p) => fs.existsSync(path.join(p, "package.json")));
  if (!unpacked) throw new Error("zip 里没有 package.json");
  for (const dest of unique) {
    for (const name of COPY_NAMES) {
      const from = path.join(unpacked, name);
      const to = path.join(dest, name);
      if (!fs.existsSync(from)) continue;
      if (name === "lib" || name === "docs" || name === "bin") {
        try {
          await fsp.rm(to, { recursive: true, force: true });
        } catch {
          // 目录被占用时改为覆盖写入。
        }
      }
      await fsp.cp(from, to, { recursive: true, force: true });
    }
  }
  try {
    await fsp.rm(tmp, { recursive: true, force: true });
  } catch {
    // 临时目录清不掉不影响安装结果。
  }
}

export async function applyUpdate(jobs = planUpdates(), options = {}) {
  if (!Array.isArray(jobs)) {
    options = jobs && typeof jobs === "object" ? jobs : {};
    jobs = planUpdates();
  }
  const state = readChannelState();
  const ref = safeUpdateRef(
    options.ref || currentChannelRef(state) || STABLE_REF,
  );
  if (!ref) throw new Error("未知版本");
  const force = options.force !== false;
  const zipDirs = [];
  const vias = new Set();
  for (const job of jobs) {
    if (job.kind === "git") {
      try {
        gitResetTo(job.dir, ref, { force });
        vias.add("git");
        continue;
      } catch (e) {
        if (!force && /未提交改动/.test(String(e && e.message))) throw e;
        zipDirs.push(job.dir);
      }
      continue;
    }
    if (job.kind === "dsh") {
      try {
        dshReinstall(job.profile, job.spec, ref);
        vias.add("dsh");
        continue;
      } catch {
        zipDirs.push(job.dir);
      }
    } else {
      zipDirs.push(job.dir);
    }
  }
  if (zipDirs.length) {
    await overlayFromZip(zipDirs, ref);
    vias.add("zip");
  }
  const sha =
    (gitOk() ? gitHead(PLUGIN_ROOT) : "") ||
    (await remoteHeadSha(ref).catch(() => ""));
  if (sha) writeStamp(sha);
  const via = vias.size > 1 ? "mixed" : [...vias][0] || detectVia();
  const pin = options.pin === false ? "" : options.pin || state.pin || "";
  const channel = normalizeChannel(options.channel || state.channel);
  const saved = writeChannelState({ channel, pin });
  const localVer = localVersion();
  pushHistory({
    ref,
    sha: sha || "",
    version: localVer,
    channel,
    label: versionLabel(localVer, channel, sha),
    at: new Date().toISOString(),
  });
  const listed = await listRemoteVersions().catch(() => ({
    versions: [],
    hasBeta: saved.channel === "beta",
  }));
  return rememberUpdate({
    ok: true,
    applied: true,
    hasUpdate: false,
    hasBeta: listed.hasBeta,
    pinned: Boolean(saved.pin),
    localVersion: localVer,
    remoteVersion: localVer,
    localSha: sha ? String(sha).slice(0, 7) : "",
    remoteSha: sha ? String(sha).slice(0, 7) : "",
    needRestart: false,
    reloadClient: true,
    via,
    versions: listed.versions,
    lanes: lanesOf(listed, saved, localVer, sha),
    ...channelPublic(saved),
  });
}

export async function switchChannel(channel, { apply = true } = {}) {
  const next = normalizeChannel(channel);
  if (next === "beta") {
    const listed = await listRemoteVersions();
    if (!listed.hasBeta) {
      const state = readChannelState();
      const localVer = localVersion();
      const localRev = (gitOk() ? gitHead(PLUGIN_ROOT) : "") || readStamp();
      return rememberUpdate({
        ok: false,
        error: "还没有测试版",
        hasBeta: false,
        localVersion: localVer,
        versions: listed.versions,
        lanes: lanesOf(listed, state, localVer, localRev),
        ...channelPublic(state),
      });
    }
    if (!listed.betaSha && apply) {
      const tag = listed.versions.find(
        (item) => item.channel === "beta" && item.kind === "tag",
      );
      if (tag)
        return applyUpdate(planUpdates(), {
          ref: tag.ref,
          channel: "beta",
          pin: false,
          force: true,
        });
    }
  }
  if (!apply) {
    writeChannelState({ channel: next, pin: "" });
    return checkUpdate();
  }
  return applyUpdate(planUpdates(), {
    ref: CHANNELS[next].ref,
    channel: next,
    pin: false,
    force: true,
  });
}

function listedUpdateRef(target, listed) {
  const safe = safeUpdateRef(target);
  if (!safe) return "";
  const hit = (listed?.versions || []).find(
    (item) =>
      item.ref === safe ||
      item.id === safe ||
      item.sha === safe ||
      (item.sha &&
        safe.length >= 7 &&
        (item.sha.startsWith(safe) || safe.startsWith(item.sha))),
  );
  return safeUpdateRef(hit?.ref || "");
}

export async function switchVersion(ref) {
  const raw = String(ref || "").trim();
  if (withdrawnVersion({ ref: raw, version: raw }))
    throw new Error("该版本已下线");
  const target = safeUpdateRef(raw);
  if (!target) throw new Error("请选择要回退的版本");
  const listed = await listRemoteVersions();
  const resolved = listedUpdateRef(target, listed);
  if (!resolved) throw new Error("未知版本");
  const hit = listed.versions.find((item) => item.ref === resolved);
  const channel = hit?.channel || readChannelState().channel;
  const pin = hit?.latest ? "" : resolved;
  return applyUpdate(planUpdates(), {
    ref: resolved,
    channel,
    pin,
    force: true,
  });
}

export async function handleUpdateOp(body = {}) {
  const op = String(body.op || (body.auto ? "auto" : "apply")).toLowerCase();
  if (op === "check" || op === "status" || op === "versions")
    return checkUpdate();
  if (op === "channel")
    return switchChannel(body.channel, { apply: body.apply !== false });
  if (op === "switch" || op === "rollback")
    return switchVersion(body.ref || body.version || body.id);
  if (op === "auto") return autoUpdateIfNeeded();
  const state = readChannelState();
  const requested = body.ref || currentChannelRef(state);
  const ref = safeUpdateRef(requested);
  if (!ref) throw new Error("未知版本");
  if (ref !== STABLE_REF && ref !== BETA_REF) {
    const listed = await listRemoteVersions();
    if (!listedUpdateRef(ref, listed)) throw new Error("未知版本");
  }
  const channel =
    body.channel ||
    (ref === BETA_REF ? "beta" : ref === STABLE_REF ? "stable" : state.channel);
  return applyUpdate(planUpdates(), { ref, channel, pin: false, force: true });
}

export async function autoUpdateIfNeeded() {
  try {
    const check = await checkUpdate();
    if (check.pinned)
      return rememberUpdate({ ...check, auto: true, skipped: "pinned" });
    if (!check.hasUpdate)
      return rememberUpdate({ ...check, auto: true, skipped: "latest" });
    if (
      check.updateTarget === BETA_REF &&
      readChannelState().channel !== "beta"
    ) {
      return rememberUpdate({ ...check, auto: true, skipped: "beta" });
    }
    const jobs = planUpdates();
    const dirtyGit = jobs.filter(
      (j) => j.kind === "git" && gitTrackedDirty(j.dir),
    );
    const runnable = jobs.filter(
      (j) => !(j.kind === "git" && gitTrackedDirty(j.dir)),
    );
    if (!runnable.length && dirtyGit.length) {
      return rememberUpdate({
        ...check,
        auto: true,
        skipped: "dirty",
        error: "本地插件文件有未提交改动，未自动覆盖",
      });
    }
    const applied = await applyUpdate(runnable, {
      ref: currentChannelRef(),
      channel: readChannelState().channel,
      pin: false,
      force: false,
    });
    return rememberUpdate({ ...applied, auto: true });
  } catch (e) {
    return rememberUpdate({
      ok: false,
      auto: true,
      hasUpdate: false,
      error: String(e && e.message ? e.message : e),
      ...channelPublic(),
    });
  }
}
