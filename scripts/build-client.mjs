import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// 复用 esbuild 生成宿主 ModuleLoader 接口；浏览器只加载原有 client.js。
execFileSync(
  "pnpm",
  [
    "dlx",
    "esbuild@0.25.12",
    "client-src/app.js",
    "--bundle",
    "--format=cjs",
    "--platform=browser",
    "--external:react",
    "--outfile=client.js",
    '--banner:js=// 生成文件：请修改 client-src 并运行 npm run build:client。\nwindow.__ModuleLoader__.load({ id: "dsh-purge", factory: (require) => { var module = { exports: {} }; var exports = module.exports;',
    "--footer:js=return module.exports; }});",
  ],
  { cwd: fileURLToPath(new URL("..", import.meta.url)), stdio: "inherit" },
);
