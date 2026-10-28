import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

function invoke(surface, expression, home) {
  const module = new URL("../lib/core.js", import.meta.url);
  const result = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `
    const { repairOfficialCliAfterUnpack } = await import(${JSON.stringify(module.href)});
    console.log(JSON.stringify(${expression}));
  `,
    ],
    {
      encoding: "utf8",
      env: { ...process.env, DSH_SURFACE: surface, DSH_HOME: home },
    },
  );
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout.trim());
}

test("Web 的公共维护入口跳过桌面修复并保持实际目录不变", () => {
  const home = mkdtempSync(join(tmpdir(), "purge-web-cli-"));
  try {
    writeFileSync(join(home, "sentinel"), "keep");
    for (const surface of ["web", "gui", "tui"]) {
      assert.deepEqual(
        invoke(surface, "repairOfficialCliAfterUnpack()", home),
        {
          ok: true,
          skipped: "not_desktop",
        },
      );
    }
    assert.deepEqual(readdirSync(home), ["sentinel"]);
    assert.equal(readFileSync(join(home, "sentinel"), "utf8"), "keep");
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test("显式桌面目标无效时保留真实失败，不被 Web 默认值掩盖", () => {
  const home = mkdtempSync(join(tmpdir(), "purge-desktop-cli-"));
  try {
    const missing = join(home, "missing");
    for (const surface of ["web", "desktop"]) {
      assert.deepEqual(
        invoke(
          surface,
          `repairOfficialCliAfterUnpack(${JSON.stringify(missing)})`,
          home,
        ),
        {
          ok: false,
          reason: "not_official",
        },
      );
    }
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});
