# Web 基线差分

基于上游 1.6.91（9cc199e），不迁移旧宿主补丁定义或自有设置页入口。

保留当前 Web 实例维护隔离：显式来源不得冲突；文件、备份与状态目录不得通过链接或硬链接写入其他实例；Web 不维护桌面 CLI 或全局启动器。实例定位复用上游 instance.js。维护入口在执行前检查，不依赖调用者手动选择正确目录。

显示分组中的 drifted、partial、unreadable 必须保留异常状态，不计入 ready；CLI 汇总显示 attention 数量。底层逐文件诊断沿用上游。

新增文件以 Prettier 检查格式、oxlint 检查代码，修改的 JavaScript 运行 node --check；保留上游大文件原格式。运行 npm run test:web-baseline，覆盖两实例真实临时文件、冲突目标 HTTP 入口、生命周期、备份和诊断。测试只修改合成普通文本，不代表真实模型或生产手动应用验收。
