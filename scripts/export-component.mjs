/** 独立插件组件仅包含标准 npm 发布文件；不加载插件或应用宿主规则。 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
export function exportComponent({ source, out, repository, commit }) {
  source = resolve(source);
  out = resolve(out);
  assert.match(repository, /^[\w.-]+\/[\w.-]+$/);
  assert.match(commit, /^[a-f0-9]{40}$/);
  assert.ok(!existsSync(out), "组件输出必须不存在");
  const metadata = JSON.parse(readFileSync(join(source, "package.json")));
  assert.equal(metadata.name, "dsh-purge-community");
  const cache = mkdtempSync(join(tmpdir(), "purge-component-"));
  mkdirSync(out, { recursive: true });
  try {
    const rows = JSON.parse(
      execFileSync(
        "npm",
        ["pack", "--ignore-scripts", "--json", "--pack-destination", out],
        {
          cwd: source,
          encoding: "utf8",
          env: {
            PATH: process.env.PATH,
            npm_config_userconfig: "/dev/null",
            npm_config_cache: cache,
          },
        },
      ),
    );
    assert.equal(rows.length, 1);
    const entry = rows[0];
    assert.equal(basename(entry.filename), entry.filename);
    const sha256 = hash(readFileSync(join(out, entry.filename)));
    const file = entry.filename.replace(
      /\.tgz$/,
      `-${sha256.slice(0, 12)}.tgz`,
    );
    renameSync(join(out, entry.filename), join(out, file));
    const dependencies = Object.fromEntries(
      [
        "dependencies",
        "optionalDependencies",
        "peerDependencies",
        "peerDependenciesMeta",
      ]
        .filter((key) => metadata[key])
        .map((key) => [key, metadata[key]]),
    );
    const manifest = {
      schemaVersion: 1,
      kind: "dsh-component",
      component: "purge",
      repository,
      commit,
      version: metadata.version,
      hostMutationPolicy: "manual",
      platform: { os: "any", arch: "any", node: process.versions.node },
      packages: [
        {
          name: metadata.name,
          version: metadata.version,
          file,
          sha256,
          ...dependencies,
        },
      ],
      archive: { name: file, sha256 },
    };
    const bytes = JSON.stringify(manifest, null, 2) + "\n";
    writeFileSync(join(out, "component.json"), bytes, { flag: "wx" });
    writeFileSync(
      join(out, "SHA256SUMS"),
      `${sha256}  ${file}\n${hash(bytes)}  component.json\n`,
      { flag: "wx" },
    );
    return manifest;
  } catch (error) {
    rmSync(out, { recursive: true, force: true });
    throw error;
  } finally {
    rmSync(cache, { recursive: true, force: true });
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const { values } = parseArgs({
    options: { out: { type: "string" }, repository: { type: "string" } },
  });
  assert.ok(values.out && values.repository);
  const git = (args) => execFileSync("git", args, { encoding: "utf8" }).trim();
  assert.equal(
    git(["status", "--porcelain", "--untracked-files=no"]),
    "",
    "源码有未提交修改",
  );
  const manifest = exportComponent({
    source: process.cwd(),
    out: values.out,
    repository: values.repository,
    commit: git(["rev-parse", "HEAD"]),
  });
  console.log(
    JSON.stringify({ commit: manifest.commit, archive: manifest.archive }),
  );
}
