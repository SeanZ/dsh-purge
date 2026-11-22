# 兼容矩阵与宿主版本边界

> 这份文件回答一个问题：**在当前这台宿主上，这个插件能做什么、不能做什么、哪些结论还没证据。**
> 日常操作回 [AGENTS.md](../AGENTS.md)；排障回 [troubleshooting.md](troubleshooting.md)；原始适配记录在 [maintenance-archive.md](maintenance-archive.md)。

<a id="c-matrix"></a>

## 1. 兼容矩阵（以 `package.json` 的 `dsh.compatibility` 为准）

| 项 | 值 |
| --- | --- |
| 插件版本 | `dsh-purge-community` 1.7.20 |
| 声明范围 | `dsh.compatibility.dsh = ">=0.2.1-rc.1 <0.3.0"` |
| profile | `desktop`、`web` |
| 逐发行状态字段 | `dsh.compatibility.dshReleases` |

| 宿主发行 | 状态 | 依据 / 备注 |
| --- | --- | --- |
| 0.2.2-rc.3 | `compatible` | 官方 rc.3 隔离副本 86 条补丁 74 applied / 零漂移，二次应用幂等；真实 Host Loader 预设注册通过。**Windows rc.3 未复测补丁。** |
| 0.2.2-rc.2 | `compatible` | 同上批次验证 |
| 0.2.2-rc.1 | `compatible` | 仍未完整适配：六项旧补丁 #14/#17/#60/#62/#67/#74 保持原定义未修（见 [§2](#c-boundary)） |
| 0.2.2-alpha.2 | `unknown` | manifest 未声明，不得写成 compatible |
| 0.2.1-rc.5 | `compatible` | 作者声明，依据与局限见 [DSH Store 说明](DSH-STORE.md) |
| 0.2.1-rc.3 / rc.2 / rc.1 | `compatible` | 同批次验证 |
| 0.2.1-rc.4 | `unknown` | manifest 未声明 |
| 其它 0.2.x | 允许应用，但 `selfcheck` 标"未验证" | 先看 `diagnose`，别把"能写盘"当"已适配" |
| 0.3.0 及以上 / <0.2.1-rc.1 | 不在声明范围 | 不要用 README 的范围或相邻版本推断补一条 |

**读取规则**：DSH Store 与市场索引只读根 manifest 的 `dsh.compatibility`，不把 README 的范围、相邻版本或"别人说能用"写成精确 `compatible`。市场索引逐发行读取 `manifest.dsh.compatibility.dsh`，历史未声明版本保留原有限定；刷新索引即可读新范围，不需要卸载插件、改用户兼容豁免或重启应用。

<a id="c-boundary"></a>

## 2. 版本边界：0.1.5 / 0.2.0 / 0.2.1 / 0.2.2-rc.x

