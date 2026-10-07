# DSH 0.1.5-rc.2 PE 兼容契约

## 版本与来源

基线为 purge 1.1.15 的 5d6cf35，兼容版本为 1.1.15-seanz.1。比较范围至 af13e8c（1.1.60）。唯一安装、更新与问题入口为 SeanZ/dsh-purge；运行时更新只接受 v1.1.15-seanz.1 标签。遗留 master、beta、裸 SHA、其它发行版本都拒绝，Git 更新显式从 fork 获取标签，不信任安装目录原有 origin。兼容升级由部署仓库固定新提交、摘要和发行版本；不能自动追随 master。

## 行为取舍

| 来源                      | 行为                                   | 决定与边界                                                                                                                                                   |
| ------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 82a3cf0                   | #1/#2/#3 skipIfMarked                  | 不适用：1.1.15 旧锚点自身已收敛，不存在新版 +841 字符回归；保留旧替换与正文并增加幂等验证                                                                    |
| 2926837、3ca5b1e          | leadWithInject 与去重                  | 每次重新组装，把当前精确注入全文只保留一份并置前；保留非重复文本、元数据、工具和上下文；不使用旧历史 system 全文覆盖新轮                                     |
| af13e8c 中 identity.js    | unwrapInjectShell                      | 只剥成对的最外层 ChatML/project_instructions 包装；不删内部标记、不改变业务正文                                                                              |
| 6f37daa、354f9a1、131ef12 | 重启后注入和当前提示词                 | 保留 1.1.15 的每次读当前文件/当前规则集机制，覆盖重启重注册、热改提示词和空文本；不引入全局缓存、强制重新落默认文本                                          |
| 354f9a1 #40               | complete 保留当前注入                  | 基线 #40 已从 waterfall 之后取 transformed sections；保持并增加行为测试，不照搬晚于基线的修复文本                                                            |
| 354f9a1 #72               | Messages 当前 system                   | 不适用：rc.2 原生 DeepSeek 是 Chat Completions，直接序列化 options.system 与 system 消息，没有新版 historySystem/systemUpdates 分支；最终请求由部署 E2E 覆盖 |
| 3c7c234 等                | 所有子代理同人设                       | 不迁移；后台 MVU、姿势、候选、手机与图片有各自输出契约                                                                                                       |
| 其它混合提交              | 红队、地区网络限制、桌面升级、0.2 接口 | 不迁移                                                                                                                                                       |

默认提示词密文槽与正文逐字保留基线；新默认文案不视作 PE 优化。自动写入和手动宿主修改分别由配置限制。

## 配置接口

```yaml
enabled: true
autoApplyOnStart: false
autoUpdateOnStart: false
allowHostMutation: false
stripMnemon: false
promptScope: root
rewindEnabled: false
```

上述为兼容分支默认值与 bundle 配置。`enabled:true` 保持 PE 生效；部署阶段需显式准备 `$DSH_HOME/prompt-inject.md` 或启用规则集。未准备且无规则时为空，不在只读启动中写默认文件。

`autoApplyOnStart:false` 关闭同步默认写入、启动清理宿主、控制台补丁及 setImmediate 延迟 apply/规则初始化。`autoUpdateOnStart:false` 不触发更新查询或下载。`allowHostMutation:false` 优先于上述两个开关，同时拒绝 Web apply/revert/uninstall/restart/update（HTTP 403/PURGE_HOST_MUTATION_DISABLED）、/purge 相应子命令与 purge_apply/purge_revert 工具。规则/提示词编辑属于用户配置，仍允许；独立 CLI 是显式运维入口，不受 profile 配置限制，封包前可使用。

`rewindEnabled:false` 对 Web rewind 与 rewind/options 返回 403/PURGE_REWIND_DISABLED，/rewind 返回错误，客户端不注册 purge 回退按钮。Tavern 原生回退独立运行。`stripMnemon:false` 不注册消息过滤，且不删除任何 Mnemon sections。

`promptScope` 仅接受 `all` 或 `root`。root 需要真实 context.agent.session（或 context.session）与 header；排除 header.origin 为 subagent、subagent/descriptor、complete section、tavern:card-system/card-reference/resource-workspace；仅有 parentSession 的原生前台分叉继续注入。范围外只撤回 dsh-purge sections，不改其它 sections、tools、contexts。前台故事仍执行去重与置前；改卡原始 Tavern sections 和工具原样保留。Tavern 2.5.0 改卡上下文没有公开通用 mode 字段，不能只凭 parentSession 声称准确区分所有前台职责；需最终请求验收，若要完全禁止改卡注入应由 Tavern 暴露稳定范围接口。

PE 仅对 purge 主注入段和已知宿主人设 section 去重，并只在宿主人设中清理 stock 身份句。Tavern、Mnemon 和其它第三方 section 即使含有与当前注入完全相同的文案，也属于独立业务正文，保留前后空白与原始字节。验收按 dsh-purge 主 section 数量判断是否重复，不把业务正文中的同文案计作重复注入。`postPrompt` 仍作为独立 section，使用相同范围，postPromptOrder 必须大于 GLOBAL_PROMPT_ORDER（-10000）。

## 验证边界

`npm test` 覆盖旧回归、重复补丁、成对去壳、重复组装、Mnemon 保留、Tavern 真实字段形状、complete 返回、临时文件重载、关闭启动写入与服务端拒绝入口。测试使用中性合成提示词，无私人角色卡或凭据。它们不证明真实模型、浏览器、Tavern 持久化/回退/MVU 端到端，也不代表 Linux 已验证；这些由部署仓库的固定制品验收负责。

## 模块与客户端构建

`lib/index.js` 管理生命周期与 PE；`commands.js` 管理命令和共享状态呈现；`http.js` 管理已鉴权的路由与拒绝入口。更新器的版本比较、列表、固定来源与网络读取分别在 update-version/update-list/update-source/update-network 中，唯一写入实现仍在 update.js。

客户端维护源在 `client-src/`，按公共请求、语言字典、样式、设置面板与回退职责拆分，每个维护源小于 1000 行。`npm run build:client` 使用固定 esbuild 0.25.12，生成带来源注释的 `client.js`；宿主仍只通过原 ModuleLoader factory 加载一个文件，React 由宿主 require 提供。生成文件可超过 1000 行，不直接编辑。部署不需要构建工具或额外浏览器模块加载。

`npm run test:client` 执行最终 IIFE，核实设置注册与回退按钮开关。`DSH_TEST_SYSTEM_PROMPT_MODULE=/path/to/rc.2/system-prompt/lib/index.js npm run test:host` 加载实际 Cordis 和 SystemPrompt，在内存应用生产 #40 后走真实 waterfall，覆盖前台、原生分叉、后台 complete、已绑卡和未绑卡设计。该测试不会改写宿主文件。
