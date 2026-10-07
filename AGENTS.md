# 兼容分支约束

本分支只支持 DSH 0.1.5-rc.2 与固定 Tavern 2.5.0。开始工作先读 `.agentdocs/index.md`。中文沟通、文档与注释。不得将新版宿主接口或红队功能整包移入。

JavaScript 修改执行 `node --check`；维护源、测试、配置和代理文档执行 `pnpm dlx prettier@3.6.2 --check`，格式由 `.prettierrc.json` 定义。生成的 client.js 由固定 esbuild 生成，不跑 Prettier，但必须语法检查并验证最终包。执行 `npm test`；宿主接口变更另执行真实 rc.2 的 `npm run test:host`（设置 DSH_TEST_SYSTEM_PROMPT_MODULE）。不新增测试框架。涉及配置须以目标宿主加载器验证，完整 Tavern 端到端与发行打包由部署仓库验收。

客户端修改先改 `client-src/`，再运行 `npm run build:client` 并提交生成文件。维护源每个文件不超过 1000 行；client.js 为唯一生成产物，不适用维护源行数限制。

新增功能同时覆盖 node:test 单元测试和真实临时文件、HTTP 路由或宿主接口形状的集成路径。启动测试必须确认关闭自修改时整个临时 home 的文件字节不变；不能以关闭 PE 代替提示词验证。宿主补丁须重复执行验证幂等，不改默认提示词正文。