- **0.1.5、0.2.0**：低于声明下限 `0.2.1-rc.1`，本仓库没有这两个宿主的适配记录，按**未验证（unknown）**处理。不要凭"更老的宿主应该更简单"推断可用。
- **0.2.1 系列**：`tool-subagent` 不再接受 `toolFilter`——旧 deny 清单要先转成原生子预设与父工具 `agentPreset` 引用（机制与停止条件见 [troubleshooting §13](troubleshooting.md#t-preset)）。rc.4 未声明；rc.1 / rc.2 / rc.3 / rc.5 已声明 `compatible`。
- **0.2.2-rc.1**：仍未完整适配。六项旧补丁 #14/#17/#60/#62/#67/#74 保持原定义、尚未修复；原生消息回合契约测试通过，但回调缺少 messages 的异常仍应暴露，不可吞掉错误或丢弃输入。测试范围与未确认事项见 [诊断记录](maintenance-022-diagnostics.md)。
- **0.2.2-rc.2 / rc.3**：rc.3 是当前首部声明的主验证目标（见 [§1](#c-matrix)）。Windows 上的 rc.3 只做了部分验证——不要写成"Windows 全量通过"。
- **0.2.2-alpha.2、rc.4**：`unknown`。`unknown` 不是"大概可以"，是"没有证据"。
- **0.2.3-alpha.1**：系统指令改为"按来源增量提交"。`complete` 预设的段落先被捕获，waterfall 跑完后宿主按捕获快照还原，运行时再往返回对象里补段进不了 `systemUpdates`。插件改为在 `section()` 注册期把注入折进 complete 段自身（`installCompleteSectionGuard`），并在挂载时**补写已经注册的 complete 段**（插件晚启用、热更新、预设先挂载）；普通模式会注册的 `dsh-purge*` 附加段（主注入、强化段、探针、后置提示 `postPrompt`）也一起折进去，否则它们在 complete 预设下会静默失效。每个 `systemPrompt` 服务实例单独挂载，不是"第一个挂上就再也不管"。旧规则 #40/#55/#72/#87/#88 因此标注 `superseded`（见 [§4](#c-fileoptional)），既不是漂移也不是已应用。该发行在 `dshReleases` 里仍保持 `unknown`——没有做逐条锚点全量回归，不要写成 `compatible`。
- **NEXT 宿主家族**：独立、未验证。包名识别或磁盘写入成功都不构成完整运行兼容证明；#102 的 NEXT 桌面发行版完整兼容仍未确认。
- 隔离安装测试（含 `scripts/check-architecture-runtime.mjs` 调整测试副本布局的那类）只代表安装路径，不代表模型行为、GUI 功能或宿主补丁全量验收。

<a id="c-kernel-prompt"></a>

## 3. 内核 / prompt 段位契约

宿主按 `order` 排序装配 section，区间是 `-1000…10200`；已知锚点：persona-prefix `0`、工具 `1000–3100`、`DELIVERABLE` `9000`、`STRUCTURED_OUTPUT` `9900`、`WEB_SURFACE` `10100`、persona-suffix `10200`。低于 0 的 order 排在 persona 之前——**不能用 `GLOBAL_PROMPT_ORDER + n` 表示"尾部"**。

| 段 | 默认 order | 说明 |
| --- | --- | --- |
| 破甲强化段（boost） | `-50000`（最前） | 实测同一组 6 条易拒请求：boost 在最前 0/6 首拒，放 9500 时 2/6 首拒（issue #76） |
| 注入正文（tail 模式） | `10150` | `inject tail\|both` 只影响注入正文，**不移动**强化段 |
| complete 模式注入段 | 折进 `deployment:persona-prefix` 段内 | 0.2.3-alpha.1 起在 `section()` 注册期组合（含已注册定义的补写），预设正文在前，`dsh-purge*` 附加段按注册 order 在后；老宿主仍由 #40 的宿主补丁保留独立段 |

- 覆盖顺序：`PURGE_BOOST_ORDER`（环境变量）> `$DSH_HOME/dsh-purge/boost-order.json`（`{"order": 9500}`）> 默认。改文件后开新会话即生效。
- 切换段位：`purge-community inject head|tail|both`（写 tuning + 记 `tuning_setting`，下一轮生效，不需要重启）。
- 改排序属于**行为变更**：发布前应做真机 A/B（同一组易拒请求，比较 `refusal_retry` 次数与回答形态），不能只靠单测里的 order 数字。
- 注入正文的契约是 `$DSH_HOME/prompt-inject.md`（用户正文，插件只读）；运行时分注入、强化段、能力说明、boost、probe、postPrompt 与宿主兜底共用同一套预设判定（`excludePresets`）。

<a id="c-fileoptional"></a>

## 4. `fileOptional`、`partial` 与已知不适用目标

- 逐文件状态：`patchStatusDetail().files[id] = [{key, path, status}]`，`status ∈ applied | pending | skipped | superseded | unmatched | missing | unreadable`；接口字段 `patch_files`。`patchStatus` 本身仍按补丁聚合。
- `partial`：**只有**声明 `fileAllRequired: true` 的多文件补丁才会产生，含义是"至少一个**存在的**目标文件没命中、另一个已命中"。`patchStatusReady("partial")` 为 false，`patchDrift` 报 `partial_drift`，自检计入异常。没有该标记的老补丁保持原聚合行为——目标文件随宿主版本增删，一律判部分命中会把真漂移淹掉。
- `fileOptional: ["key"]`：这个目标**在新版宿主里已不承载该行为**，不参与 `partial` 判定，但仍逐文件出现在 `patchStatusDetail().files` 里、状态照实显示。加之前必须核对：目标文件是真没这段逻辑，还是只换了写法——说不清就不加。
- 当前 `fileOptional` 名单与依据：

| 补丁 | 目标 key | 依据 |
| --- | --- | --- |
| #32 | `harness-dev-context` | `legacyParagraph` 匹配常量，改了会漏历史段落 |
| #36 | `tool-fs` | 措辞已由审批补丁写成 `Approval is auto-granted.` |
| #62 | `dsh-tools` | rc.3 把判断只留在 `types/index.js` |

- #50 **不是** optional，而是补了等价的"已达成"标记；#76 声明 `silentWhenMissing`，缺失时判 `skipped` 而不报红。
- 漂移判定：目标文件存在、marker 不在、锚点全不中 → `drifted`（不再软成功）；自标记补丁与 `silentWhenMissing` 补丁仍判 `skipped`；`fileOptional` 的目标漂移不牵连整条补丁。整段机制与排查动作见 [troubleshooting §7](troubleshooting.md#t-drift)。
- `superseded`（旧规则被宿主原生机制取代）：补丁声明 `supersededBy: {since, by, native, note, requiresRuntime?}`；**锚点全不中、且 `native` 里的替代机制痕迹在目标文件里都在**时才判该状态。它计入 `not_applicable`、不计入分母与失败数，`patchStatusReady` 为 true；`patchDrift` 把它放进单独的 `superseded` 桶，不混进 `drifted`/`optionalDrift`。**它不是 `applied`**：本插件没有写任何东西，面板显示"由新版接管"并附原因。锚点还在时照旧判 `pending`，替代机制不在时照旧判 `drifted`——不能用来掩盖真问题。
- `requiresRuntime`（目前只有 #40）：声明这条规则的行为由**插件运行时**补回，因此除宿主痕迹外还要有运行时挂载证据，否则照旧判 `drifted`（功能确实缺失）。证据来自 `$DSH_HOME/dsh-purge/runtime-evidence.json`：插件启动时先把 `completeComposition` 置 false，`installCompleteSectionGuard` 真的挂上（含晚挂载补写）再写 true。
- 证据按**写进程 pid** 逐条记录（`{version:2, keys:{<name>:[{pid,mounted,host,at}]}}`）：读取时校验 pid 存活、DSH_HOME 与宿主归属，写进程一退出记录立即失效——所以"重启后插件被禁用/加载失败"不会沿用上一次启动的"已挂载"；同一 home 里只要有一条存活记录说没挂上，也按未确认处理。没有证据、旧格式、读失败都判未确认，绝不猜成已接管。残留边界：pid 被系统复用（概率极低，后果是单条状态偏绿）；多进程共用一个 home 且宿主不同，跨进程只能确认"有存活进程挂上了"，面板所在进程仍以自身记录为准。
- 注册期组合以**服务能力**判定：只有 `systemPrompt` 服务原型上存在 `systemUpdates`（0.2.3-alpha.1 引入）才开启，读不到就保守关闭。老宿主由 #40 的宿主补丁保留 complete 之后的独立注入段，两边同时开会把同一段注入写两遍。判定不读版本号，因此封在归档里或目录尚未定位时也不会误判。

<a id="c-desktop-web"></a>

## 5. 桌面版 / Web / premium 差异

| 形态 | 应用方式 | 必须记住的差异 |
| --- | --- | --- |
| DSH 桌面版（Electron，密封 `app.asar`） | 写盘 + 启动等待助手，用户**完整退出**后换包 | 不自动退出/重启；`asar_handoff.phase` 是唯一证据；`desktop` profile 由 Electron 应用初始化，普通 `--profile desktop --dump-config` 报 managed exclusively 属预期，不能据此判断程序坏了，也不能手造"已接受协议/已登录"记录 |
| 桌面版（已解包） | 直接写源码目录 | 仍需退出重开才加载；`app/runtime` 链接可能需修复 |
| Web / 独立 CLI | 直接写源码目录，子路径请求按实际插件脚本路径定位挂载点 | 根路径与桌面入口继续兼容；不为修 404 扩大 Cookie 域或合并端口 |

- 跨 surface：Web GUI 触发「应用」时同样要等桌面退出后换包（`sealedDesktopHandoffAnySurface()` + `runningDesktopPid()`）；桌面没运行则返回 `needsDesktopApply`，不假装成功。决策由 `planApplyRestartAction()` 覆盖（sealed / cross-surface / manual / plain）。
- **premium 发行版**：本仓库没有独立适配记录，`dshReleases` 里也没有对应条目，按 `unknown` 处理；不得据 README 或桌面版结论推断 premium 可用。
- 第三方宿主/桌面：未验证的问题单独保持待确认，不能因为"同为 Electron"就套用官方宿主结论（#63 的第三方宿主兼容性尚未确认）。

<a id="c-unknown"></a>

## 6. 已知未知与不适用（写报告时照抄这一节）

- `unknown` 不等于可用：rc.4、alpha.2、premium、NEXT 家族、第三方桌面都属未验证。
- 不适用（na）只指**该家族完全未安装**；已安装但组件缺失、YAML 损坏、读取失败都要继续排查。
- #127 的 httpServer/webServer 契约问题未合入——不要自行加未经验证的服务别名，也不要把 HTTP 可连接当作消费者正常启动。
- 受影响 Windows 4090 的 Defender 完整回滚阻断仍未解决（见 [发行范围](releases/1.6.70.md)）；不能把"维护者要求发布"说成问题已修复，也不关防护、不加白名单、不把组件测试说成完整通过。
- 磁盘已应用 ≠ 当前进程已加载；安装成功 ≠ 补丁生效；补丁生效 ≠ 模型行为达标。这三件事分别取证，不互相代替。

### 运行时证据的已知边界

当前记录在撤销写盘失败时可能继续读取旧的成功状态；进程存活检查也尚未区分 PID 复用。此版本保留这两项诊断边界，不据状态显示承诺所有实际注入场景已验证。
