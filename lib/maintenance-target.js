import fs from "node:fs";
import path from "node:path";
import {
  currentHost,
  normalizeHostBase,
  desktopResourcesForHost,
  resolveProfile,
} from "./instance.js";

function inside(file, root) {
  const relative = path.relative(root, file);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  );
}

/** 未创建的文件也按最近存在的父目录解析，不能经目录链接写到另一实例。 */
function physical(file) {
  const suffix = [];
  let parent = path.resolve(file);
  for (;;) {
    try {
      return path.join(fs.realpathSync(parent), ...suffix.reverse());
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      if (fs.lstatSync(parent, { throwIfNoEntry: false })?.isSymbolicLink()) {
        throw Error(`维护路径包含失效链接：${parent}`);
      }
      const next = path.dirname(parent);
      if (next === parent) throw error;
      suffix.push(path.basename(parent));
      parent = next;
    }
  }
}

/** 所有显式来源须与当前启动入口一致；从不扫描 PATH 或其他安装。 */
export function resolveMaintenanceTarget(options = {}) {
  const env = options.env ?? process.env;
  const argv = options.argv ?? process.argv;
  const candidates = [];
  const add = (value, source) => {
    if (!value) return;
    if (!path.isAbsolute(value)) throw Error(`${source} 必须为绝对路径`);
    const normalized = normalizeHostBase(value);
    const real = fs.realpathSync(normalized);
    if (!fs.statSync(real).isDirectory()) throw Error(`${source} 不是宿主目录`);
    candidates.push({ source, path: real });
  };
  add(currentHost({ env: {}, argv }), "当前启动入口");
  add(env.DSH_BASE, "DSH_BASE");
  if (env.PURGE_DSH_CLI) {
    const selected = currentHost({
      env: { PURGE_DSH_CLI: env.PURGE_DSH_CLI },
      argv: [],
    });
    if (!selected) throw Error("PURGE_DSH_CLI 不是可核实的 DSH 入口");
    add(selected, "PURGE_DSH_CLI");
  }
  add(options.aiBase, "维护目标");
  if (!candidates.length)
    throw Error("无法确定当前实例的维护目标；不会查找其他安装");
  const aiBase = candidates[0].path;
  if (candidates.some((item) => item.path !== aiBase)) {
    throw Error(
      `实例目标冲突，未执行写入：${candidates.map((item) => `${item.source}=${item.path}`).join("；")}`,
    );
  }
  const resources = desktopResourcesForHost(aiBase);
  const installation =
    resources ||
    (path.basename(aiBase) === "@deepseek-ai" &&
    path.basename(path.dirname(aiBase)) === "node_modules"
      ? path.resolve(aiBase, "../..")
      : aiBase);
  if (env.DSH_HOME && !path.isAbsolute(env.DSH_HOME))
    throw Error("DSH_HOME 必须为绝对路径");
  const homes = env.DSH_HOME
    ? [path.resolve(env.DSH_HOME), physical(env.DSH_HOME)]
    : [];
  let profile = null;
  if (homes.length && fs.existsSync(path.join(homes[0], "profiles"))) {
    profile = resolveProfile(homes[0], { env, argv });
    if (!inside(profile.directory, physical(homes[0])))
      throw Error("当前 profile 位于其他实例的数据目录");
    if (currentHost({ env: {}, argv })) {
      const runningProfile = resolveProfile(homes[0], { env: {}, argv });
      if (runningProfile.directory !== profile.directory)
        throw Error("维护 profile 与当前启动 profile 冲突");
    }
    if (env.DSH_PROFILE && env.DSH_PROFILE !== profile.name)
      throw Error("DSH_PROFILE 与当前启动 profile 冲突");
  }
  return {
    aiBase,
    installation,
    resources,
    homes,
    profile,
    scope: "current-web-instance",
    sources: candidates,
  };
}

/** 文件、备份与父目录必须同属本实例；共享硬链接需要先拆成独立文件。 */
export function assertInstanceFiles(aiBase, files, options = {}) {
  const target = resolveMaintenanceTarget({ ...options, aiBase });
  const roots = [...new Set([target.installation, ...target.homes])];
  const physicalRoots = roots.map(physical);
  for (const file of files.filter(Boolean)) {
    const logical = path.resolve(file);
    const resolved = physical(logical);
    if (
      !physicalRoots.some((root) => inside(resolved, root)) ||
      !physicalRoots.some(
        (root) =>
          inside(physical(path.dirname(logical)), root) || resolved === root,
      )
    ) {
      throw Error(`维护路径越出当前实例：${file}`);
    }
    const stat = fs.statSync(logical, { throwIfNoEntry: false });
    if (stat?.isFile() && stat.nlink > 1)
      throw Error(`维护文件存在共享硬链接，未执行写入：${file}`);
  }
  return target;
}

/** 共用只读制品不等于允许共用手动应用会修改的 runtime/home。 */
export function assertDistinctMaintenanceInstances(targets) {
  const roots = targets.flatMap((target, index) =>
    [target.installation, ...target.homes].map((root) => ({
      index,
      root: physical(root),
    })),
  );
  for (const left of roots)
    for (const right of roots) {
      if (left.index >= right.index) continue;
      if (inside(left.root, right.root) || inside(right.root, left.root)) {
        throw Error(`两个实例共享或嵌套可写目录：${left.root}；${right.root}`);
      }
    }
}

/** 维护状态树内的链接也须留在本实例，避免快照或回滚经链接越界。 */
export function assertMaintenanceTree(aiBase, root, options = {}) {
  const visited = new Set();
  const visit = (file) => {
    assertInstanceFiles(aiBase, [file], options);
    const stat = fs.statSync(file, { throwIfNoEntry: false });
    if (!stat?.isDirectory()) return;
    const real = fs.realpathSync(file);
    if (visited.has(real)) return;
    visited.add(real);
    for (const name of fs.readdirSync(file)) visit(path.join(file, name));
  };
  visit(root);
}
