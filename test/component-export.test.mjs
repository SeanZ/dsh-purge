import assert from "node:assert/strict";
import test from "node:test";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { exportComponent } from "../scripts/export-component.mjs";

test("标准组件只包含 files 白名单且不执行 prepare", (t) => {
  const root = mkdtempSync(join(tmpdir(), "purge-export-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const source = join(root, "source");
  mkdirSync(source);
  writeFileSync(
    join(source, "package.json"),
    JSON.stringify({
      name: "dsh-purge-community",
      version: "1.0.0",
      files: ["index.js"],
      scripts: { prepare: "node -e 'process.exit(42)'" },
    }),
  );
  writeFileSync(join(source, "index.js"), "export default 1;\n");
  writeFileSync(join(source, "private.txt"), "excluded");
  const options = {
    source,
    out: join(root, "out"),
    repository: "example/purge",
    commit: "b".repeat(40),
  };
  const manifest = exportComponent(options);
  const archive = join(options.out, manifest.archive.name);
  const files = execFileSync("tar", ["-tf", archive], { encoding: "utf8" });
  assert.match(files, /package\/index.js/);
  assert.ok(!files.includes("private.txt"));
  assert.equal(
    createHash("sha256").update(readFileSync(archive)).digest("hex"),
    manifest.archive.sha256,
  );
  assert.equal(manifest.commit, options.commit);
  assert.throws(() => exportComponent(options), /必须不存在/);
});
