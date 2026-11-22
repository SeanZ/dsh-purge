// 运行时证据：记录本插件运行时"真的挂上了什么"，供同进程诊断与 CLI 诊断共用。
// 插件补丁改了宿主文件，不等于运行时组合真的接上了；像 #40 这种"旧规则被原生机制
// 取代、由运行时补回行为"的条目，必须拿到运行时挂载证据才能算完成。
//
// 证据按"写进程 pid"逐条记录：
// - 写进程退出后记录立即失效（pid 存活校验），不会把上一次启动的挂载冒充成当前就绪；
// - 读取时同时校验 DSH_HOME 与宿主归属，不跨 home/跨安装复用；
// - 有任何一条仍然存活的记录说"没挂上"，就按未确认处理（宁可不报已接管）。
// 只写 $DSH_HOME/dsh-purge/runtime-evidence.json；读写失败一律当"未确认"。
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const EVIDENCE_FILE = "runtime-evidence.json";
/** 文件格式版本：读不到同版本就整份当"未确认"，不猜旧内容。 */
const EVIDENCE_VERSION = 2;
/** 同 key 最多保留多少个写进程的记录（正常情况下只有 1–2 个进程在跑）。 */
const MAX_RECORDS = 8;

function homeOf(home) {
  const value = String(home || process.env.DSH_HOME || "").trim();
  if (value) return path.normalize(value);
  return path.join(os.homedir(), ".dsh");
}

function fileOf(home) {
  return path.join(homeOf(home), "dsh-purge", EVIDENCE_FILE);
}

/** 空 host 表示"不知道"，此时不做归属校验；两侧都知道就必须一致。 */
function sameHost(a, b) {
  const norm = (value) => {
    let text = String(value || "").trim();
    if (!text) return "";
    try {
      text = fs.realpathSync.native(text);
    } catch {
      /* 路径不存在时按原样比 */
    }
    return text.replace(/\\/g, "/").toLowerCase();
  };
  const left = norm(a);
  const right = norm(b);
  return !left || !right || left === right;
}

/** 写这条记录的进程是否还活着；进程退出即视为证据过期。 */
function writerAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  if (pid === process.pid) return true;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    // EPERM：进程存在但当前用户无权发信号，按存活处理。
    return error?.code === "EPERM";
  }
}

function readData(file) {
  try {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!data || typeof data !== "object" || data.version !== EVIDENCE_VERSION)
      return null;
    if (!data.keys || typeof data.keys !== "object") return null;
    return data;
  } catch {
    return null;
  }
}

function writeData(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data));
  fs.renameSync(tmp, file);
}

/**
 * 记录一条运行时证据。`mounted=false` 用于插件释放或启动前置位，
 * 避免上一次启动留下的"已挂载"被当成本次结果。
 *
 * @param home - DSH_HOME；空值按环境变量/默认目录解析。
 * @param key - 证据名，例如 `completeComposition`。
 * @param mounted - 本进程是否真的挂上。
 * @param host - 宿主插件根（可选，用于跨安装归属校验）。
 * @returns 文件是否写入成功；读取只认落盘记录，写失败即"未确认"。
 */
export function recordRuntimeEvidence(home, key, mounted, host = "") {
  if (!key) return false;
  const file = fileOf(home);
  try {
    const data = readData(file) || { version: EVIDENCE_VERSION, keys: {} };
    const list = Array.isArray(data.keys[key]) ? data.keys[key] : [];
    // 只保留仍然存活的写进程：进程退出后记录立即失效，不冒充下一次启动。
    const kept = list.filter(
      (row) => row && row.pid !== process.pid && writerAlive(row.pid),
    );
    kept.push({
      pid: process.pid,
      mounted: mounted === true,
      host: String(host || ""),
      at: new Date().toISOString(),
    });
    data.keys[key] = kept.slice(-MAX_RECORDS);
    writeData(file, data);
    return true;
  } catch {
    return false;
  }
}

/**
 * 读一条运行时证据。只认仍然存活的写进程，并校验 DSH_HOME 与宿主归属；
 * 没有任何一条能确认、或存活进程里有"没挂上"的记录时，返回未确认。
 *
 * @param home - DSH_HOME；空值按环境变量/默认目录解析。
 * @param key - 证据名。
 * @param host - 当前宿主插件根；两侧都知道时必须一致。
 * @returns 是否确认已挂载。
 */
export function readRuntimeEvidence(home, key, host = "") {
  if (!key) return false;
  const data = readData(fileOf(home));
  const list = data && Array.isArray(data.keys[key]) ? data.keys[key] : [];
  const live = list.filter(
    (row) => row && writerAlive(row.pid) && sameHost(row.host, host),
  );
  if (live.length === 0) return false;
  // 保守规则：只要有存活进程说没挂上，就不报"已接管"。
  return live.every((row) => row.mounted === true);
}
