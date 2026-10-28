# 独立插件组件

`scripts/export-component.mjs` 从干净固定提交运行 `npm pack --ignore-scripts`，按 package files 选择发布文件，不加载插件、不修改宿主、不应用规则。输出原始 tgz、component.json 和 SHA256SUMS；manifest 包含完整 Git 提交、包版本、Node 和原包摘要。

组件快照沿用上游包版本，以独立 `purge-component-<version>-<commit>` 标签和 SHA-256 区分自有适配，不冒充上游相同版本的原包或 npm 新版本。上游版本说明保留；正式独立版本升级仍须遵守 AGENTS.md 的同步规则。当前适配目标为 DSH Web 0.2.2-alpha.2，不能将模块测试扩写为完整 Desktop 兼容验收。

工作流在 Node 24.22.1 下执行 Web/UI、生成物、文档和打包测试，先保存草稿预发布。子进程报告通过 NODE_OPTIONS 固定 TAP，不放宽断言。组件通过后，组合侧固定 manifest 和原包摘要再安装验证；三个自动维护开关关闭，规则应用单独验收。

打包脚本修改须执行 node --check、Prettier、oxlint 和 `node --test test/component-export.test.mjs`，并以真实标准 npm 包验证 files 清单及 prepare 不执行。测试使用独立临时目录，不复用用户实例。
