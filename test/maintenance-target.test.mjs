import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  resolveMaintenanceTarget,
  assertInstanceFiles,
  assertDistinctMaintenanceInstances,
} from "../lib/maintenance-target.js";

const core = new URL("../lib/core.js", import.meta.url).href;
function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}
function fixture(t) {
  const root = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), "purge-two-web-")),
  );
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const create = (name) => {
    const install = path.join(root, name),
      ai = path.join(install, "node_modules/@deepseek-ai"),
      home = path.join(root, `${name}-home`);
    const bin = path.join(ai, "dsh/lib/bin.js"),
      file = path.join(ai, "dsh-agent-instructions/lib/index.js");
    write(
      path.join(ai, "dsh/package.json"),
      JSON.stringify({
        name: "@deepseek-ai/dsh",
        bin: { dsh: "lib/bin.js" },
        type: "module",
      }),
    );
    write(
      path.join(ai, "dsh-agent-instructions/package.json"),
      JSON.stringify({ name: "@deepseek-ai/dsh-agent-instructions" }),
    );
    write(file, "export const fixture = 'before';\n");
    write(path.join(home, "profiles/web/package.json"), "{}");
    write(bin, "");
    return { install, ai, home, bin, file };
  };
  return { a: create("a"), b: create("b"), root };
}
function snapshot(root) {
  const result = {};
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir).sort()) {
      const file = path.join(dir, name),
        st = fs.lstatSync(file),
        key = path.relative(root, file);
      if (st.isDirectory()) {
        result[key] = "dir";
        walk(file);
      } else
        result[key] = st.isSymbolicLink()
          ? fs.readlinkSync(file)
          : {
              hash: createHash("sha256")
                .update(fs.readFileSync(file))
                .digest("hex"),
              mtime: st.mtimeMs,
            };
    }
  };
  walk(root);
  return result;
}
function run(a, code, env = {}) {
  write(a.bin, `import * as core from ${JSON.stringify(core)};\n${code}`);
  return spawnSync(process.execPath, [a.bin, "web"], {
    encoding: "utf8",
    env: {
      ...process.env,
      DSH_SURFACE: "web",
      DSH_HOME: a.home,
      DSH_BASE: a.ai,
      PURGE_DSH_CLI: a.bin,
      DSH_PROFILE: "web",
      PURGE_PROFILE_DIR: "",
      ...env,
    },
  });
}
test("两个真实目录中，备份、合成普通文本修改与恢复只作用当前 Web 实例", async (t) => {
  const { a, b } = fixture(t),
    before = snapshot(b.install),
    homeBefore = snapshot(b.home);
  const result = run(
    a,
    `
    import assert from 'node:assert/strict';
    import fs from 'node:fs';
    assert.deepEqual(core.enumeratePatchAiBases({discover:true}), [process.env.DSH_BASE]);
    assert.deepEqual(core.listShimDirsForPatch(), []);
    assert.deepEqual(core.sanitizeDesktopCommandRuntimes(), []);
    const backups = await core.backupAll(process.env.DSH_BASE);
    assert.equal(backups.errors.length, 0);
    const rows = await core.applyPatchesAllHosts([{id:9999,name:'普通文本夹具',file:'agent-instructions',replacements:[{pattern:"'before'",replace:"'after'"}],markers:["'after'"]}]);
    assert.equal(rows.hosts.length, 1);
    assert.equal(rows.hosts[0].aiBase, process.env.DSH_BASE);
    assert.equal(rows.report[0].status, 'applied');
    assert.match(fs.readFileSync(${JSON.stringify(a.file)},'utf8'), /after/);
    const reverted = await core.revertAllHosts();
    assert.equal(reverted.errors.length, 0);
    assert.match(fs.readFileSync(${JSON.stringify(a.file)},'utf8'), /before/);
  `,
    { PATH: `${path.dirname(b.bin)}:${process.env.PATH}` },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(snapshot(b.install), before);
  assert.deepEqual(snapshot(b.home), homeBefore);
});
for (const kind of [
  "env-conflict",
  "cli-conflict",
  "symlink",
  "backup-link",
  "hardlink",
  "state-link",
  "profile-conflict",
]) {
  test(`拒绝 ${kind}，另一实例保持逐文件内容及时间戳不变`, (t) => {
    const { a, b } = fixture(t);
    let env = {};
    if (kind === "env-conflict") env.DSH_BASE = b.ai;
    if (kind === "cli-conflict") env.PURGE_DSH_CLI = b.bin;
    if (kind === "profile-conflict") {
      const other = path.join(a.home, "profiles/tavern");
      write(path.join(other, "package.json"), "{}");
      env.PURGE_PROFILE_DIR = other;
      env.DSH_PROFILE = "";
    }
    if (kind === "symlink" || kind === "hardlink") {
      fs.unlinkSync(a.file);
      if (kind === "symlink") fs.symlinkSync(b.file, a.file);
      else fs.linkSync(b.file, a.file);
    }
    if (kind === "backup-link")
      fs.symlinkSync(b.file, a.file + ".dshpurge.bak");
    if (kind === "state-link")
      fs.symlinkSync(b.home, path.join(a.home, "dsh-purge-community"));
    const before = snapshot(b.install),
      homeBefore = snapshot(b.home),
      ownHome = snapshot(a.home);
    const result = run(
      a,
      `try { await core.backupAll(process.env.DSH_BASE); process.exitCode=9; } catch(error) { if (!/冲突|越出|硬链接/.test(error.message)) throw error; }`,
      env,
    );
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(snapshot(b.install), before);
    assert.deepEqual(snapshot(b.home), homeBefore);
    assert.deepEqual(snapshot(a.home), ownHome);
  });
}
test("未指定目标时不扫描其他安装；符号别名等价但共享 runtime 被部署审查拒绝", (t) => {
  const { a, root } = fixture(t);
  assert.throws(
    () => resolveMaintenanceTarget({ env: {}, argv: [] }),
    /无法确定/,
  );
  const alias = path.join(root, "alias");
  fs.symlinkSync(a.install, alias);
  const target = resolveMaintenanceTarget({
    env: { DSH_BASE: path.join(alias, "node_modules/@deepseek-ai") },
    argv: ["node", a.bin],
  });
  assert.equal(target.aiBase, a.ai);
  assert.throws(
    () => assertDistinctMaintenanceInstances([target, target]),
    /共享/,
  );
  assert.throws(
    () =>
      assertInstanceFiles(a.ai, [path.join(root, "outside/new")], {
        env: {},
        argv: [],
      }),
    /越出/,
  );
});

test("真实 Cordis HTTP 处理器在请求体写入和重启之前拒绝冲突目标", (t) => {
  const { a, b } = fixture(t);
  const cordis = import.meta.resolve("@deepseek-ai/cordis");
  const plugin = new URL("../lib/index.js", import.meta.url).href;
  const before = snapshot(b.install),
    homes = [snapshot(a.home), snapshot(b.home)];
  const result = run(
    a,
    `
    import assert from 'node:assert/strict';
    const {Context, Service} = await import(${JSON.stringify(cordis)});
    const {installWebServer} = await import(${JSON.stringify(plugin)});
    class Web extends Service {
      constructor(ctx) { super(ctx,'webServer'); this.routes=new Map(); }
      register(spec) { this.routes.set(spec.path,spec); return () => this.routes.delete(spec.path); }
    }
    const ctx=new Context();
    try {
      await ctx.plugin(Web);
      await ctx.plugin({name:'test-isolation-http',apply:host=>installWebServer(host,{})});
      await new Promise(resolve=>setImmediate(resolve));
      for(const route of ['apply','revert','restart']) {
        const response={writeHead(code){this.code=code;},end(body){this.body=body;}};
        await ctx.webServer.routes.get('/dsh-purge/'+route).handler({method:'POST',headers:{}},response);
        assert.equal(response.code,409);
        assert.equal(JSON.parse(response.body).ok,false);
        assert.match(JSON.parse(response.body).error,/实例目标冲突/);
      }
    } finally { await ctx.fiber.dispose(); }
  `,
    { DSH_BASE: b.ai },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(snapshot(b.install), before);
  assert.deepEqual([snapshot(a.home), snapshot(b.home)], homes);
});
