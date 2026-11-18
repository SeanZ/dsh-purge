# Web 基线差分

基于上游1.7.20（3c47ea9），宿主为官方rc.4；不迁移旧宿主补丁定义或自有设置页入口。

仅保留当前Web实例维护隔离：显式来源不得冲突；文件、备份和状态目录不得通过链接或硬链接写入其他实例；Web不维护桌面CLI或全局启动器。实例定位复用上游instance.js，维护入口执行前检查。

上游已通过patch-state.mjs统一状态分类与逐条证据，本基线退役自有DISPLAY_ATTENTION和显示汇总实现。验证异常不可被算作ready，沿用上游新状态口径，不保留旧返回字段兼容层。

新增文件以Prettier和oxlint检查，修改JavaScript运行node --check；保留上游大文件格式。npm run test:web-baseline覆盖临时两实例文件、冲突目标HTTP入口、生命周期、备份和诊断，不代表真实模型或生产应用验收。
