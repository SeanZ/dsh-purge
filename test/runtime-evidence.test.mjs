// 运行时证据是 #40 判定"已由新版接管"的前提：宿主换了机制但运行时没挂上时，
// 仍然必须报缺失。这里锁住两条边界：
//   1. 写进程退出后记录立即失效，不能拿上一次启动冒充当前就绪；
//   2. DSH_HOME / 宿主归属必须一致，不跨 home 或跨安装复用。
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import {
  readRuntimeEvidence,
  recordRuntimeEvidence,
} from "../lib/runtime-evidence.js";

const MODULE = pathToFileURL(
  path.join(import.meta.dirname, "..", "lib", "runtime-evidence.js"),
).href;
const KEY = "completeComposition";

function tempHome() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "purge-evidence-"));
}

function child(source) {
  return spawn(process.execPath, ["--input-type=module", "-e", source], {
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function exited(proc) {
  return new Promise((resolve, reject) => {
    proc.once("error", reject);
    proc.once("exit", (code) => resolve(code));
  });
}

function childWrites(home, mounted, tail = "") {
  return `
    import { recordRuntimeEvidence } from ${JSON.stringify(MODULE)};
    recordRuntimeEvidence(${JSON.stringify(home)}, ${JSON.stringify(KEY)}, ${mounted === true});
    ${tail}
  `;
}

async function waitFor(predicate, timeoutMs = 4000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (predicate()) return true;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  return false;
}

test("a record written by an exited process is not trusted", async () => {
  const home = tempHome();
  try {
    const code = await exited(child(childWrites(home, true)));
    assert.equal(code, 0);
    // 写进程已退出：这正是"重启后插件禁用 / 加载失败"的形状，不能报就绪。
    assert.equal(readRuntimeEvidence(home, KEY), false);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test("a record from a live external process is trusted until that process exits", async () => {
  const home = tempHome();
  const proc = child(childWrites(home, true, "setInterval(() => {}, 1000);"));
  try {
    assert.equal(
      await waitFor(() => readRuntimeEvidence(home, KEY) === true),
      true,
      "live writer should be trusted",
    );
    proc.kill("SIGTERM");
    await exited(proc);
    assert.equal(
      readRuntimeEvidence(home, KEY),
      false,
      "evidence dies with its writer",
    );
  } finally {
    try {
      proc.kill("SIGKILL");
    } catch {
      /* already gone */
    }
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test("evidence is isolated per DSH_HOME", () => {
  const homeA = tempHome();
  const homeB = tempHome();
  try {
    recordRuntimeEvidence(homeA, KEY, true);
    assert.equal(readRuntimeEvidence(homeA, KEY), true);
    // 另一个 home 从未挂载，不能因为同进程写过就报就绪。
    assert.equal(readRuntimeEvidence(homeB, KEY), false);
  } finally {
    fs.rmSync(homeA, { recursive: true, force: true });
    fs.rmSync(homeB, { recursive: true, force: true });
  }
});

test("evidence is isolated per host install", () => {
  const home = tempHome();
  try {
    recordRuntimeEvidence(home, KEY, true, "/hosts/a");
    assert.equal(readRuntimeEvidence(home, KEY, "/hosts/a"), true);
    assert.equal(readRuntimeEvidence(home, KEY, "/hosts/b"), false);
    // 不知道宿主归属时保持宽松（同 home 里确实有存活挂载记录）。
    assert.equal(readRuntimeEvidence(home, KEY, ""), true);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test("the same process can withdraw its own evidence", () => {
  const home = tempHome();
  try {
    recordRuntimeEvidence(home, KEY, true);
    assert.equal(readRuntimeEvidence(home, KEY), true);
    recordRuntimeEvidence(home, KEY, false);
    assert.equal(readRuntimeEvidence(home, KEY), false);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test("a live process that reports no mount keeps the verdict unconfirmed", async () => {
  const home = tempHome();
  // 一个没挂上组合的存活进程（例如插件加载失败但宿主还在跑）。
  const proc = child(childWrites(home, false, "setInterval(() => {}, 1000);"));
  try {
    assert.equal(
      await waitFor(() =>
        fs.existsSync(path.join(home, "dsh-purge", "runtime-evidence.json")),
      ),
      true,
    );
    recordRuntimeEvidence(home, KEY, true);
    assert.equal(
      readRuntimeEvidence(home, KEY),
      false,
      "a live 'not mounted' record wins over a mounted one",
    );
  } finally {
    try {
      proc.kill("SIGKILL");
    } catch {
      /* already gone */
    }
    await exited(proc).catch(() => {});
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test("a missing or foreign evidence file stays unconfirmed", () => {
  const home = tempHome();
  try {
    assert.equal(readRuntimeEvidence(home, KEY), false);
    fs.mkdirSync(path.join(home, "dsh-purge"), { recursive: true });
    fs.writeFileSync(
      path.join(home, "dsh-purge", "runtime-evidence.json"),
      JSON.stringify({ completeComposition: { mounted: true } }),
    );
    // 旧格式没有 pid/版本，不能据此报就绪。
    assert.equal(readRuntimeEvidence(home, KEY), false);
    fs.writeFileSync(
      path.join(home, "dsh-purge", "runtime-evidence.json"),
      "{not json",
    );
    assert.equal(readRuntimeEvidence(home, KEY), false);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});
