// 生成文件：请修改 client-src 并运行 npm run build:client。
window.__ModuleLoader__.load({ id: "dsh-purge", factory: (require) => { var module = { exports: {} }; var exports = module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// client-src/app.js
var app_exports = {};
__export(app_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(app_exports);

// client-src/locale-zh.js
var zh = {
  nav: "\u89C4\u5219\u8BBE\u5B9A",
  "theme.aria": "\u5916\u89C2",
  "theme.white": "\u767D",
  "theme.ink": "\u58A8",
  "purge.title": "\u8865\u4E01",
  "override.title": "\u63D0\u793A\u8BCD",
  "metric.purged": "\u8865\u4E01",
  "metric.shim": "shim",
  "metric.bak.yes": "\u6709\u5907\u4EFD",
  "metric.bak.no": "\u65E0\u5907\u4EFD",
  "metric.bak.hint": "\u5907\u4EFD",
  "table.patch": "\u9879\u76EE",
  "table.status": "\u72B6\u6001",
  "status.applied": "\u5DF2\u5E94\u7528",
  "status.pending": "\u5F85\u5E94\u7528",
  "status.skipped": "\u8DF3\u8FC7",
  "apply.hint": "\u5F85\u5E94\u7528=\u539F\u6587\u8FD8\u5728\u3002\u8DF3\u8FC7=\u5F53\u524D\u7248\u672C\u4E0D\u9700\u8981\u6216\u7EC4\u4EF6\u672A\u5B89\u88C5\uFF0C\u518D\u70B9\u4E5F\u4E0D\u4F1A\u53D8\u3002",
  "warn.noRoot": "\u672A\u5B9A\u4F4D\u5230\u5F53\u524D\u5BBF\u4E3B\u7684 @deepseek-ai\uFF0C\u6E05\u6D17\u4E0D\u4F1A\u751F\u6548\u3002\u8BF7\u5B8C\u5168\u9000\u51FA\u540E\u518D\u6253\u5F00\u672C\u5BBF\u4E3B\uFF0C\u5728\u672C\u9875\u70B9\u300C\u5E94\u7528\u300D\u3002\u684C\u9762\u7AEF\u5B89\u88C5\u76EE\u5F55\u53EF\u4EE5\u662F\u4EFB\u610F\u76D8\u7B26\uFF0C\u4E0D\u8981\u7528\u5B98\u65B9 dsh \u53BB\u6E05\u684C\u9762\u7AEF\u3002",
  "warn.noRoot.desktop": "\u672A\u5B9A\u4F4D\u5230\u5F53\u524D\u684C\u9762\u5E94\u7528\u91CC\u7684 @deepseek-ai\u3002\u8BF7\u9000\u51FA\u6258\u76D8\u540E\u91CD\u65B0\u6253\u5F00 DSH Desktop.exe\uFF0C\u518D\u5728\u684C\u9762\u7AEF\u8BBE\u7F6E\u9875\u70B9\u300C\u5E94\u7528\u300D\u3002\u5B89\u88C5\u76EE\u5F55\u4E0D\u9650\u76D8\u7B26\u3002",
  "warn.noInject": "\u63D0\u793A\u8BCD\u4F18\u5148\uFF1B\u4E3A\u7A7A\u5219\u6CE8\u5165\u5F53\u524D\u542F\u7528\u7684\u89C4\u5219\u96C6\u3002\u4E24\u8FB9\u90FD\u7A7A\u4F1A\u63D0\u793A\u5FC5\u987B\u6DFB\u52A0\u3002Skill \u4E0D\u9876\u66FF\u63D0\u793A\u8BCD\u3002",
  "need.prompt": "\u63D0\u793A\u8BCD\u548C\u89C4\u5219\u96C6\u90FD\u662F\u7A7A\u7684\uFF0C\u5FC5\u987B\u5148\u6DFB\u52A0\u63D0\u793A\u8BCD\uFF0C\u6216\u542F\u7528\u4E00\u6761\u6709\u5185\u5BB9\u7684\u89C4\u5219\u96C6\u3002",
  "btn.restoreInject": "\u6062\u590D\u9ED8\u8BA4",
  "saved.restoreInject": "\u5DF2\u586B\u5165\u9ED8\u8BA4\u63D0\u793A\u8BCD\uFF0C\u70B9\u4FDD\u5B58\u5199\u5165",
  skip: "\u8DF3\u8FC7",
  unknown: "\u672A\u77E5",
  delete: "\u5220\u9664",
  "btn.apply": "\u5E94\u7528",
  "btn.apply.busy": "\u5904\u7406\u4E2D\u2026",
  "btn.revert": "\u8FD8\u539F",
  "btn.uninstall": "\u5378\u8F7D",
  "btn.uninstall.busy": "\u5378\u8F7D\u4E2D\u2026",
  "uninstall.title": "\u5378\u8F7D dsh-purge",
  "uninstall.body": "\u662F\u5426\u5378\u8F7D\uFF1F\u5378\u8F7D\u5C06\u8FD8\u539F\u56DE\u539F\u7248\uFF0C\u5E76\u6E05\u9664\u672C\u63D2\u4EF6\u7684\u5168\u90E8\u6587\u4EF6\u4E0E\u8865\u4E01\u3002",
  "uninstall.confirm": "\u786E\u8BA4\u5378\u8F7D",
  "uninstall.cancel": "\u53D6\u6D88",
  "uninstall.applying": "\u6B63\u5728\u5378\u8F7D\u5E76\u8FD8\u539F\u2026",
  "uninstall.done": "\u5DF2\u5378\u8F7D\u5E76\u8FD8\u539F\uFF0C\u6B63\u5728\u91CD\u542F\u2026",
  "uninstall.done.desktop": "\u5DF2\u5378\u8F7D\u5E76\u8FD8\u539F\uFF0C\u6B63\u5728\u91CD\u542F\u684C\u9762\u5E94\u7528\u2026",
  "uninstall.fail": "\u5378\u8F7D\u5931\u8D25: {error}",
  "btn.checkUpdate": "\u68C0\u6D4B\u66F4\u65B0",
  "btn.checkUpdate.busy": "\u68C0\u6D4B\u4E2D\u2026",
  "btn.doUpdate": "\u66F4\u65B0",
  "btn.doUpdate.busy": "\u66F4\u65B0\u4E2D\u2026",
  "channel.title": "\u901A\u9053",
  "channel.stable": "\u6B63\u5F0F\u7248",
  "channel.beta": "\u6D4B\u8BD5\u7248",
  "channel.useStable": "\u5207\u6362\u5230\u6B63\u5F0F\u7248",
  "channel.useBeta": "\u5207\u6362\u5230\u6D4B\u8BD5\u7248",
  "channel.local": "\u672C\u673A",
  "update.checking": "\u6B63\u5728\u68C0\u6D4B\u66F4\u65B0\u2026",
  "update.applying": "\u6B63\u5728\u66F4\u65B0\u2026",
  "update.switching": "\u6B63\u5728\u5207\u6362\u7248\u672C\u2026",
  "update.latest": "\u5DF2\u662F\u6700\u65B0\uFF08{version}\uFF09",
  "update.available": "\u6709\u65B0\u7248\u672C {remote}\uFF0C\u5F53\u524D {local}",
  "update.pinned": "\u5DF2\u56FA\u5B9A\u5728 {version}\uFF0C\u901A\u9053\u6700\u65B0\u662F {remote}",
  "update.done": "\u5DF2\u66F4\u65B0\u5230 {version}",
  "update.switched": "\u5DF2\u5207\u6362\u5230 {version}",
  "update.autoDone": "\u5DF2\u81EA\u52A8\u66F4\u65B0\u5230 {version}",
  "update.reloading": "\u6B63\u5728\u5237\u65B0\u8BBE\u7F6E\u9875\u2026",
  "update.dirty": "\u6709\u65B0\u7248\u672C\uFF0C\u672C\u5730\u6709\u6539\u52A8\u672A\u81EA\u52A8\u8986\u76D6",
  "update.fail": "\u66F4\u65B0\u5931\u8D25: {error}",
  "update.timeout": "\u68C0\u6D4B\u8D85\u65F6\uFF0C\u8BF7\u518D\u70B9\u4E00\u6B21\u68C0\u6D4B\u66F4\u65B0",
  "update.needRestart": "\u68C0\u6D4B\u63A5\u53E3\u672A\u52A0\u8F7D\uFF0C\u8BF7\u5148\u91CD\u542F dsh \u518D\u70B9\u68C0\u6D4B\u66F4\u65B0",
  "update.noBeta": "\u8FD8\u6CA1\u6709\u6D4B\u8BD5\u7248",
  "update.switch": "\u5207\u6362\u5230\u6B64\u7248\u672C",
  "update.pick": "\u9009\u62E9\u7248\u672C",
  "update.tip": "\u6700\u65B0",
  "update.current": "\u5F53\u524D",
  "update.confirmSwitch": "\u5207\u6362\u5230 {version}\uFF1F\u4E4B\u540E\u53EF\u518D\u5207\u56DE\u53E6\u4E00\u901A\u9053\u6216\u5176\u5B83\u7248\u672C\u3002\u672C\u5730\u672A\u63D0\u4EA4\u7684\u63D2\u4EF6\u6539\u52A8\u4E0D\u4F1A\u4FDD\u7559\u3002",
  "update.confirmChannel": "\u5207\u6362\u5230{version}\uFF1F\u4F1A\u6309\u8BE5\u901A\u9053\u91CD\u65B0\u5B89\u88C5\u63D2\u4EF6\uFF0C\u672C\u5730\u672A\u63D0\u4EA4\u7684\u63D2\u4EF6\u6539\u52A8\u4E0D\u4F1A\u4FDD\u7559\u3002",
  "metric.version": "\u7248\u672C",
  "action.apply": "\u5E94\u7528",
  "action.revert": "\u8FD8\u539F",
  "action.uninstall": "\u5378\u8F7D",
  "ok.done": "\u5DF2\u5B8C\u6210",
  "err.action": "\u5931\u8D25: {error}",
  "err.status": "\u8BFB\u53D6\u5931\u8D25: {error}",
  "err.override": "\u8BFB\u53D6\u5931\u8D25: {error}",
  "err.rules": "\u8BFB\u53D6\u5931\u8D25: {error}",
  "err.read": "\u8BFB\u53D6\u5931\u8D25: {error}",
  "err.save": "\u4FDD\u5B58\u5931\u8D25: {error}",
  "btn.saveInject": "\u4FDD\u5B58",
  "saved.override": "\u5DF2\u4FDD\u5B58",
  "rules.title": "\u89C4\u5219\u96C6",
  "rules.none": "\u65E0",
  "rules.reset": "\u8FD8\u539F",
  "rules.reset.confirm": "\u8FD8\u539F\u5168\u5C40\u6307\u4EE4\u6587\u4EF6\uFF1F\u89C4\u5219\u5E93\u4F1A\u4FDD\u7559\u3002",
  "rules.empty": "\u6682\u65E0\u89C4\u5219",
  "rules.pick": "\u9009\u62E9\u89C4\u5219",
  "pill.current": "\u5F53\u524D",
  "btn.use": "\u542F\u7528",
  "btn.inUse": "\u5F53\u524D",
  "confirm.delete": "\u5220\u9664 {id}\uFF1F",
  "ph.id": "id",
  "ph.alias": "\u540D\u79F0",
  "ph.alias.short": "\u540D\u79F0",
  "btn.create": "\u65B0\u5EFA",
  "need.id": "\u9700\u8981 id",
  "ph.content": "",
  "btn.saveRule": "\u4FDD\u5B58",
  "skills.title": "Skill",
  "skills.hint": "\u5BFC\u5165\u5230\u5B98\u65B9\u76EE\u5F55\u540E\uFF0C\u7531 DSH \u8C03\u7528\uFF1A\u804A\u5929\u8F93\u5165 /\u540D\u79F0 \u7ACB\u5373\u52A0\u8F7D\uFF1B\u4EFB\u52A1\u5BF9\u4E0A description \u6216 whenToUse \u65F6\u6A21\u578B\u4F1A\u8C03 skill \u5DE5\u5177\u3002\u6B63\u6587\u5199\u300C\u6FC0\u6D3B\u300D\u4E0D\u4F1A\u89E6\u53D1\u3002",
  "skills.hint.desktop": "\u5F53\u524D\u684C\u9762\u5BBF\u4E3B\u7684\u5B98\u65B9 Skill \u76EE\u5F55\u3002\u804A\u5929\u8F93\u5165 /\u540D\u79F0 \u7ACB\u5373\u52A0\u8F7D\uFF1B\u4EFB\u52A1\u5BF9\u4E0A description \u65F6\u6A21\u578B\u4F1A\u8C03 skill \u5DE5\u5177\u3002",
  "skills.empty": "\u6682\u65E0\u7528\u6237 Skill",
  "btn.importZip": "\u5BFC\u5165\u538B\u7F29\u5305",
  "btn.importFolder": "\u5BFC\u5165\u6587\u4EF6\u5939",
  "skills.importing": "\u6B63\u5728\u5BFC\u5165\u2026",
  "saved.import": "\u5DF2\u5BFC\u5165 {count} \u4E2A Skill",
  "need.import": "\u8BF7\u9009\u62E9\u538B\u7F29\u5305\u6216\u6587\u4EF6\u5939",
  "err.import.folder": "\u6CA1\u8BFB\u5230\u6587\u4EF6\u5939\u91CC\u7684\u6587\u4EF6\uFF0C\u8BF7\u76F4\u63A5\u9009 Skill \u76EE\u5F55\uFF08\u91CC\u9762\u8981\u6709 SKILL.md\uFF09",
  "skills.pick": "\u9009\u62E9 Skill",
  "skills.invalid": "\u5B98\u65B9\u4F1A\u5FFD\u7565\uFF1A\u683C\u5F0F\u4E0D\u5BF9",
  "skills.call.slash": "\u804A\u5929\u8F93\u5165 {cmd}",
  "skills.call.model": "\u6A21\u578B\u53EF\u8C03",
  "skills.call.modelOff": "\u6A21\u578B\u4E0D\u53EF\u8C03",
  "skills.call.userOff": "\u4E0D\u53EF /\u540D\u79F0",
  "ph.skill.desc": "description\uFF08\u4F55\u65F6\u7528\uFF09",
  "btn.saveSkill": "\u4FDD\u5B58",
  "need.skill.id": "id \u5FC5\u987B\u662F kebab-case\uFF0C\u4F8B\u5982 code-review",
  "confirm.delete.skill": "\u4ECE\u5B98\u65B9 $DSH_HOME/skills \u5220\u9664 {id}\uFF1F\u5BBF\u4E3B\u4F1A\u81EA\u52A8\u4ECE\u76EE\u5F55\u62FF\u6389\u3002",
  "err.skills": "\u8BFB\u53D6\u5931\u8D25: {error}",
  "err.skills.needRestart": "Skill \u63A5\u53E3\u672A\u52A0\u8F7D\uFF0C\u8BF7\u5148\u91CD\u542F\u5F53\u524D\u5BBF\u4E3B",
  "btn.restart": "\u91CD\u542F",
  "btn.restart.busy": "\u91CD\u542F\u4E2D\u2026",
  restarting: "\u91CD\u542F\u4E2D\u2026",
  "restarting.desktop": "\u6B63\u5728\u91CD\u542F\u684C\u9762\u5E94\u7528\u2026",
  "restart.timeout": "\u8D85\u65F6\uFF0C\u8BF7\u5237\u65B0",
  "restart.fail": "\u5931\u8D25: {error}",
  "restart.confirm": "\u6E05\u6D17\u5DF2\u5B8C\u6210\uFF0C\u91CD\u542F\u540E\u751F\u6548\u3002",
  "restart.confirm.desktop": "\u6E05\u6D17\u5DF2\u5B8C\u6210\uFF0C\u91CD\u542F\u684C\u9762\u5E94\u7528\u540E\u751F\u6548\u3002",
  "surface.web": "Web",
  "surface.desktop": "\u684C\u9762\u7AEF",
  "surface.gui": "GUI",
  "surface.tui": "TUI",
  "restart.incomplete": "\u6E05\u6D17\u672A\u5B8C\u6210\uFF1A{detail}",
  "restart.incomplete.patches": "\u5FC5\u9700\u8865\u4E01\u5931\u8D25 {failed} \u9879\uFF08#{ids}\uFF09",
  "restart.incomplete.flash": "CMD \u65E0\u611F\u672A\u9489\u5165\uFF08{entry}\uFF09",
  "restart.later": "\u4EE5\u540E",
  "group.prompt": "\u63D0\u793A\u8BCD",
  "group.code": "\u4EE3\u7801",
  "group.engine": "\u5F15\u64CE",
  "group.tools": "\u5DE5\u5177",
  "group.compat": "0.1.5 \u517C\u5BB9",
  "patch.1": "\u5168\u5C40\u514D\u8D23 \u2192 \u5F3A\u6307\u4EE4",
  "patch.2": "\u66FF\u6362\u5F0F\u514D\u8D23 \u2192 \u5F3A\u6307\u4EE4",
  "patch.3": "\u4F5C\u7528\u57DF\u514D\u8D23 \u2192 \u5F3A\u6307\u4EE4",
  "patch.4": "persona \u4F1A\u8BDD\u5F3A\u6307\u4EE4",
  "patch.5": "\u5BA1\u6279\u63D0\u793A\u53E5 \u2192 \u5168\u6743\u9650",
  "patch.6": "\u6C99\u7BB1 deny \u2192 allow \u5199",
  "patch.7": "\u6C99\u7BB1\u9ED8\u8BA4\u5168\u6743\u9650",
  "patch.8": "\u5BA1\u6279\u9ED8\u8BA4 never",
  "patch.9": "\u5BA1\u6279\u95E8\u81EA\u52A8\u653E\u884C",
  "patch.10": "\u5BA1\u6279\u914D\u7F6E\u9ED8\u8BA4 never",
  "patch.11": "never \u63D0\u793A\u53E5 \u2192 \u81EA\u52A8\u653E\u884C",
  "patch.12": "ask \u63D0\u793A\u53E5 \u2192 \u81EA\u52A8\u653E\u884C",
  "patch.13": "\u8C41\u514D\u5347\u7EA7\u9636\u68AF",
  "patch.14": "\u5347\u7EA7\u65E0\u6761\u4EF6\u6388\u4FE1",
  "patch.15": "\u6C99\u7BB1 confine \u76F4\u901A",
  "patch.16": "\u6587\u4EF6\u7CFB\u7EDF\u56F4\u680F\u53D6\u6D88",
  "patch.17": "\u89C2\u5BDF\u7B56\u7565\u8BFB\u5199\u653E\u884C",
  "patch.18": "\u91CD\u590D\u8C03\u7528\u5B88\u536B\u7981\u7528",
  "patch.19": "\u5DE5\u5177\u7ED3\u679C\u4FEE\u526A\u7981\u7528",
  "patch.20": "dsh-web-fetch-http\uFF1Abase \u5199\u5165\u4F9D\u8D56",
  "patch.21": "bash \u8D85\u65F6 60s \u2192 10min",
  "patch.22": "read \u4E0A\u9650\u653E\u5BBD",
  "patch.23": "\u5B50\u4EE3\u7406\u6DF1\u5EA6 3 \u2192 10",
  "patch.24": "preset fetch \u542F\u7528",
  "patch.25": "\u53BB\u6389\u5B98\u65B9\u9ED8\u8BA4\u8EAB\u4EFD\uFF08\u529F\u80FD\u63D0\u793A\u8BCD\u4E0D\u52A8\uFF09",
  "patch.26": "minimal\uFF1A\u53BB\u6389\u9ED8\u8BA4\u8EAB\u4EFD\u5E76\u6253\u5F00 inject",
  "patch.27": "dsh-liangshen\uFF08\u6881\u795E\uFF09\uFF1A\u53BB\u6389\u9ED8\u8BA4\u8EAB\u4EFD\uFF08\u53EF\u9009\uFF09",
  "patch.28": "dsh-liangshen\uFF08\u6881\u795E\uFF09\uFF1Aphase-1 \u4FDD\u7559\u6CE8\u5165\u6BB5",
  "patch.29": "dsh-tool-web\uFF1A\u5916\u90E8 untrusted \u62E6\u622A\u2192\u53EF\u6267\u884C",
  "patch.30": "dsh-hooks-claude-code\uFF1Adeny\u2192allow",
  "patch.31": "dsh-hooks-codex\uFF1Adeny\u2192allow",
  "patch.32": "Web \u8868\u9762\u8EAB\u4EFD\u4E2D\u6027\u5316",
  "patch.33": "Shell \u62D2\u7EDD\u63D0\u793A \u2192 \u53EF\u6267\u884C",
  "patch.34": "\u6C99\u7BB1\u63D0\u793A\u4E2D\u6027\u5316",
  "patch.35": "\u5347\u7EA7 never \u4E0D\u62D2",
  "patch.36": "\u6587\u4EF6\u7CFB\u7EDF\u5347\u7EA7 schema \u653E\u884C",
  "patch.37": "\u5B50\u4EE3\u7406 scope lock \u4E2D\u6027\u5316",
  "patch.38": "persona text\u2192prefix\uFF080.1.2 \u9884\u8BBE\uFF09",
  "patch.39": "\u4F1A\u8BDD v0 plugin summary\uFF08mnemon\uFF09",
  "patch.40": "complete \u9884\u8BBE\u4ECD\u4FDD\u7559\u6CE8\u5165",
  "rewind.label": "\u56DE\u9000",
  "rewind.aria": "\u56DE\u9000",
  "rewind.busy": "\u56DE\u9000\u4E2D\u2026",
  "rewind.empty": "\u6CA1\u6709\u53EF\u56DE\u9000\u7684\u4E0A\u4E00\u53E5",
  "rewind.fail": "\u56DE\u9000\u5931\u8D25: {error}",
  "rewind.once": "\u56DE\u9000\u4E00\u6B21",
  "rewind.once.hint": "\u53EA\u9000\u5F53\u524D\u5BF9\u8BDD\u4E0A\u4E00\u53E5",
  "rewind.round": "\u56DE\u9000\u4E0A\u4E00\u8F6E",
  "rewind.round.hint": "\u9000\u56DE\u4E0A\u4E00\u8F6E\u4E3B\u5BF9\u8BDD\uFF0C\u672C\u8F6E\u5B50\u4EE3\u7406\u4E00\u5E76\u53BB\u6389",
  "continue.title": "\u5931\u8D25\u91CD\u8BD5 / \u7EE7\u7EED",
  "continue.hint": "\u8BF7\u6C42\u5931\u8D25\u4F1A\u81EA\u52A8\u91CD\u8BD5\uFF1B\u5F02\u5E38\u505C\u6B62\u6216\u4E2D\u65AD\u53EF\u70B9\u300C\u7EE7\u7EED\u300D\u6216\u81EA\u52A8\u7EED\u8DD1\u3002\u81EA\u5DF1\u70B9\u505C\u6B62\u4E0D\u4F1A\u81EA\u52A8\u7EE7\u7EED\u3002\u6B21\u6570\u7528\u5B8C\u540E\u9700\u65B0\u5F00\u4E00\u8F6E\u3002",
  "continue.autoRetry": "\u5931\u8D25\u81EA\u52A8\u91CD\u8BD5",
  "continue.retryMax": "\u91CD\u8BD5\u6B21\u6570",
  "continue.autoContinue": "\u4E2D\u65AD\u540E\u81EA\u52A8\u7EE7\u7EED",
  "continue.continueMax": "\u7EE7\u7EED\u6B21\u6570",
  "continue.text": "\u7EE7\u7EED\u7528\u8BED",
  "saved.continue": "\u5DF2\u4FDD\u5B58",
  "continue.label": "\u7EE7\u7EED",
  "continue.aria": "\u5F02\u5E38\u505C\u6B62\u540E\u7EE7\u7EED",
  "continue.busy": "\u7EE7\u7EED\u4E2D\u2026",
  "continue.ready": "\u7EE7\u7EED\uFF08\u8FD8\u53EF {left} \u6B21\uFF09",
  "continue.limit": "\u5DF2\u8FBE\u7EE7\u7EED\u4E0A\u9650",
  "continue.fail": "\u7EE7\u7EED\u5931\u8D25: {error}"
};

// client-src/locale-en.js
var en = {
  nav: "Rules",
  "theme.aria": "Appearance",
  "theme.white": "Light",
  "theme.ink": "Ink",
  "purge.title": "Patches",
  "override.title": "Prompt",
  "metric.purged": "Patches",
  "metric.shim": "shim",
  "metric.bak.yes": "Backup",
  "metric.bak.no": "No backup",
  "metric.bak.hint": "Backup",
  "table.patch": "Item",
  "table.status": "Status",
  "status.applied": "Applied",
  "status.pending": "Pending",
  "status.skipped": "Skipped",
  "apply.hint": "Pending = original text still present. Skipped = not needed for this version or component not installed.",
  "warn.noRoot": "Could not find this host\u2019s @deepseek-ai tree, so Apply will not patch anything. Fully quit and reopen this host, then Apply here. Desktop may live on any drive; do not use official dsh to purge Desktop.",
  "warn.noRoot.desktop": "Could not find @deepseek-ai inside this desktop app. Quit the tray, reopen DSH Desktop.exe, then Apply on the desktop Settings page. The install folder can be on any drive.",
  "warn.noInject": "The prompt box wins. If it is empty, the enabled rule set is injected. If both are empty you will be asked to add a prompt. Skills do not replace the prompt.",
  "need.prompt": "Both the prompt and the rule set are empty. Add a prompt, or enable a rule that has content.",
  "btn.restoreInject": "Reset default",
  "saved.restoreInject": "Default prompt loaded. Save to write.",
  skip: "Skipped",
  unknown: "Unknown",
  delete: "Delete",
  "btn.apply": "Apply",
  "btn.apply.busy": "Working\u2026",
  "btn.revert": "Restore",
  "btn.uninstall": "Uninstall",
  "btn.uninstall.busy": "Uninstalling\u2026",
  "uninstall.title": "Uninstall dsh-purge",
  "uninstall.body": "Uninstall? This restores the original Harness and removes this plugin completely.",
  "uninstall.confirm": "Uninstall",
  "uninstall.cancel": "Cancel",
  "uninstall.applying": "Uninstalling and restoring\u2026",
  "uninstall.done": "Uninstalled and restored. Restarting\u2026",
  "uninstall.done.desktop": "Uninstalled and restored. Restarting the desktop app\u2026",
  "uninstall.fail": "Uninstall failed: {error}",
  "btn.checkUpdate": "Check update",
  "btn.checkUpdate.busy": "Checking\u2026",
  "btn.doUpdate": "Update",
  "btn.doUpdate.busy": "Updating\u2026",
  "channel.title": "Channel",
  "channel.stable": "Stable",
  "channel.beta": "Beta",
  "channel.useStable": "Switch to stable",
  "channel.useBeta": "Switch to beta",
  "channel.local": "This copy",
  "update.checking": "Checking for updates\u2026",
  "update.applying": "Updating\u2026",
  "update.switching": "Switching version\u2026",
  "update.latest": "Up to date ({version})",
  "update.available": "Update {remote} available (now {local})",
  "update.pinned": "Pinned at {version}; channel latest is {remote}",
  "update.done": "Updated to {version}.",
  "update.switched": "Switched to {version}.",
  "update.autoDone": "Auto-updated to {version}.",
  "update.reloading": "Refreshing settings\u2026",
  "update.dirty": "Update available; local edits were not overwritten.",
  "update.fail": "Update failed: {error}",
  "update.timeout": "Check timed out. Click Check update again.",
  "update.needRestart": "Update API is not loaded. Restart dsh, then check again.",
  "update.noBeta": "No beta build yet",
  "update.switch": "Switch to this version",
  "update.pick": "Select version",
  "update.tip": "latest",
  "update.current": "current",
  "update.confirmSwitch": "Switch to {version}? You can switch back later. Uncommitted plugin edits will not be kept.",
  "update.confirmChannel": "Switch to {version}? The plugin will be reinstalled from that channel. Uncommitted plugin edits will not be kept.",
  "metric.version": "Version",
  "action.apply": "Apply",
  "action.revert": "Restore",
  "action.uninstall": "Uninstall",
  "ok.done": "Done",
  "err.action": "Failed: {error}",
  "err.status": "Read failed: {error}",
  "err.override": "Read failed: {error}",
  "err.rules": "Read failed: {error}",
  "err.read": "Read failed: {error}",
  "err.save": "Save failed: {error}",
  "btn.saveInject": "Save",
  "saved.override": "Saved",
  "rules.title": "Rule sets",
  "rules.none": "None",
  "rules.reset": "Restore",
  "rules.reset.confirm": "Restore global instruction files? The rule library is kept.",
  "rules.empty": "No rules",
  "rules.pick": "Select a rule",
  "pill.current": "On",
  "btn.use": "Enable",
  "btn.inUse": "On",
  "confirm.delete": "Delete {id}?",
  "ph.id": "id",
  "ph.alias": "Name",
  "ph.alias.short": "Name",
  "btn.create": "New",
  "need.id": "id required",
  "ph.content": "",
  "btn.saveRule": "Save",
  "skills.title": "Skills",
  "skills.hint": "After import, DSH calls it: type /name in chat to load now; the model calls the skill tool when the task matches description or whenToUse. Writing\u300C\u6FC0\u6D3B\u300Din the body does nothing.",
  "skills.hint.desktop": "This desktop host\u2019s official skill catalog. Type /name in chat to load; the model calls the skill tool when the task matches the description.",
  "skills.empty": "No user skills",
  "btn.importZip": "Import zip",
  "btn.importFolder": "Import folder",
  "skills.importing": "Importing\u2026",
  "saved.import": "Imported {count} skill(s)",
  "need.import": "Choose a zip or folder",
  "err.import.folder": "No files were read. Select the skill folder itself (it must contain SKILL.md).",
  "skills.pick": "Select a skill",
  "skills.invalid": "Official catalog will ignore this: invalid format",
  "skills.call.slash": "Type {cmd} in chat",
  "skills.call.model": "Model can load",
  "skills.call.modelOff": "Hidden from model",
  "skills.call.userOff": "/name disabled",
  "ph.skill.desc": "description (when to use)",
  "btn.saveSkill": "Save",
  "need.skill.id": "id must be kebab-case, e.g. code-review",
  "confirm.delete.skill": "Delete {id} from official $DSH_HOME/skills? The host will drop it from the catalog.",
  "err.skills": "Read failed: {error}",
  "err.skills.needRestart": "Skill API is not loaded. Restart this host first.",
  "btn.restart": "Restart",
  "btn.restart.busy": "Restarting\u2026",
  restarting: "Restarting\u2026",
  "restarting.desktop": "Restarting the desktop app\u2026",
  "restart.timeout": "Timed out; refresh",
  "restart.fail": "Failed: {error}",
  "restart.confirm": "Apply finished. Restart to take effect.",
  "restart.confirm.desktop": "Apply finished. Restart the desktop app to take effect.",
  "surface.web": "Web",
  "surface.desktop": "Desktop",
  "surface.gui": "GUI",
  "surface.tui": "TUI",
  "restart.incomplete": "Apply incomplete: {detail}",
  "restart.incomplete.patches": "{failed} required patch(es) failed (#{ids})",
  "restart.incomplete.flash": "CMD silence not pinned ({entry})",
  "restart.later": "Later",
  "group.prompt": "Prompt",
  "group.code": "Code",
  "group.engine": "Engine",
  "group.tools": "Tools",
  "group.compat": "0.1.5 compat",
  "patch.1": "Global disclaimer \u2192 mandate",
  "patch.2": "Replacement disclaimer \u2192 mandate",
  "patch.3": "Scope disclaimer \u2192 mandate",
  "patch.4": "Persona session mandate",
  "patch.5": "Approval copy \u2192 full access",
  "patch.6": "Sandbox deny \u2192 allow write",
  "patch.7": "Sandbox default full access",
  "patch.8": "Approval default never",
  "patch.9": "Approval gate auto-grant",
  "patch.10": "Approval config default never",
  "patch.11": "never copy \u2192 auto-grant",
  "patch.12": "ask copy \u2192 auto-grant",
  "patch.13": "Escalation ladder exempt",
  "patch.14": "Escalation unconditional grant",
  "patch.15": "Sandbox confine passthrough",
  "patch.16": "Filesystem fence off",
  "patch.17": "Observation policy allow R/W",
  "patch.18": "Repeat-call guard off",
  "patch.19": "Tool-result pruner off",
  "patch.20": "dsh-web-fetch-http: pin base dependency",
  "patch.21": "bash timeout 60s \u2192 10min",
  "patch.22": "read cap raised",
  "patch.23": "subagent depth 3 \u2192 10",
  "patch.24": "preset fetch on",
  "patch.25": "Strip official default identity (keep feature prompts)",
  "patch.26": "minimal: strip identity, open inject",
  "patch.27": "dsh-liangshen: strip default identity (optional)",
  "patch.28": "dsh-liangshen: keep inject in phase-1",
  "patch.29": "dsh-tool-web: untrusted framing \u2192 usable data",
  "patch.30": "dsh-hooks-claude-code: deny\u2192allow",
  "patch.31": "dsh-hooks-codex: deny\u2192allow",
  "patch.32": "Web surface identity neutral",
  "patch.33": "Shell denial prompt \u2192 executable",
  "patch.34": "Sandbox hint neutralized",
  "patch.35": "Escalation never-reject",
  "patch.36": "FS escalation schema opened",
  "patch.37": "Subagent scope lock neutralized",
  "patch.38": "persona text\u2192prefix (0.1.2 presets)",
  "patch.39": "session v0 plugin summary (mnemon)",
  "patch.40": "Keep inject when a complete prompt is set",
  "rewind.label": "Undo",
  "rewind.aria": "Undo",
  "rewind.busy": "Undoing\u2026",
  "rewind.empty": "Nothing to undo",
  "rewind.fail": "Undo failed: {error}",
  "rewind.once": "Undo once",
  "rewind.once.hint": "Drop the last turn of this chat",
  "rewind.round": "Undo last round",
  "rewind.round.hint": "Back to the previous main turn, including this round's subagents",
  "continue.title": "Retry / Continue",
  "continue.hint": "Failed requests auto-retry. After an abnormal stop or interrupt, use Continue or auto-resume. A manual stop never auto-continues. Counts reset after a completed turn.",
  "continue.autoRetry": "Auto-retry on failure",
  "continue.retryMax": "Retry count",
  "continue.autoContinue": "Auto-continue after interrupt",
  "continue.continueMax": "Continue count",
  "continue.text": "Continue text",
  "saved.continue": "Saved",
  "continue.label": "Continue",
  "continue.aria": "Continue after an abnormal stop",
  "continue.busy": "Continuing\u2026",
  "continue.ready": "Continue ({left} left)",
  "continue.limit": "Continue limit reached",
  "continue.fail": "Continue failed: {error}"
};

// client-src/common.js
var react = __toESM(require("react"), 1);
var h = react.createElement;
var { useState, useEffect, useCallback, useRef, Component } = react;
var name = "dsh-purge";
var inject = ["slots", "locale"];
var NS = "settings.dsh-purge";
var translator = (key) => key;
function translate(...args) {
  return translator(...args);
}
function setTranslate(next) {
  translator = next;
}
function useT() {
  return translate;
}
function clientGuessSurface() {
  try {
    if (typeof navigator !== "undefined" && /electron/i.test(navigator.userAgent || "")) return "desktop";
    if (typeof location !== "undefined") {
      const port = String(location.port || "");
      if (port === "43120") return "desktop";
      const host = String(location.hostname || "");
      if (host && host !== "127.0.0.1" && host !== "localhost" && /dsh desktop/i.test(String(location.href || "")))
        return "desktop";
    }
  } catch {
  }
  return "";
}
function hostSurfaceOf(s) {
  return s && s.surface || clientGuessSurface() || "web";
}
function hostText(t, key, surface) {
  if (surface && surface !== "web") {
    const specific = key + "." + surface;
    const hit = t(specific);
    if (hit && hit !== specific) return hit;
  }
  return t(key);
}
function apiUrl(p) {
  try {
    return new URL(p, window.location.origin).toString();
  } catch {
    return p;
  }
}
function apiTimeoutMs(p, init) {
  const path = String(p || "");
  const method = String(init && init.method || "GET").toUpperCase();
  if (path.indexOf("/dsh-purge/update") !== -1) return method === "POST" ? 18e4 : 45e3;
  if (path.indexOf("/dsh-purge/uninstall") !== -1) return 9e4;
  if (path.indexOf("/dsh-purge/skill") !== -1) return method === "POST" ? 12e4 : 2e4;
  return 2e4;
}
function isAbortError(e) {
  const msg = String(e && e.message || e || "");
  return e && e.name === "AbortError" || /aborted|abort/i.test(msg);
}
async function apiJson(p, init) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), apiTimeoutMs(p, init));
  try {
    const r = await fetch(
      apiUrl(p),
      Object.assign({ cache: "no-store", credentials: "same-origin", signal: ctrl.signal }, init || {})
    );
    const text = await r.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error(r.status + " non-json: " + text.slice(0, 120));
    }
    if (!r.ok) throw new Error(data && (data.error || data.message) || r.status + " " + r.statusText);
    return data;
  } catch (e) {
    if (isAbortError(e)) throw new Error("timeout");
    const msg = String(e && e.message || e || "");
    if (/failed to fetch|networkerror|load failed/i.test(msg)) {
      throw new Error("\u8FDE\u4E0D\u4E0A\u63A5\u53E3\uFF0C\u8BF7\u786E\u8BA4 dsh \u8FD8\u5728\u8DD1\u540E Ctrl+F5");
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
function promptBoxEmpty(text) {
  return !String(text || "").trim();
}
function responseNeedsPrompt(d) {
  return Boolean(d && (d.needPrompt || d.injectSource === "none"));
}
function warnNeedPrompt(d, tr) {
  if (!responseNeedsPrompt(d)) return false;
  window.alert(tr("need.prompt"));
  return true;
}
function activeRuleHasBody(st) {
  if (!st || !st.ok) return false;
  const active = st.rules && st.rules.find((r) => r.id === st.active);
  return Boolean(active && active.size > 0);
}
async function bothInjectEmpty(overrideText) {
  if (!promptBoxEmpty(overrideText)) return false;
  try {
    return !activeRuleHasBody(await rulesApi("status"));
  } catch {
    return true;
  }
}
function rulesApi(op, extra) {
  return apiJson("/dsh-purge/rules", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(Object.assign({ op }, extra || {}))
  });
}
function skillsRouteMissing(e) {
  return /\b404\b|\b405\b|non-json/i.test(String(e && e.message || e || ""));
}
function skillsApi(op, extra) {
  const init = {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(Object.assign({ op }, extra || {}))
  };
  return apiJson("/dsh-purge/skills", init).catch((e) => {
    if (!skillsRouteMissing(e)) throw e;
    return apiJson("/dsh-purge/skill", init);
  });
}
var TARGETS = ["AGENTS.md", "CLAUDE.md"];
var PATCH_GROUPS = [
  { key: "prompt", ids: [1, 2, 3, 4, 5, 25, 26, 27, 28, 32] },
  { key: "code", ids: [6, 7, 8] },
  { key: "engine", ids: [9, 10, 11, 12, 13, 14, 15, 16, 35] },
  { key: "tools", ids: [17, 18, 19, 20, 21, 22, 23, 24, 29, 30, 31, 33, 34, 36, 37] },
  { key: "compat", ids: [38, 39, 40] }
];

// client-src/styles.js
var THEME_KEY = "dshp-theme";
var THEME_MODE_KEY = "dshp-theme-mode";
var PURGE_CSS = `
.dshp-root{--dshp-display:"Songti SC","Noto Serif SC","Iowan Old Style",Palatino,"Palatino Linotype",Georgia,serif;--dshp-sans:"Yu Gothic UI","Hiragino Sans GB","Source Han Sans SC",system-ui,sans-serif;--dshp-mono:"Cascadia Mono","Sarasa Mono SC",ui-monospace,monospace;--dshp-ease:cubic-bezier(.16,1,.3,1);max-width:920px;display:flex;flex-direction:column;gap:18px;padding:16px;border-radius:12px;background:var(--dshp-bg);color:var(--dshp-ink);font-family:var(--dshp-sans)}
.dshp-root[data-theme="white"]{--dshp-bg:#ffffff;--dshp-paper:#f7f6f3;--dshp-ink:#4a4742;--dshp-mute:#9a958c;--dshp-line:#eceae4;--dshp-fill:#f3f1ec;--dshp-accent:#7d9a86;--dshp-accent-soft:#e7efe9;--dshp-ok:#5d8a6c;--dshp-warn:#a8844a;--dshp-bad:#c48989;color-scheme:light}
.dshp-root[data-theme="dusk"]{--dshp-bg:#2a2926;--dshp-paper:#32312d;--dshp-ink:#e6e2db;--dshp-mute:#a8a39a;--dshp-line:#3f3d38;--dshp-fill:#353430;--dshp-accent:#9bb5a6;--dshp-accent-soft:#3a433d;--dshp-ok:#8fbf9c;--dshp-warn:#d4b07a;--dshp-bad:#d4a0a0;color-scheme:dark}
.dshp-toolbar{display:flex;align-items:center;justify-content:flex-end;gap:8px}
.dshp-switch{display:inline-flex;border:1px solid var(--dshp-line);border-radius:999px;overflow:hidden;background:var(--dshp-paper)}
.dshp-switch button{appearance:none;border:0;background:transparent;color:var(--dshp-mute);font:12px/1 var(--dshp-sans);padding:6px 14px;cursor:pointer}
.dshp-switch button.is-on{background:var(--dshp-accent-soft);color:var(--dshp-ink)}
.dshp-switch button:focus-visible{outline:2px solid var(--dshp-accent);outline-offset:-2px}
.dshp-panel{border:1px solid var(--dshp-line);background:var(--dshp-paper);border-radius:10px;padding:18px 18px 16px}
.dshp-kicker{font-family:var(--dshp-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--dshp-mute);margin:0 0 4px}
.dshp-title{font-family:var(--dshp-display);font-size:20px;font-weight:500;letter-spacing:.02em;line-height:1.3;margin:0;color:var(--dshp-ink)}
.dshp-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;flex-wrap:wrap}
.dshp-sub{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:20px 0 10px}
.dshp-sub h4{margin:0;font-family:var(--dshp-display);font-size:15px;font-weight:500}
.dshp-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:14px}
.dshp-metric{border:1px solid var(--dshp-line);background:var(--dshp-bg);padding:12px;min-height:68px;display:flex;flex-direction:column;gap:4px;border-radius:8px}
.dshp-metric b{font-family:var(--dshp-display);font-size:18px;font-weight:500;line-height:1.2}
.dshp-metric span{font-size:11px;color:var(--dshp-mute)}
.dshp-bar{height:3px;border-radius:99px;background:var(--dshp-line);overflow:hidden;margin:8px 0 14px}
.dshp-bar>i{display:block;height:100%;background:var(--dshp-accent);width:0;transition:width .4s var(--dshp-ease)}
.dshp-group{border:1px solid var(--dshp-line);margin:0 0 8px;background:var(--dshp-bg);border-radius:8px;overflow:hidden}
.dshp-group-h{width:100%;display:flex;align-items:center;gap:10px;padding:9px 12px;border:0;background:transparent;color:inherit;cursor:pointer;font:inherit;text-align:left}
.dshp-group-h:hover{background:var(--dshp-fill)}
.dshp-group-h:focus-visible{outline:2px solid var(--dshp-accent);outline-offset:-2px}
.dshp-group-h strong{font-family:var(--dshp-display);font-size:14px;font-weight:500}
.dshp-group-h em{font-style:normal;font-size:12px;color:var(--dshp-mute);flex:1}
.dshp-count{font-family:var(--dshp-mono);font-size:12px;color:var(--dshp-mute)}
.dshp-table{width:100%;border-collapse:collapse;font-size:12.5px}
.dshp-table th{text-align:left;font-weight:500;font-size:11px;letter-spacing:.06em;color:var(--dshp-mute);padding:7px 12px;border-bottom:1px solid var(--dshp-line)}
.dshp-table td{padding:8px 12px;border-bottom:1px solid var(--dshp-line);vertical-align:middle}
.dshp-table tr:last-child td{border-bottom:0}
.dshp-table tr.is-on td{background:var(--dshp-accent-soft)}
.dshp-id{font-family:var(--dshp-mono);opacity:.75;width:42px}
.dshp-actions{text-align:right;white-space:nowrap}
.dshp-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dshp-row+.dshp-row{margin-top:10px}
.dshp-pill{display:inline-flex;align-items:center;gap:6px;font-family:var(--dshp-mono);font-size:11px;padding:2px 8px;border:1px solid var(--dshp-line);border-radius:99px;line-height:1.6;background:var(--dshp-bg)}
.dshp-pill::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}
.dshp-pill.is-ok{color:var(--dshp-ok);border-color:color-mix(in srgb,var(--dshp-ok) 30%,var(--dshp-line))}
.dshp-pill.is-wait{color:var(--dshp-warn);border-color:color-mix(in srgb,var(--dshp-warn) 30%,var(--dshp-line))}
.dshp-pill.is-miss{color:var(--dshp-mute)}
.dshp-pill.is-bad{color:var(--dshp-bad)}
.dshp-btn{appearance:none;font-family:var(--dshp-sans);font-size:13px;font-weight:500;min-height:34px;padding:0 14px;border-radius:8px;border:1px solid transparent;cursor:pointer;transition:background .15s var(--dshp-ease),opacity .15s var(--dshp-ease)}
.dshp-btn:disabled{opacity:.45;cursor:not-allowed}
.dshp-btn:focus-visible{outline:2px solid var(--dshp-accent);outline-offset:2px}
.dshp-btn-primary{background:var(--dshp-accent-soft);color:var(--dshp-ink);border-color:color-mix(in srgb,var(--dshp-accent) 35%,var(--dshp-line))}
.dshp-btn-primary:hover:not(:disabled){background:color-mix(in srgb,var(--dshp-accent) 22%,var(--dshp-bg))}
.dshp-btn-ghost{background:transparent;color:var(--dshp-ink);border-color:var(--dshp-line)}
.dshp-btn-danger{background:transparent;color:var(--dshp-bad);border-color:color-mix(in srgb,var(--dshp-bad) 40%,var(--dshp-line))}
.dshp-btn-solid-danger{background:color-mix(in srgb,var(--dshp-bad) 16%,var(--dshp-bg));color:var(--dshp-bad);border-color:color-mix(in srgb,var(--dshp-bad) 30%,var(--dshp-line))}
.dshp-btn-tiny{min-height:28px;padding:0 10px;font-size:12px}
.dshp-field,.dshp-area{width:100%;box-sizing:border-box;font:13px/1.55 var(--dshp-mono);padding:8px 10px;background:var(--dshp-bg);color:var(--dshp-ink);border:1px solid var(--dshp-line);border-radius:8px}
.dshp-field{width:auto;min-width:140px}
.dshp-cr-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:8px 0 0;font-size:13px}
.dshp-cr-row label{display:inline-flex;align-items:center;gap:6px;color:var(--dshp-ink)}
.dshp-cr-num{width:64px;min-width:64px;height:28px;padding:0 8px}
.dshp-cr-text{width:120px;min-width:88px;height:28px;padding:0 8px}
.dshp-ver{width:100%;min-width:0;max-width:none;height:32px;padding:0 10px;font-size:12px}
.dshp-rel{margin:0 0 14px}
.dshp-now{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin:0 0 4px}
.dshp-now-label{font-family:var(--dshp-mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--dshp-mute)}
.dshp-now-ver{font-family:var(--dshp-display);font-size:20px;font-weight:500;letter-spacing:.01em}
.dshp-now-mark{display:inline-flex;align-items:center;margin-left:6px;padding:1px 7px;border-radius:99px;font-family:var(--dshp-mono);font-size:11px;font-style:normal;font-weight:500;line-height:1.5;color:var(--dshp-ok);border:1px solid color-mix(in srgb,var(--dshp-ok) 38%,var(--dshp-line));background:color-mix(in srgb,var(--dshp-ok) 14%,var(--dshp-bg))}
.dshp-editions{display:flex;flex-direction:column;margin:10px 0 0;border-top:1px solid var(--dshp-line)}
.dshp-edition{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--dshp-line)}
.dshp-edition-name{display:inline-flex;align-items:center;gap:0;font-family:var(--dshp-display);font-size:15px;font-weight:500;white-space:nowrap}
.dshp-edition.is-on .dshp-edition-name{color:var(--dshp-ink)}
.dshp-edition:not(.is-on) .dshp-edition-name{color:var(--dshp-mute)}
.dshp-edition .dshp-btn{min-width:118px}
.dshp-rel .dshp-notice{display:block;margin-top:8px;min-height:16px}
@media (max-width:560px){.dshp-edition{grid-template-columns:1fr auto;grid-template-areas:"name btn" "sel sel"}.dshp-edition-name{grid-area:name}.dshp-edition .dshp-ver{grid-area:sel}.dshp-edition .dshp-btn{grid-area:btn}}
.dshp-area{min-height:220px;resize:vertical}
.dshp-field:focus,.dshp-area:focus{outline:none;border-color:var(--dshp-accent);box-shadow:0 0 0 3px var(--dshp-accent-soft)}
.dshp-field:disabled,.dshp-area:disabled{opacity:.5}
.dshp-ask{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:10px;padding:10px 12px;border:1px solid var(--dshp-line);border-radius:8px;background:var(--dshp-bg);font-size:13px}
.dshp-modal-bg{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;padding:20px;background:color-mix(in srgb,var(--dshp-ink) 28%,transparent)}
.dshp-modal{width:min(420px,100%);background:var(--dshp-paper);color:var(--dshp-ink);border:1px solid var(--dshp-line);border-radius:12px;padding:20px 20px 16px;box-shadow:0 16px 40px color-mix(in srgb,var(--dshp-ink) 18%,transparent)}
.dshp-modal h4{margin:0 0 8px;font-family:var(--dshp-display);font-size:18px;font-weight:500}
.dshp-modal p{margin:0 0 16px;font-size:13.5px;line-height:1.55}
.dshp-modal-ops{display:flex;justify-content:flex-end;gap:8px}
.dshp-notice{font-size:12.5px;line-height:1.4}
.dshp-notice.is-ok{color:var(--dshp-ok)}
.dshp-notice.is-bad{color:var(--dshp-bad)}
.dshp-skel{height:12px;border-radius:6px;background:linear-gradient(90deg,var(--dshp-fill),var(--dshp-line),var(--dshp-fill));background-size:200% 100%;animation:dshp-pulse 1.2s ease-in-out infinite}
.dshp-active{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 12px;margin-bottom:12px;border:1px solid var(--dshp-line);background:var(--dshp-bg);border-radius:8px}
.dshp-active b{font-family:var(--dshp-display);font-weight:500}
.dshp-empty{padding:28px 12px;font-size:13px;color:var(--dshp-mute);text-align:center}
.dshp-split{display:flex;flex-direction:column;gap:12px}
.dshp-rulelist{display:flex;flex-direction:column;border:1px solid var(--dshp-line);border-radius:8px;background:var(--dshp-bg);overflow:hidden}
.dshp-rulebody{max-height:240px;overflow:auto}
.dshp-ruleitem{display:flex;align-items:center;gap:12px;width:100%;padding:10px 12px;border:0;border-bottom:1px solid var(--dshp-line);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.dshp-ruleitem:hover{background:var(--dshp-fill)}
.dshp-ruleitem.is-edit{background:var(--dshp-accent-soft)}
.dshp-rule-main{flex:1;min-width:0}
.dshp-rule-name{display:flex;align-items:center;gap:8px;font-family:var(--dshp-display);font-size:14px;line-height:1.35}
.dshp-rule-meta{display:block;margin-top:3px;font-family:var(--dshp-mono);font-size:11px;color:var(--dshp-mute)}
.dshp-rule-ops{display:flex;flex-direction:row;align-items:center;gap:6px;flex-shrink:0}
.dshp-create{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border-top:1px solid var(--dshp-line);background:var(--dshp-paper)}
.dshp-create-row{display:flex;gap:6px;align-items:center}
.dshp-create .dshp-field{flex:1;min-width:0;width:auto}
.dshp-editor{display:flex;flex-direction:column;gap:10px;min-width:0;border:1px solid var(--dshp-line);border-radius:8px;background:var(--dshp-bg);padding:12px;min-height:320px}
.dshp-editor .dshp-area{flex:1;min-height:240px}
.dshp-editor-empty{flex:1;display:flex;align-items:center;justify-content:center;color:var(--dshp-mute);font-size:13px;min-height:160px}
@keyframes dshp-pulse{0%{background-position:200% 0}100%{background-position:-200% 0}}
@media (max-width:640px){.dshp-metrics{grid-template-columns:1fr}.dshp-ruleitem{flex-wrap:wrap}.dshp-rule-ops{width:100%;justify-content:flex-end}}
@media (prefers-reduced-motion:reduce){.dshp-btn,.dshp-bar>i{transition:none}.dshp-skel{animation:none}}
`;

// client-src/widgets.js
function formatSize(bytes) {
  if (typeof bytes !== "number" || !isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes < 1024) return bytes + " B";
  const kb = bytes / 1024;
  return (kb >= 100 ? Math.round(kb) : kb.toFixed(1)) + " KB";
}
function statusKind(st) {
  if (st === "applied" || st === "already") return "ok";
  if (st === "pending") return "wait";
  if (st === "missing_file" || st === "skipped") return "miss";
  return "bad";
}
function statusLabel(st, t) {
  if (st === "applied" || st === "already") return t("status.applied");
  if (st === "pending") return t("status.pending");
  if (st === "skipped") return t("status.skipped");
  if (st === "missing_file") return t("skip");
  return st || t("unknown");
}
function statusSettled(st) {
  return st === "applied" || st === "already" || st === "skipped" || st === "missing_file";
}
function shimKind(v) {
  if (v === "patched") return "ok";
  if (v === "original") return "wait";
  if (v === "missing" || v === "n/a" || !v) return "miss";
  return "bad";
}
function noticeNode(notice) {
  if (!notice || notice.kind === "idle" || !notice.text) return null;
  return h("span", { className: "dshp-notice " + (notice.kind === "error" ? "is-bad" : "is-ok") }, notice.text);
}
function Btn(props) {
  const { kind, tiny, children, className, type, ...rest } = props;
  const cls = ["dshp-btn", kind ? "dshp-btn-" + kind : "dshp-btn-ghost", tiny ? "dshp-btn-tiny" : "", className || ""].filter(Boolean).join(" ");
  return h("button", Object.assign({ type: type || "button", className: cls }, rest), children);
}
function Pill({ value, label }) {
  const t = useT();
  return h("span", { className: "dshp-pill is-" + statusKind(value) }, label || statusLabel(value, t));
}
function PatchGroups({ state }) {
  const t = useT();
  const [open, setOpen] = useState({});
  if (!state || !state.patch_status) return h("div", { className: "dshp-skel", style: { height: 120 } });
  return PATCH_GROUPS.map((group) => {
    const rows = group.ids.map((id) => {
      const st = state.patch_status[id] || state.patch_status[String(id)] || "missing_file";
      return { id, st, label: t("patch." + id) };
    });
    const done = rows.filter((r) => statusSettled(r.st)).length;
    const expanded = !!open[group.key];
    return h(
      "div",
      { key: group.key, className: "dshp-group" },
      h(
        "button",
        {
          type: "button",
          className: "dshp-group-h",
          "aria-expanded": expanded ? "true" : "false",
          onClick: () => setOpen((prev) => Object.assign({}, prev, { [group.key]: !prev[group.key] }))
        },
        h("strong", null, t("group." + group.key)),
        h("span", { className: "dshp-count" }, done + "/" + rows.length)
      ),
      expanded ? h(
        "table",
        { className: "dshp-table" },
        h(
          "thead",
          null,
          h("tr", null, h("th", null, "#"), h("th", null, t("table.patch")), h("th", null, t("table.status")))
        ),
        h(
          "tbody",
          null,
          rows.map(
            (r) => h(
              "tr",
              { key: r.id },
              h("td", { className: "dshp-id" }, "#" + r.id),
              h("td", null, r.label),
              h("td", null, h(Pill, { value: r.st }))
            )
          )
        )
      ) : null
    );
  });
}

// client-src/versions.js
function skillUiAllowed(d) {
  if (!d) return false;
  const ver = String(d.plugin_version || d.localVersion || "").replace(/^v/i, "");
  if (/^1\.1\.11(?:-|$)/.test(ver)) return false;
  const parts = ver.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!parts) return false;
  if (+parts[1] !== 1) return +parts[1] > 1;
  if (+parts[2] !== 1) return +parts[2] > 1;
  return +parts[3] >= 12;
}
function splitListedVersion(raw) {
  const text = String(raw || "").trim().replace(/^v/i, "");
  const cut = text.split("-");
  const core = String(cut[0] || "").split(".").map((n) => parseInt(n, 10) || 0);
  return { core: [core[0] || 0, core[1] || 0, core[2] || 0], pre: cut.slice(1).join("-") };
}
function listedVersionNewer(remote, local) {
  if (!remote || !local || String(remote) === String(local)) return false;
  const a = splitListedVersion(remote);
  const b = splitListedVersion(local);
  for (let i = 0; i < 3; i += 1) {
    if (a.core[i] !== b.core[i]) return a.core[i] > b.core[i];
  }
  if (a.pre && !b.pre) return false;
  if (!a.pre && b.pre) return true;
  return a.pre > b.pre;
}
function listedCeiling(versions, localVer) {
  let best = "";
  const rows = (versions || []).slice();
  const local = String(localVer || "").replace(/^v/i, "");
  if (local && !/(?:^|[-._])(beta|rc|pre|preview|test)(?:\d|$|[-._])/i.test(local)) {
    rows.push({ channel: "stable", version: local });
  }
  for (const item of rows) {
    if (!item || item.channel === "beta") continue;
    const ver = String(item.version || "").replace(/^v/i, "");
    if (!/^\d+\.\d+\.\d+/.test(ver) || /(?:^|[-._])(beta|rc|pre|preview|test)(?:\d|$|[-._])/i.test(ver)) continue;
    if (!best || listedVersionNewer(ver, best)) best = ver;
  }
  return best;
}
function keepListedVersion(item, ceiling) {
  const ver = String(item && (item.version || item.ref) || "").replace(/^v/i, "");
  if (/^1\.1\.11-beta/i.test(ver)) return false;
  if (item && item.channel === "beta" && ceiling && !listedVersionNewer(ver, ceiling)) return false;
  return true;
}
function preferListed(list, localVer) {
  const ver = String(localVer || "").replace(/^v/i, "");
  return (list || []).find((item) => item.current) || (list || []).find((item) => ver && String(item.version || "").replace(/^v/i, "") === ver) || (list || []).find((item) => item.latest) || (list || [])[0] || null;
}
function versionChoiceLabel(item, tr) {
  const ver = String(item && item.version || "").replace(/^v/i, "");
  const base = ver ? "v" + ver : item && (item.label || item.ref) || "\u2014";
  if (item && item.current) return base + " \xB7 " + tr("update.current");
  if (item && item.latest) return base + " \xB7 " + tr("update.tip");
  return base;
}

// client-src/purge-settings.js
function PurgifySection() {
  const t = useT();
  const tRef = useRef(t);
  tRef.current = t;
  const [state, setState] = useState(null);
  const [override, setOverride] = useState("");
  const [defaultOverride, setDefaultOverride] = useState("");
  const [overrideLoaded, setOverrideLoaded] = useState(false);
  const [patchBusy, setPatchBusy] = useState(false);
  const [updateBusy, setUpdateBusy] = useState(false);
  const [canApplyUpdate, setCanApplyUpdate] = useState(false);
  const [updateJob, setUpdateJob] = useState(null);
  const [askRestart, setAskRestart] = useState(false);
  const [askUninstall, setAskUninstall] = useState(false);
  const [uninstallBusy, setUninstallBusy] = useState(false);
  const [notice, setNotice] = useState({ kind: "idle", text: "" });
  const [updateNotice, setUpdateNotice] = useState({ kind: "idle", text: "" });
  const [updateInfo, setUpdateInfo] = useState(null);
  const [channel, setChannel] = useState("stable");
  const [pick, setPick] = useState({ stable: "", beta: "" });
  const actionTicket = useRef(0);
  const syncPicks = (d) => {
    const versions2 = d && d.versions || [];
    const ceiling = listedCeiling(versions2, d && d.localVersion);
    const next = { stable: "", beta: "" };
    for (const id of ["stable", "beta"]) {
      const list = versions2.filter((item) => item.channel === id && keepListedVersion(item, ceiling));
      const hit = preferListed(list, d && d.localVersion);
      next[id] = hit && hit.ref || "";
    }
    setPick(next);
  };
  const updateErrorText = (tr, e) => {
    const msg = String(e && e.message || e || "");
    if (msg === "timeout" || /aborted|abort|超时/i.test(msg)) return tr("update.timeout");
    if (/\b404\b/.test(msg) || /non-json/.test(msg)) return tr("update.needRestart");
    return tr("update.fail", { error: msg });
  };
  const applyUpdateInfo = useCallback((d, tr, kind) => {
    if (d.channel) setChannel(d.channel);
    setUpdateInfo((prev) => {
      const versions2 = d.versions && d.versions.length ? d.versions : prev && prev.versions || [];
      return Object.assign({}, prev || {}, d, { versions: versions2 });
    });
    if (d.versions && d.versions.length) syncPicks(d);
    if (kind === "check") setCanApplyUpdate(Boolean(d.hasUpdate) && !d.error);
    else if (kind === "done" || kind === "switched" || kind === "channel") setCanApplyUpdate(false);
    const version = d.localVersion || d.localSha || "\u2014";
    const remote = d.remoteVersion || d.remoteSha || "\u2014";
    let text = tr("update.latest", { version });
    if (d.hasUpdate) text = tr("update.available", { remote, local: version });
    if (d.pinned && d.hasUpdate) text = tr("update.pinned", { version, remote });
    if (kind === "switched" || kind === "channel")
      text = tr("update.switched", { version: d.localVersion || d.remoteVersion || "\u2014" });
    if (kind === "done") text = tr("update.done", { version: d.localVersion || d.remoteVersion || "\u2014" });
    if (d.error) text = d.error;
    setUpdateNotice({ kind: d.ok === false || d.error ? "error" : "ok", text });
  }, []);
  const checkUpdate = useCallback(
    (id) => {
      setUpdateBusy(true);
      setUpdateJob({ id: id || "", kind: "check" });
      const tr = tRef.current;
      setUpdateNotice({ kind: "ok", text: tr("update.checking") });
      apiJson("/dsh-purge/update").then((d) => {
        if (!d || !d.ok && !d.channel) throw new Error(d && d.error || "check failed");
        applyUpdateInfo(d, tr, "check");
      }).catch((e) => setUpdateNotice({ kind: "error", text: updateErrorText(tr, e) })).finally(() => {
        setUpdateBusy(false);
        setUpdateJob(null);
      });
    },
    [applyUpdateInfo]
  );
  const postUpdate = useCallback(
    (body, kind, id) => {
      setUpdateBusy(true);
      setUpdateJob({ id: id || "", kind });
      const tr = tRef.current;
      setUpdateNotice({
        kind: "ok",
        text: kind === "switched" || kind === "channel" ? tr("update.switching") : tr("update.applying")
      });
      return apiJson("/dsh-purge/update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body || {})
      }).then((d) => {
        if (!d || d.ok === false && d.error) throw new Error(d && d.error || "update failed");
        applyUpdateInfo(d, tr, kind);
        if (d.applied && d.reloadClient !== false) {
          setUpdateNotice({ kind: "ok", text: tr("update.reloading") });
          setTimeout(() => {
            try {
              window.location.reload();
            } catch {
            }
          }, 280);
        } else if (d.needRestart) {
          setAskRestart(true);
        }
        return d;
      }).catch((e) => {
        setUpdateNotice({ kind: "error", text: updateErrorText(tr, e) });
        throw e;
      }).finally(() => {
        setUpdateBusy(false);
        setUpdateJob(null);
      });
    },
    [applyUpdateInfo]
  );
  const doUpdate = useCallback(
    (id) => {
      const lane = id === "beta" ? "beta" : "stable";
      postUpdate({ op: "apply", ref: "v1.1.15-seanz.1", channel: lane }, "done", id).catch(() => {
      });
    },
    [postUpdate]
  );
  const changeChannel = useCallback(
    (next) => {
      if (!next) return;
      const tr = tRef.current;
      if (!window.confirm(tr("update.confirmChannel", { version: tr("channel." + next) }))) return;
      const prevChannel = channel;
      const prevInfo = updateInfo;
      setChannel(next);
      setUpdateInfo((cur) => Object.assign({}, cur || {}, { channel: next }));
      postUpdate({ op: "channel", channel: next }, "channel", next).catch(() => {
        setChannel(prevChannel);
        setUpdateInfo(prevInfo);
      });
    },
    [channel, postUpdate, updateInfo]
  );
  const switchSelected = useCallback(
    (id) => {
      const tr = tRef.current;
      const ref = pick[id];
      const versions2 = (updateInfo && updateInfo.versions || []).filter((item) => item.channel === id);
      const hit = versions2.find((item) => item.ref === ref);
      const label = hit && (hit.label || hit.version) || ref;
      if (!ref) return;
      if (!window.confirm(tr("update.confirmSwitch", { version: label }))) return;
      const prevChannel = channel;
      const prevInfo = updateInfo;
      if (hit && hit.channel) {
        setChannel(hit.channel);
        setUpdateInfo((cur) => Object.assign({}, cur || {}, { channel: hit.channel }));
      }
      postUpdate({ op: "switch", ref }, "switched", id).catch(() => {
        setChannel(prevChannel);
        setUpdateInfo(prevInfo);
      });
    },
    [channel, pick, postUpdate, updateInfo]
  );
  const loadAll = useCallback(() => {
    const tr = tRef.current;
    apiJson("/dsh-purge/status").then((d) => {
      if (d && d.ok) {
        setState(d);
        if (d.channel) setChannel(d.channel);
        if (d.update && d.update.ok && !d.update.error) setUpdateInfo(d.update);
      } else {
        setState({
          ok: false,
          patches_total: 0,
          patches_applied: 0,
          patch_status: {},
          shim_cmd: "n/a",
          shim_ps1: "n/a",
          shim_bin: "n/a",
          has_backup: false
        });
        setNotice({ kind: "error", text: tr("err.status", { error: d && d.error || "bad response" }) });
      }
    }).catch((e) => {
      setState({
        ok: false,
        patches_total: 0,
        patches_applied: 0,
        patch_status: {},
        shim_cmd: "n/a",
        shim_ps1: "n/a",
        shim_bin: "n/a",
        has_backup: false
      });
      setNotice({ kind: "error", text: tr("err.status", { error: e.message }) });
    });
    apiJson("/dsh-purge/update").then((d) => {
      if (!d) return;
      if (d.channel) setChannel(d.channel);
      setUpdateInfo(d);
      syncPicks(d);
    }).catch(() => {
    });
    apiJson("/dsh-purge/override").then((d) => {
      if (d && d.ok) {
        const packed = typeof d.defaultContent === "string" ? d.defaultContent : "";
        if (packed) setDefaultOverride(packed);
        setOverride(typeof d.content === "string" ? d.content : packed);
        setOverrideLoaded(true);
      } else setNotice({ kind: "error", text: tr("err.override", { error: d && d.error || "" }) });
    }).catch((e) => setNotice({ kind: "error", text: tr("err.override", { error: e.message }) }));
  }, []);
  useEffect(() => {
    loadAll();
  }, [loadAll]);
  const rejectNeedPrompt = useCallback((tr) => {
    setAskRestart(false);
    setNotice({ kind: "error", text: tr("need.prompt") });
    setTimeout(() => window.alert(tr("need.prompt")), 0);
  }, []);
  const doAction = useCallback(
    (action, actionKey) => {
      const tr = tRef.current;
      const label = tr(actionKey);
      const ticket = ++actionTicket.current;
      const run = () => {
        setPatchBusy(true);
        setAskRestart(false);
        setNotice({ kind: "idle", text: "" });
        fetch("/dsh-purge/" + action, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(action === "apply" ? { content: override } : {})
        }).then((r) => r.json()).then((d) => {
          if (ticket !== actionTicket.current) return;
          const applyEmptyBlocked = action === "apply" && promptBoxEmpty(override) && (!d || d.injectSource !== "rule");
          if (responseNeedsPrompt(d) || applyEmptyBlocked) {
            rejectNeedPrompt(tr);
            return;
          }
          if (!d.ok) {
            setNotice({ kind: "error", text: tr("err.action", { action: label, error: d.error || "" }) });
            return;
          }
          if (action === "apply") {
            if (typeof d.defaultContent === "string") setDefaultOverride(d.defaultContent);
            if (typeof d.override_content === "string") {
              setOverride(d.override_content);
              setOverrideLoaded(true);
            }
          }
          if (action === "apply" && d.complete === false) {
            const parts = [];
            if (d.failed > 0) {
              const ids = (d.failed_items || []).map((x) => x.id).filter((id) => id != null).join(",");
              parts.push(
                tr("restart.incomplete.patches", {
                  failed: String(d.failed || 0),
                  ids: ids || "?"
                })
              );
            }
            if (d.cmd_flash && d.cmd_flash.ok === false) {
              parts.push(
                tr("restart.incomplete.flash", {
                  entry: String(d.cmd_flash.entry || "fail")
                })
              );
            }
            if (parts.length === 0) parts.push(tr("restart.incomplete.flash", { entry: "unknown" }));
            setNotice({
              kind: "error",
              text: tr("restart.incomplete", { detail: parts.join("\uFF1B") })
            });
            loadAll();
            return;
          }
          setNotice({ kind: "ok", text: tr("ok.done") });
          loadAll();
          if (action === "apply") setAskRestart(true);
        }).catch((e) => {
          if (ticket !== actionTicket.current) return;
          setNotice({ kind: "error", text: tr("err.action", { action: label, error: e.message }) });
        }).finally(() => {
          if (ticket === actionTicket.current) setPatchBusy(false);
        });
      };
      if (action !== "apply") {
        run();
        return;
      }
      bothInjectEmpty(override).then((empty) => {
        if (ticket !== actionTicket.current) return;
        if (empty) {
          rejectNeedPrompt(tr);
          return;
        }
        run();
      });
    },
    [loadAll, override, rejectNeedPrompt]
  );
  const saveOverride = useCallback(() => {
    const tr = t;
    const ticket = ++actionTicket.current;
    const go = () => {
      setPatchBusy(true);
      setAskRestart(false);
      setNotice({ kind: "idle", text: "" });
      fetch("/dsh-purge/override", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: override })
      }).then((r) => r.json()).then((d) => {
        if (ticket !== actionTicket.current) return;
        if (!d.ok || responseNeedsPrompt(d) || promptBoxEmpty(override) && d.injectSource !== "rule") {
          rejectNeedPrompt(tr);
          return;
        }
        if (typeof d.content === "string") setOverride(d.content);
        setNotice({ kind: "ok", text: t("saved.override") });
      }).catch((e) => {
        if (ticket !== actionTicket.current) return;
        setNotice({ kind: "error", text: t("err.save", { error: e.message }) });
      }).finally(() => {
        if (ticket === actionTicket.current) setPatchBusy(false);
      });
    };
    bothInjectEmpty(override).then((empty) => {
      if (ticket !== actionTicket.current) return;
      if (empty) {
        rejectNeedPrompt(tr);
        return;
      }
      go();
    });
  }, [override, t, rejectNeedPrompt]);
  const restoreOverride = useCallback(() => {
    if (!defaultOverride) return;
    setOverride(defaultOverride);
    setNotice({ kind: "ok", text: t("saved.restoreInject") });
  }, [defaultOverride, t]);
  const waitHostAfterUninstall = useCallback((tr) => {
    const started = Date.now();
    const ping = () => {
      fetch("/", { cache: "no-store", credentials: "same-origin" }).then((r) => {
        if (r.ok) {
          try {
            window.localStorage.removeItem("dshp-theme");
            window.localStorage.removeItem("dshp-theme-mode");
          } catch {
          }
          window.location.reload();
          return;
        }
        retry();
      }).catch(retry);
    };
    const retry = () => {
      if (Date.now() - started > 9e4) {
        setNotice({ kind: "error", text: tr("restart.timeout") });
        setUninstallBusy(false);
        return;
      }
      setTimeout(ping, 500);
    };
    setTimeout(ping, 800);
  }, []);
  const doUninstall = useCallback(() => {
    setUninstallBusy(true);
    setAskUninstall(false);
    setAskRestart(false);
    const tr = tRef.current;
    setNotice({ kind: "ok", text: tr("uninstall.applying") });
    apiJson("/dsh-purge/uninstall", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }).then((d) => {
      if (!d || !d.ok) throw new Error(d && d.error || "uninstall failed");
      setNotice({
        kind: "ok",
        text: d && d.note || hostText(tr, "uninstall.done", d.surface || hostSurfaceOf(state))
      });
      if ((d && d.surface) === "desktop" || d && d.fullApp || hostSurfaceOf(state) === "desktop") return;
      waitHostAfterUninstall(tr);
    }).catch((e) => {
      const msg = String(e && e.message || e || "");
      if (/failed to fetch|networkerror|load failed/i.test(msg)) {
        setNotice({ kind: "ok", text: hostText(tr, "uninstall.done", hostSurfaceOf(state)) });
        if (hostSurfaceOf(state) === "desktop" || clientGuessSurface() === "desktop") return;
        waitHostAfterUninstall(tr);
        return;
      }
      setNotice({ kind: "error", text: tr("uninstall.fail", { error: msg }) });
      setUninstallBusy(false);
    });
  }, [state, waitHostAfterUninstall]);
  const s = state;
  const total = s && s.patches_total ? s.patches_total : 26;
  const applied = s && typeof s.patches_applied === "number" ? s.patches_applied : 0;
  const skipped = s && typeof s.patches_skipped === "number" ? s.patches_skipped : 0;
  const settled = Math.min(total, applied + skipped);
  const pct = total ? Math.round(settled / total * 100) : 0;
  const hostSurface = hostSurfaceOf(s);
  const versions = updateInfo && updateInfo.versions || [];
  const channelNow = updateInfo && updateInfo.channel || channel || "stable";
  const localVer = s && s.plugin_version || updateInfo && updateInfo.localVersion || "";
  const renderEdition = (id) => {
    const lane = updateInfo && updateInfo.lanes && updateInfo.lanes[id] || {};
    const ceiling = listedCeiling(versions, localVer || updateInfo && updateInfo.localVersion);
    const list = versions.filter((item) => item.channel === id && keepListedVersion(item, ceiling));
    const selectedRef = pick[id] || "";
    const hit = list.find((item) => item.ref === selectedRef) || preferListed(list, localVer);
    const onLane = channelNow === id;
    const noBeta = id === "beta" && Array.isArray(updateInfo && updateInfo.versions) && !list.length;
    const pickedOther = Boolean(hit && selectedRef && !hit.current);
    const thisJob = updateJob && updateJob.id === id ? updateJob : null;
    let actionLabel = t("btn.checkUpdate");
    let actionKind;
    let actionClick = () => checkUpdate(id);
    let actionDisabled = updateBusy || Boolean(noBeta);
    if (noBeta) {
      actionLabel = t("update.noBeta");
      actionClick = () => {
      };
    } else if (pickedOther) {
      actionLabel = t("update.switch");
      actionKind = "primary";
      actionClick = () => switchSelected(id);
    } else if (!onLane) {
      actionLabel = id === "beta" ? t("channel.useBeta") : t("channel.useStable");
      actionKind = "primary";
      actionClick = () => changeChannel(id);
    } else if (canApplyUpdate && lane.hasUpdate) {
      actionLabel = t("btn.doUpdate");
      actionKind = "primary";
      actionClick = () => doUpdate(id);
    }
    if (thisJob) {
      if (thisJob.kind === "check") actionLabel = t("btn.checkUpdate.busy");
      else if (thisJob.kind === "done") actionLabel = t("btn.doUpdate.busy");
      else actionLabel = t("update.switching");
    }
    return h(
      "div",
      {
        className: "dshp-edition" + (onLane ? " is-on" : ""),
        "aria-label": t("channel." + id)
      },
      h(
        "span",
        { className: "dshp-edition-name" },
        t("channel." + id),
        onLane ? h("em", { className: "dshp-now-mark" }, t("update.current")) : null
      ),
      h(
        "select",
        {
          className: "dshp-field dshp-ver",
          value: list.length ? hit && hit.ref || "" : "",
          disabled: updateBusy || !list.length,
          onChange: (e) => setPick((prev) => Object.assign({}, prev, { [id]: e.target.value })),
          "aria-label": t("update.pick")
        },
        list.length ? list.map(
          (item) => h(
            "option",
            {
              key: item.ref + (item.sha || ""),
              value: item.ref
            },
            versionChoiceLabel(item, t)
          )
        ) : h("option", { value: "" }, noBeta ? t("update.noBeta") : t("update.pick"))
      ),
      h(Btn, { tiny: true, kind: actionKind, disabled: actionDisabled, onClick: actionClick }, actionLabel)
    );
  };
  return h(
    "section",
    { className: "dshp-panel", "aria-label": t("purge.title") },
    h(
      "div",
      { className: "dshp-head" },
      h("h3", { className: "dshp-title" }, t("purge.title")),
      h("span", { className: "dshp-pill" }, t("surface." + hostSurface))
    ),
    h(
      "div",
      { className: "dshp-rel" },
      h(
        "div",
        { className: "dshp-now" },
        h("span", { className: "dshp-now-label" }, t("channel.local")),
        h("b", { className: "dshp-now-ver" }, localVer ? "v" + localVer : "\u2014"),
        h("em", { className: "dshp-now-mark" }, t("update.current"))
      ),
      h("div", { className: "dshp-editions" }, renderEdition("stable"), renderEdition("beta")),
      noticeNode(updateNotice)
    ),
    s ? h(
      "div",
      { className: "dshp-metrics" },
      h(
        "div",
        { className: "dshp-metric" },
        h("b", null, settled + " / " + total),
        h("span", null, t("metric.purged"))
      ),
      h(
        "div",
        { className: "dshp-metric" },
        h(
          "b",
          { style: { fontSize: 13, fontFamily: "var(--dshp-mono)", fontWeight: 500 } },
          h("span", { className: "dshp-pill is-" + shimKind(s.shim_cmd) }, "cmd"),
          " ",
          h("span", { className: "dshp-pill is-" + shimKind(s.shim_ps1) }, "ps1"),
          " ",
          h("span", { className: "dshp-pill is-" + shimKind(s.shim_bin || "missing") }, "unix")
        ),
        h("span", null, t("metric.shim"))
      ),
      h(
        "div",
        { className: "dshp-metric" },
        h("b", null, s.has_backup ? t("metric.bak.yes") : t("metric.bak.no")),
        h("span", null, t("metric.bak.hint"))
      )
    ) : h(
      "div",
      { className: "dshp-metrics" },
      h(
        "div",
        { className: "dshp-metric" },
        h("div", { className: "dshp-skel" }),
        h("div", { className: "dshp-skel", style: { width: "40%" } })
      ),
      h(
        "div",
        { className: "dshp-metric" },
        h("div", { className: "dshp-skel" }),
        h("div", { className: "dshp-skel", style: { width: "40%" } })
      ),
      h(
        "div",
        { className: "dshp-metric" },
        h("div", { className: "dshp-skel" }),
        h("div", { className: "dshp-skel", style: { width: "40%" } })
      )
    ),
    h("div", { className: "dshp-bar", "aria-hidden": "true" }, h("i", { style: { width: pct + "%" } })),
    h(PatchGroups, { state: s }),
    h(
      "div",
      { className: "dshp-row", style: { marginTop: 14 } },
      h(
        Btn,
        { kind: "primary", disabled: patchBusy || uninstallBusy, onClick: () => doAction("apply", "action.apply") },
        patchBusy ? t("btn.apply.busy") : t("btn.apply")
      ),
      h(
        Btn,
        { kind: "danger", disabled: patchBusy || uninstallBusy, onClick: () => doAction("revert", "action.revert") },
        t("btn.revert")
      ),
      h(
        Btn,
        { kind: "solid-danger", disabled: patchBusy || uninstallBusy, onClick: () => setAskUninstall(true) },
        uninstallBusy ? t("btn.uninstall.busy") : t("btn.uninstall")
      ),
      noticeNode(notice)
    ),
    askUninstall ? h(
      "div",
      {
        className: "dshp-modal-bg",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "dshp-uninstall-title",
        onClick: (e) => {
          if (e.target === e.currentTarget && !uninstallBusy) setAskUninstall(false);
        }
      },
      h(
        "div",
        { className: "dshp-modal" },
        h("h4", { id: "dshp-uninstall-title" }, t("uninstall.title")),
        h("p", null, t("uninstall.body")),
        h(
          "div",
          { className: "dshp-modal-ops" },
          h(Btn, { disabled: uninstallBusy, onClick: () => setAskUninstall(false) }, t("uninstall.cancel")),
          h(Btn, { kind: "solid-danger", disabled: uninstallBusy, onClick: doUninstall }, t("uninstall.confirm"))
        )
      )
    ) : null,
    h(
      "p",
      { className: "dshp-hint", style: { margin: "8px 0 0", color: "var(--dshp-mute)", fontSize: 12 } },
      t("apply.hint")
    ),
    s && !s.ai_base ? h(
      "p",
      { className: "dshp-hint", style: { margin: "8px 0 0", color: "var(--dshp-danger, #c44)", fontSize: 12 } },
      hostText(t, "warn.noRoot", hostSurface)
    ) : null,
    s && s.ai_base && s.override_status === "missing" ? h(
      "p",
      { className: "dshp-hint", style: { margin: "8px 0 0", color: "var(--dshp-mute)", fontSize: 12 } },
      t("warn.noInject")
    ) : null,
    askRestart ? h(
      "div",
      { className: "dshp-ask" },
      h("span", null, hostText(t, "restart.confirm", hostSurface)),
      h(Btn, { tiny: true, onClick: () => setAskRestart(false) }, t("restart.later")),
      h(
        Btn,
        {
          tiny: true,
          kind: "primary",
          onClick: () => {
            setAskRestart(false);
            restartDsh(setNotice, function() {
            }, t, hostSurface);
          }
        },
        t("btn.restart")
      )
    ) : null,
    // h(ContinueRetrySection, null),
    h(
      "div",
      { className: "dshp-sub" },
      h("h4", null, t("override.title")),
      h(
        "div",
        { className: "dshp-row", style: { margin: 0 } },
        h(
          Btn,
          { kind: "primary", tiny: true, disabled: patchBusy || !overrideLoaded, onClick: saveOverride },
          t("btn.saveInject")
        ),
        h(
          Btn,
          { tiny: true, disabled: patchBusy || !overrideLoaded || !defaultOverride, onClick: restoreOverride },
          t("btn.restoreInject")
        )
      )
    ),
    h("textarea", {
      className: "dshp-area",
      value: override,
      onChange: (e) => setOverride(e.target.value),
      spellCheck: false,
      placeholder: ""
    }),
    promptBoxEmpty(override) ? h(
      "p",
      {
        className: "dshp-hint",
        style: { margin: "8px 0 0", color: "var(--dshp-danger, #c44)", fontSize: 12 }
      },
      t("need.prompt")
    ) : null
  );
}

// client-src/rules-settings.js
function ruleLabel(r) {
  if (!r) return "";
  if (r.name !== r.id) return r.name + " (" + r.id + ")";
  return r.id;
}
function RulesSection() {
  const t = useT();
  const tRef = useRef(t);
  tRef.current = t;
  const [st, setSt] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editTarget, setEditTarget] = useState("AGENTS.md");
  const [content, setContent] = useState("");
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState("AGENTS.md");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState({ kind: "idle", text: "" });
  const loadStatus = useCallback(() => {
    const tr = tRef.current;
    rulesApi("status").then((d) => {
      if (d && d.ok) setSt(d);
      else {
        setSt({ ok: false, rules: [], active: null });
        setNotice({ kind: "error", text: tr("err.rules", { error: d && d.error || "bad response" }) });
      }
    }).catch((e) => {
      setSt({ ok: false, rules: [], active: null });
      setNotice({ kind: "error", text: tr("err.rules", { error: e.message }) });
    });
  }, []);
  useEffect(() => {
    loadStatus();
  }, [loadStatus]);
  const doPost = useCallback(
    (action, payload, after) => {
      setBusy(true);
      setNotice({ kind: "idle", text: "" });
      rulesApi(action, payload).then((d) => {
        if (d && d.ok) {
          setNotice({ kind: "ok", text: t("ok.done") });
          if (action === "save" || action === "activate") warnNeedPrompt(d, t);
          loadStatus();
          if (after) after();
        } else {
          warnNeedPrompt(d, t);
          setNotice({ kind: "error", text: t("err.action", { error: d && d.error || "" }) });
        }
      }).catch((e) => setNotice({ kind: "error", text: t("err.action", { error: e.message }) })).finally(() => setBusy(false));
    },
    [loadStatus, t]
  );
  const openRule = useCallback(
    (id) => {
      setBusy(true);
      rulesApi("read", { id }).then((d) => {
        if (d.ok) {
          setEditId(id);
          setEditName(d.name || id);
          setEditTarget(d.target || "AGENTS.md");
          setContent(typeof d.content === "string" ? d.content : "");
        } else setNotice({ kind: "error", text: t("err.read", { error: d.error || "" }) });
      }).catch((e) => setNotice({ kind: "error", text: t("err.read", { error: e.message }) })).finally(() => setBusy(false));
    },
    [t]
  );
  const clearEditor = () => {
    setEditId(null);
    setEditName("");
    setEditTarget("AGENTS.md");
    setContent("");
  };
  let list;
  if (!st) {
    list = h("div", { className: "dshp-skel", style: { height: 80, margin: 12 } });
  } else if (!st.rules || st.rules.length === 0) {
    list = h("p", { className: "dshp-empty" }, t("rules.empty"));
  } else {
    list = st.rules.map((r) => {
      const isActive = r.id === st.active;
      const isEdit = r.id === editId;
      return h(
        "div",
        {
          key: r.id,
          className: "dshp-ruleitem" + (isEdit ? " is-edit" : ""),
          role: "button",
          tabIndex: 0,
          onClick: () => openRule(r.id),
          onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openRule(r.id);
            }
          }
        },
        h(
          "div",
          { className: "dshp-rule-main" },
          h(
            "span",
            { className: "dshp-rule-name" },
            ruleLabel(r),
            isActive ? h("span", { className: "dshp-pill is-ok" }, t("pill.current")) : null
          ),
          h("span", { className: "dshp-rule-meta" }, r.target + " \xB7 " + formatSize(r.size))
        ),
        h(
          "div",
          { className: "dshp-rule-ops" },
          h(
            Btn,
            {
              tiny: true,
              kind: isActive ? void 0 : "primary",
              disabled: busy || isActive,
              onClick: (e) => {
                e.stopPropagation();
                if (!isActive) doPost("activate", { id: r.id });
              }
            },
            isActive ? t("btn.inUse") : t("btn.use")
          ),
          h(
            Btn,
            {
              tiny: true,
              kind: "danger",
              disabled: busy,
              onClick: (e) => {
                e.stopPropagation();
                if (!window.confirm(t("confirm.delete", { id: r.id }))) return;
                if (editId === r.id) clearEditor();
                doPost("delete", { id: r.id });
              }
            },
            t("delete")
          )
        )
      );
    });
  }
  return h(
    "section",
    { className: "dshp-panel", "aria-label": t("rules.title") },
    h(
      "div",
      { className: "dshp-head" },
      h("h3", { className: "dshp-title" }, t("rules.title")),
      h(
        "div",
        { className: "dshp-row", style: { margin: 0 } },
        noticeNode(notice),
        h(
          Btn,
          {
            tiny: true,
            kind: "danger",
            disabled: busy,
            onClick: () => {
              if (!window.confirm(t("rules.reset.confirm"))) return;
              clearEditor();
              doPost("reset", {});
            }
          },
          t("rules.reset")
        )
      )
    ),
    h(
      "div",
      { className: "dshp-split" },
      h(
        "div",
        { className: "dshp-rulelist" },
        h("div", { className: "dshp-rulebody" }, list),
        h(
          "div",
          { className: "dshp-create" },
          h(
            "div",
            { className: "dshp-create-row" },
            h("input", {
              className: "dshp-field",
              placeholder: t("ph.id"),
              value: newId,
              onChange: (e) => setNewId(e.target.value)
            }),
            h("input", {
              className: "dshp-field",
              placeholder: t("ph.alias"),
              value: newName,
              onChange: (e) => setNewName(e.target.value)
            }),
            h(
              "select",
              {
                className: "dshp-field",
                style: { minWidth: 120, flex: "0 0 auto" },
                value: newTarget,
                onChange: (e) => setNewTarget(e.target.value)
              },
              TARGETS.map((x) => h("option", { key: x, value: x }, x))
            ),
            h(
              Btn,
              {
                kind: "primary",
                tiny: true,
                disabled: busy,
                onClick: () => {
                  const id = newId.trim();
                  if (!id) {
                    setNotice({ kind: "error", text: t("need.id") });
                    return;
                  }
                  const name2 = newName.trim() || id;
                  const target = newTarget;
                  doPost("save", { id, content: "", name: name2, target }, () => {
                    setEditId(id);
                    setEditName(name2);
                    setEditTarget(target);
                    setContent("");
                  });
                  setNewId("");
                  setNewName("");
                  setNewTarget("AGENTS.md");
                }
              },
              t("btn.create")
            )
          )
        )
      ),
      h(
        "div",
        { className: "dshp-editor" },
        editId ? [
          h(
            "div",
            { key: "meta", className: "dshp-row" },
            h("input", {
              className: "dshp-field",
              placeholder: t("ph.alias.short"),
              value: editName,
              onChange: (e) => setEditName(e.target.value)
            }),
            h(
              "select",
              {
                className: "dshp-field",
                style: { minWidth: 120 },
                value: editTarget,
                onChange: (e) => setEditTarget(e.target.value)
              },
              TARGETS.map((x) => h("option", { key: x, value: x }, x))
            )
          ),
          h("textarea", {
            key: "body",
            className: "dshp-area",
            value: content,
            onChange: (e) => setContent(e.target.value),
            placeholder: ""
          }),
          h(
            "div",
            { key: "save", className: "dshp-row" },
            h(
              Btn,
              {
                kind: "primary",
                disabled: busy,
                onClick: () => doPost("save", { id: editId, content, name: editName, target: editTarget })
              },
              t("btn.saveRule")
            ),
            noticeNode(notice)
          )
        ] : h("div", { className: "dshp-editor-empty" }, t("rules.pick"))
      )
    )
  );
}

// client-src/skills-settings.js
function SkillsSection() {
  const t = useT();
  const tRef = useRef(t);
  tRef.current = t;
  const [onBeta, setOnBeta] = useState(false);
  const [st, setSt] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editDesc, setEditDesc] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState({ kind: "idle", text: "" });
  const zipRef = useRef(null);
  const folderRef = useRef(null);
  const loadStatus = useCallback(() => {
    const tr = tRef.current;
    const fail = (e) => {
      setSt({ ok: false, skills: [] });
      setNotice({
        kind: "error",
        text: skillsRouteMissing(e) ? tr("err.skills.needRestart") : tr("err.skills", { error: e && e.message || e || "bad response" })
      });
    };
    const apply2 = (d) => {
      if (d && d.ok) setSt({ ok: true, skills: d.skills || [] });
      else fail({ message: d && d.error || "bad response" });
    };
    apiJson("/dsh-purge/status").then((d) => {
      const allowed = skillUiAllowed(d);
      setOnBeta(allowed);
      if (!allowed) {
        setSt(null);
        return;
      }
      if (d.skills) {
        apply2({ ok: true, skills: d.skills });
        return;
      }
      skillsApi("status").then(apply2).catch(fail);
    }).catch(() => {
      setOnBeta(false);
      setSt(null);
    });
  }, []);
  useEffect(() => {
    loadStatus();
  }, [loadStatus]);
  const doPost = useCallback(
    (action, payload, after) => {
      setBusy(true);
      setNotice({ kind: "idle", text: "" });
      skillsApi(action, payload).then((d) => {
        if (d && d.ok) {
          setNotice({ kind: "ok", text: t("ok.done") });
          loadStatus();
          if (after) after(d);
        } else {
          setNotice({ kind: "error", text: t("err.action", { error: d && d.error || "" }) });
        }
      }).catch(
        (e) => setNotice({
          kind: "error",
          text: skillsRouteMissing(e) ? t("err.skills.needRestart") : t("err.action", { error: e.message })
        })
      ).finally(() => setBusy(false));
    },
    [loadStatus, t]
  );
  const openSkill = useCallback(
    (id) => {
      setBusy(true);
      skillsApi("read", { id }).then((d) => {
        if (d.ok) {
          setEditId(id);
          setEditDesc(d.description || "");
          setContent(typeof d.content === "string" ? d.content : "");
        } else setNotice({ kind: "error", text: t("err.read", { error: d.error || "" }) });
      }).catch((e) => setNotice({ kind: "error", text: t("err.read", { error: e.message }) })).finally(() => setBusy(false));
    },
    [t]
  );
  const clearEditor = () => {
    setEditId(null);
    setEditDesc("");
    setContent("");
  };
  const readAsBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const at = text.indexOf(",");
      resolve(at >= 0 ? text.slice(at + 1) : text);
    };
    reader.onerror = () => reject(new Error(t("need.import")));
    reader.readAsDataURL(file);
  });
  const importZip = (file) => {
    if (!file) {
      setNotice({ kind: "error", text: t("need.import") });
      return;
    }
    setBusy(true);
    setNotice({ kind: "ok", text: t("skills.importing") });
    readAsBase64(file).then((data) => skillsApi("import", { data, name: file.name })).then((d) => {
      if (!d || !d.ok) throw new Error(d && d.error || "");
      setNotice({ kind: "ok", text: t("saved.import", { count: (d.imported || []).length || 1 }) });
      loadStatus();
    }).catch(
      (e) => setNotice({
        kind: "error",
        text: skillsRouteMissing(e) ? t("err.skills.needRestart") : t("err.action", { error: e.message })
      })
    ).finally(() => setBusy(false));
  };
  const keepFolderFile = (file) => {
    const rel = String(file.webkitRelativePath || file.name || "").replace(/\\/g, "/");
    if (!rel || rel.includes("..")) return false;
    if (/(^|\/)(node_modules|\.git|__MACOSX|\.system)(\/|$)/i.test(rel)) return false;
    if (/(^|\/)\._/.test(rel) || /\/\.DS_Store$/i.test(rel)) return false;
    return true;
  };
  const importFolder = (list2) => {
    const files = Array.from(list2 || []).filter(keepFolderFile);
    if (!files.length) {
      setNotice({ kind: "error", text: t("err.import.folder") });
      return;
    }
    setBusy(true);
    setNotice({ kind: "ok", text: t("skills.importing") });
    Promise.all(
      files.map(
        (file) => readAsBase64(file).then((content2) => ({
          path: file.webkitRelativePath || file.name,
          content: content2,
          encoding: "base64"
        }))
      )
    ).then(
      (payload) => skillsApi("import", {
        files: payload,
        name: String(payload[0] && payload[0].path || "").split("/")[0]
      })
    ).then((d) => {
      if (!d || !d.ok) throw new Error(d && d.error || "");
      setNotice({ kind: "ok", text: t("saved.import", { count: (d.imported || []).length || 1 }) });
      loadStatus();
    }).catch(
      (e) => setNotice({
        kind: "error",
        text: skillsRouteMissing(e) ? t("err.skills.needRestart") : t("err.action", { error: e.message })
      })
    ).finally(() => setBusy(false));
  };
  if (!onBeta) return null;
  let list;
  if (!st) {
    list = h("div", { className: "dshp-skel", style: { height: 80, margin: 12 } });
  } else if (!st.skills || st.skills.length === 0) {
    list = h("p", { className: "dshp-empty" }, t("skills.empty"));
  } else {
    list = st.skills.map((item) => {
      const isEdit = item.id === editId;
      return h(
        "div",
        {
          key: item.id,
          className: "dshp-ruleitem" + (isEdit ? " is-edit" : ""),
          role: "button",
          tabIndex: 0,
          onClick: () => openSkill(item.id),
          onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openSkill(item.id);
            }
          }
        },
        h(
          "div",
          { className: "dshp-rule-main" },
          h("span", { className: "dshp-rule-name" }, item.id),
          h(
            "span",
            { className: "dshp-rule-meta" },
            (item.valid ? item.description : t("skills.invalid")) + " \xB7 " + formatSize(item.size)
          ),
          item.valid ? h(
            "span",
            { className: "dshp-rule-meta" },
            [
              item.userInvocable ? t("skills.call.slash", { cmd: "/" + item.id }) : t("skills.call.userOff"),
              item.modelInvocable ? t("skills.call.model") : t("skills.call.modelOff")
            ].join(" \xB7 ")
          ) : null
        ),
        h(
          "div",
          { className: "dshp-rule-ops" },
          h(
            Btn,
            {
              tiny: true,
              kind: "danger",
              disabled: busy,
              onClick: (e) => {
                e.stopPropagation();
                if (!window.confirm(t("confirm.delete.skill", { id: item.id }))) return;
                if (editId === item.id) clearEditor();
                doPost("delete", { id: item.id });
              }
            },
            t("delete")
          )
        )
      );
    });
  }
  return h(
    "section",
    { className: "dshp-panel", "aria-label": t("skills.title") },
    h(
      "div",
      { className: "dshp-head" },
      h("h3", { className: "dshp-title" }, t("skills.title")),
      h("div", { className: "dshp-row", style: { margin: 0 } }, noticeNode(notice))
    ),
    h(
      "p",
      { className: "dshp-hint", style: { margin: "0 0 10px", color: "var(--dshp-mute)", fontSize: 12 } },
      hostText(t, "skills.hint", hostSurfaceOf())
    ),
    h(
      "div",
      { className: "dshp-split" },
      h(
        "div",
        { className: "dshp-rulelist" },
        h("div", { className: "dshp-rulebody" }, list),
        h(
          "div",
          { className: "dshp-create" },
          h(
            "div",
            { className: "dshp-create-row" },
            h("input", {
              ref: zipRef,
              type: "file",
              accept: ".zip,.tgz,.tar.gz,.tar,.skill",
              style: { display: "none" },
              onChange: (e) => {
                const file = e.target.files && e.target.files[0];
                e.target.value = "";
                importZip(file);
              }
            }),
            h("input", {
              ref: (el) => {
                folderRef.current = el;
                if (!el) return;
                el.setAttribute("webkitdirectory", "");
                el.setAttribute("directory", "");
                el.multiple = true;
              },
              type: "file",
              multiple: true,
              style: { display: "none" },
              onChange: (e) => {
                const files = Array.from(e.target && e.target.files || []);
                e.target.value = "";
                importFolder(files);
              }
            }),
            h(
              Btn,
              {
                kind: "primary",
                tiny: true,
                disabled: busy,
                onClick: () => zipRef.current && zipRef.current.click()
              },
              t("btn.importZip")
            ),
            h(
              Btn,
              {
                tiny: true,
                disabled: busy,
                onClick: () => folderRef.current && folderRef.current.click()
              },
              t("btn.importFolder")
            )
          )
        )
      ),
      h(
        "div",
        { className: "dshp-editor" },
        editId ? [
          h(
            "div",
            { key: "meta", className: "dshp-row" },
            h("input", {
              className: "dshp-field",
              placeholder: t("ph.skill.desc"),
              value: editDesc,
              onChange: (e) => setEditDesc(e.target.value)
            })
          ),
          h("textarea", {
            key: "body",
            className: "dshp-area",
            value: content,
            onChange: (e) => setContent(e.target.value),
            spellCheck: false,
            placeholder: ""
          }),
          h(
            "div",
            { key: "save", className: "dshp-row" },
            h(
              Btn,
              {
                kind: "primary",
                disabled: busy,
                onClick: () => doPost("save", { id: editId, content, description: editDesc })
              },
              t("btn.saveSkill")
            ),
            noticeNode(notice)
          )
        ] : h("div", { className: "dshp-editor-empty" }, t("skills.pick"))
      )
    )
  );
}

// client-src/theme-settings.js
function reopenAfterRestart() {
  const url = new URL(window.location.href);
  url.searchParams.delete("token");
  window.location.replace(url.pathname + url.search + url.hash);
}
function waitForRestart(setNotice, setBusy, t) {
  const started = Date.now();
  const ping = () => {
    fetch("/dsh-purge/status", { cache: "no-store", credentials: "same-origin" }).then((r) => r.ok ? r.json() : Promise.reject()).then((d) => {
      if (d && d.ok && d.ready !== false) reopenAfterRestart();
      else retry();
    }).catch(retry);
  };
  const retry = () => {
    if (Date.now() - started > 9e4) {
      setNotice({ kind: "error", text: t("restart.timeout") });
      setBusy(false);
      return;
    }
    setTimeout(ping, 500);
  };
  setTimeout(ping, 800);
}
function restartDsh(setNotice, setBusy, t, surface) {
  const surf = surface || clientGuessSurface() || "web";
  setBusy(true);
  setNotice({ kind: "ok", text: hostText(t, "restarting", surf) });
  fetch("/dsh-purge/restart", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }).then((r) => r.json()).then((d) => {
    if (!d.ok) throw new Error(d.error || "restart failed");
    const next = d && d.surface || surf;
    setNotice({ kind: "ok", text: hostText(t, "restarting", next) });
    if (next === "desktop" || d && d.fullApp || clientGuessSurface() === "desktop") return;
    waitForRestart(setNotice, setBusy, t);
  }).catch((e) => {
    if (surf === "desktop" || clientGuessSurface() === "desktop") return;
    if (String(e.message || e).includes("Failed to fetch") || e.name === "TypeError") {
      waitForRestart(setNotice, setBusy, t);
      return;
    }
    setNotice({ kind: "error", text: t("restart.fail", { error: e.message }) });
    setBusy(false);
  });
}
function detectHostTheme() {
  try {
    if (typeof document !== "undefined") {
      if (document.body?.hasAttribute("data-ds-dark-theme")) return "dusk";
      const root = document.documentElement;
      const scheme = (root.style.colorScheme || getComputedStyle(root).getPropertyValue("color-scheme") || "").toLowerCase();
      if (scheme.includes("dark")) return "dusk";
      if (scheme.includes("light")) return "white";
    }
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      return "dusk";
    }
  } catch {
  }
  return "white";
}
function readTheme() {
  try {
    if (window.localStorage.getItem(THEME_MODE_KEY) === "manual") {
      const v = window.localStorage.getItem(THEME_KEY);
      if (v === "dusk" || v === "white") return v;
    }
  } catch {
  }
  return detectHostTheme();
}
function SettingsRoot(props) {
  const t = typeof props.t === "function" ? props.t : (key) => key;
  const [theme, setTheme] = useState(readTheme);
  const setAndStore = useCallback((next) => {
    setTheme(next);
    try {
      window.localStorage.setItem(THEME_MODE_KEY, "manual");
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
    }
  }, []);
  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    const syncFromHost = () => {
      try {
        if (window.localStorage.getItem(THEME_MODE_KEY) === "manual") return;
      } catch {
      }
      if (!cancelled) setTheme(detectHostTheme());
    };
    const syncSoon = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(syncFromHost, 50);
    };
    syncFromHost();
    let mq;
    try {
      mq = window.matchMedia?.("(prefers-color-scheme: dark)");
      mq?.addEventListener?.("change", syncFromHost);
    } catch {
    }
    let obs;
    try {
      if (document.body) {
        obs = new MutationObserver(syncSoon);
        obs.observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme"] });
      }
    } catch {
    }
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      try {
        mq?.removeEventListener?.("change", syncFromHost);
      } catch {
      }
      try {
        obs?.disconnect();
      } catch {
      }
    };
  }, []);
  setTranslate(t);
  return h(
    "div",
    { className: "dshp-root", "data-theme": theme },
    h("style", null, PURGE_CSS),
    h(
      "div",
      { className: "dshp-toolbar" },
      h(
        "div",
        { className: "dshp-switch", role: "group", "aria-label": t("theme.aria") },
        h(
          "button",
          {
            type: "button",
            className: theme === "white" ? "is-on" : "",
            onClick: () => setAndStore("white")
          },
          t("theme.white")
        ),
        h(
          "button",
          {
            type: "button",
            className: theme === "dusk" ? "is-on" : "",
            onClick: () => setAndStore("dusk")
          },
          t("theme.ink")
        )
      )
    ),
    h(PurgifySection, null),
    h(RulesSection, null),
    h(SkillsSection, null)
  );
}

// client-src/rewind-styles.js
var REWIND_CSS = `
.dshp-rewind-wrap{position:relative;display:inline-flex}
.dshp-rewind{appearance:none;display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 8px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary,currentColor);font:12px/1 var(--ds-font-sans,system-ui,sans-serif);cursor:pointer}
.dshp-rewind:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12));color:var(--dsw-alias-label-primary,currentColor)}
.dshp-rewind:disabled{opacity:.4;cursor:default}
.dshp-rewind svg{display:block}
.dshp-rewind-menu{position:absolute;right:0;bottom:calc(100% + 6px);z-index:100;box-sizing:border-box;min-width:196px;padding:4px;border:0;border-radius:12px;background:var(--dsw-specific-menu,#fff);color:var(--dsw-alias-label-primary,#1a1a1a);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent,0 8px 24px rgba(0,0,0,.16))}
body[data-ds-dark-theme] .dshp-rewind-menu{background:var(--dsw-specific-menu,#32312d);color:var(--dsw-alias-label-primary,#e6e2db);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1,#3f3d38);box-shadow:var(--dsw-elevation-prominent,0 10px 28px rgba(0,0,0,.45))}
.dshp-rewind-item{display:flex;flex-direction:column;gap:2px;width:100%;padding:8px 10px;border:0;border-radius:8px;background:transparent;color:inherit;text-align:left;cursor:pointer;font:12px/1.3 var(--ds-font-sans,system-ui,sans-serif)}
.dshp-rewind-item:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12))}
.dshp-rewind-item b{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary,inherit)}
.dshp-rewind-item span{color:var(--dsw-alias-label-tertiary,#9a958c);font-size:11px}
body[data-ds-dark-theme] .dshp-rewind-item span{color:var(--dsw-alias-label-tertiary,#a8a39a)}
.dshp-continue{appearance:none;display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 8px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary,currentColor);font:12px/1 var(--ds-font-sans,system-ui,sans-serif);cursor:pointer}
.dshp-continue:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12));color:var(--dsw-alias-label-primary,currentColor)}
.dshp-continue:disabled{opacity:.4;cursor:default}
.dshp-continue.is-ready{color:var(--dsw-alias-label-primary,currentColor)}
.dshp-continue svg{display:block}
`;

// client-src/rewind.js
var DRAFT_KEY = "dshp-rewind-draft:";
var ARM_KEY = "dshp-rewind-arm:";
var FILL_DELAYS = [0, 50, 180];
var ARM_TTL_MS = 45 * 1e3;
var rewindSeenAt = 0;
var rewindSessions = null;
var rewindHost = null;
var pendingComposer = { sessionId: "", text: "", at: 0 };
var armedFill = { sessionId: "", text: "", at: 0 };
function rewindText(t, key, fallback) {
  try {
    if (typeof t === "function") {
      const value = t(key);
      if (value && value !== key) return value;
    }
  } catch {
  }
  return fallback;
}
function currentSessionId(sessions) {
  try {
    return sessions?.list?.getSnapshot?.()?.current || "";
  } catch {
    return "";
  }
}
function isPluginDraft(text) {
  const value = String(text || "").trim();
  if (!value) return false;
  return /^\[MNEMON\]/i.test(value) || /MNEMON RUNTIME MEMORY SNAPSHOT/i.test(value) || /^MNEMON VIEW TOOLS/im.test(value);
}
function writeDraft(sessionId, text) {
  if (!sessionId) return;
  const value = isPluginDraft(text) ? "" : text || "";
  pendingComposer = { sessionId, text: value, at: Date.now() };
  try {
    sessionStorage.setItem(DRAFT_KEY + sessionId, value);
  } catch {
  }
}
function peekDraft(sessionId) {
  if (!sessionId) return "";
  if (pendingComposer.sessionId === sessionId && pendingComposer.text) return pendingComposer.text;
  try {
    return sessionStorage.getItem(DRAFT_KEY + sessionId) || "";
  } catch {
    return "";
  }
}
function clearStoredDraft(sessionId) {
  if (!sessionId) return;
  if (pendingComposer.sessionId === sessionId) pendingComposer = { sessionId: "", text: "", at: 0 };
  try {
    sessionStorage.removeItem(DRAFT_KEY + sessionId);
  } catch {
  }
  try {
    sessionStorage.removeItem(ARM_KEY + sessionId);
  } catch {
  }
}
function armComposerFill(sessionId, text) {
  if (!sessionId || !text || isPluginDraft(text)) return;
  const at = Date.now();
  armedFill = { sessionId, text, at };
  writeDraft(sessionId, text);
  try {
    sessionStorage.setItem(ARM_KEY + sessionId, String(at));
  } catch {
  }
}
function takeArmedFill(sessionId) {
  if (!sessionId) return "";
  let text = "";
  let at = 0;
  if (armedFill.sessionId === sessionId && armedFill.text) {
    text = armedFill.text;
    at = armedFill.at;
  } else {
    text = peekDraft(sessionId);
    try {
      at = Number(sessionStorage.getItem(ARM_KEY + sessionId) || 0);
    } catch {
      at = 0;
    }
  }
  if (!text || !at || Date.now() - at > ARM_TTL_MS) {
    if (text && (!at || Date.now() - at > ARM_TTL_MS)) clearStoredDraft(sessionId);
    return "";
  }
  clearStoredDraft(sessionId);
  armedFill = { sessionId: "", text: "", at: 0 };
  return text;
}
function conversationInput(sessionId) {
  try {
    const host = rewindHost;
    const conversation = host?.conversation || (typeof host?.get === "function" ? host.get("conversation") : void 0);
    const sessions = host?.sessions || rewindSessions;
    const actx = typeof sessions?.scope === "function" ? sessions.scope(sessionId) : void 0;
    if (conversation?.input?.for && actx) return conversation.input.for(actx);
    return conversation?.input || null;
  } catch {
    return null;
  }
}
function liveDraft(sessionId, inputActions) {
  try {
    const fromActions = inputActions?.state?.getSnapshot?.()?.draft;
    if (typeof fromActions === "string") return fromActions;
  } catch {
  }
  try {
    const draft = conversationInput(sessionId)?.state?.getSnapshot?.()?.draft;
    if (typeof draft === "string") return draft;
  } catch {
  }
  return "";
}
function hostSetDraft(sessionId, text) {
  if (!sessionId) return false;
  try {
    const input = conversationInput(sessionId);
    if (input && typeof input.setDraft === "function") {
      input.setDraft(text || "");
      return true;
    }
  } catch {
  }
  return false;
}
function fillComposer(inputActions, text) {
  if (inputActions && typeof inputActions.setDraft === "function") {
    try {
      inputActions.setDraft(text || "");
    } catch {
    }
  }
}
function scheduleComposerFill(sessionId, text, inputActions) {
  if (!sessionId || !text || isPluginDraft(text)) return;
  let stopped = false;
  let filled = false;
  const tryFill = () => {
    if (stopped) return;
    const current = liveDraft(sessionId, inputActions);
    if (filled && current !== text) {
      stopped = true;
      return;
    }
    if (current && current !== text) {
      stopped = true;
      return;
    }
    fillComposer(inputActions, text);
    hostSetDraft(sessionId, text);
    filled = true;
  };
  for (const ms of FILL_DELAYS) window.setTimeout(tryFill, ms);
}
function scheduleEchoClear(sessionId, inputActions) {
  if (!sessionId) return;
  let last = "";
  let stopped = false;
  const tryClear = () => {
    if (stopped || !last) return;
    const current = String(liveDraft(sessionId, inputActions) || "").trim();
    if (!current) {
      stopped = true;
      return;
    }
    if (current !== last) return;
    fillComposer(inputActions, "");
    hostSetDraft(sessionId, "");
    clearStoredDraft(sessionId);
    stopped = true;
  };
  apiJson("/dsh-purge/last-user?sessionId=" + encodeURIComponent(sessionId)).then((data) => {
    last = String(data?.text || "").trim();
    if (!last || isPluginDraft(last)) return;
    tryClear();
    for (const ms of [0, 50, 180, 400]) window.setTimeout(tryClear, ms);
  }).catch(() => {
  });
}
async function dropInheritedQueue(sessions, sessionId) {
  if (!sessions || !sessionId) return;
  const drop = async () => {
    try {
      const actx = typeof sessions.scope === "function" ? sessions.scope(sessionId) : void 0;
      const face = typeof sessions.sessionOf === "function" ? sessions.sessionOf(actx) : void 0;
      const queue = face?.getSnapshot?.()?.queue || [];
      for (const item of queue) {
        const id = item?.id || item?.itemId;
        if (!id) continue;
        try {
          await face.updateQueue?.(id, { kind: "remove" });
        } catch {
        }
      }
    } catch {
    }
  };
  await drop();
  window.setTimeout(() => {
    drop();
  }, 80);
}
async function openRewoundSession(sessions, sessionId) {
  if (!sessions || !sessionId) return;
  try {
    await sessions.refresh?.();
  } catch {
  }
  try {
    sessions.open(sessionId);
  } catch {
  }
  await dropInheritedQueue(sessions, sessionId);
  window.setTimeout(() => {
    try {
      sessions.open(sessionId);
    } catch {
    }
    dropInheritedQueue(sessions, sessionId);
  }, 250);
}
var RewindSafe = class extends Component {
  constructor(p) {
    super(p);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    try {
      console.error("[dsh-purge] rewind slot:", error);
    } catch {
    }
  }
  render() {
    if (this.state.failed) {
      return h(
        "button",
        {
          type: "button",
          className: "dshp-rewind",
          title: "\u56DE\u9000\u4E0A\u4E00\u53E5",
          onMouseDown: (e) => e.preventDefault(),
          onClick: async () => {
            const sessionId = currentSessionId(rewindSessions);
            if (!sessionId) return;
            try {
              const data = await apiJson("/dsh-purge/rewind", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ sessionId, mode: "once" })
              });
              if (data && data.ok && data.sessionId) {
                if (data.at) rewindSeenAt = data.at;
                const text = isPluginDraft(data.text) ? "" : data.text || "";
                armComposerFill(data.sessionId, text);
                scheduleComposerFill(data.sessionId, text);
                await openRewoundSession(rewindSessions, data.sessionId);
                scheduleComposerFill(data.sessionId, text);
              }
            } catch (e) {
              window.alert("\u56DE\u9000\u5931\u8D25: " + String(e && e.message || e));
            }
          }
        },
        h("style", null, REWIND_CSS),
        "\u56DE\u9000"
      );
    }
    return h(RewindButton, this.props);
  }
};
function RewindButton(props) {
  const t = props.t || translate;
  const sessions = rewindSessions;
  const inputActions = props.inputActions;
  const sessionId = props.sessionId || currentSessionId(sessions);
  const wrapRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    if (!sessionId) return;
    const armed = takeArmedFill(sessionId);
    if (armed) {
      scheduleComposerFill(sessionId, armed, inputActions);
      return;
    }
    scheduleEchoClear(sessionId, inputActions);
  }, [sessionId, inputActions]);
  useEffect(() => {
    if (!menu) return;
    const onDoc = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menu]);
  const runRewind = async (mode) => {
    if (!sessionId || busy) return;
    setBusy(true);
    setMenu(false);
    setNotice("");
    try {
      const data = await apiJson("/dsh-purge/rewind", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId, mode })
      });
      if (!data || !data.ok || !data.sessionId) throw new Error(data && data.error || "rewind");
      if (data.at) rewindSeenAt = data.at;
      const text = isPluginDraft(data.text) ? "" : data.text || "";
      armComposerFill(data.sessionId, text);
      await openRewoundSession(sessions, data.sessionId);
      scheduleComposerFill(data.sessionId, text);
    } catch (e) {
      setNotice(rewindText(t, "rewind.fail", "\u56DE\u9000\u5931\u8D25: {error}").replace("{error}", String(e && e.message || e)));
    } finally {
      setBusy(false);
    }
  };
  const onClick = async (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (!sessionId || busy) return;
    if (menu) {
      setMenu(false);
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      const info = await apiJson("/dsh-purge/rewind/options?sessionId=" + encodeURIComponent(sessionId));
      if (info && info.ok && info.kind === "main") {
        setMenu(true);
        return;
      }
      await runRewind("once");
    } catch (e) {
      setNotice(rewindText(t, "rewind.fail", "\u56DE\u9000\u5931\u8D25: {error}").replace("{error}", String(e && e.message || e)));
    } finally {
      setBusy(false);
    }
  };
  const label = busy ? rewindText(t, "rewind.busy", "\u56DE\u9000\u4E2D\u2026") : rewindText(t, "rewind.label", "\u56DE\u9000");
  const title = notice || rewindText(t, "rewind.aria", "\u56DE\u9000");
  return h(
    "div",
    { className: "dshp-rewind-wrap", ref: wrapRef },
    h("style", null, REWIND_CSS),
    h(
      "button",
      {
        type: "button",
        className: "dshp-rewind",
        title,
        "aria-label": rewindText(t, "rewind.aria", "\u56DE\u9000"),
        disabled: busy || !sessionId,
        onMouseDown: (e) => e.preventDefault(),
        onClick
      },
      h(
        "svg",
        { viewBox: "0 0 16 16", width: "14", height: "14", "aria-hidden": true },
        h("path", {
          fill: "currentColor",
          d: "M7.2 3.2 3.4 7l3.8 3.8V8.6c2.8 0 4.7.7 5.9 2.3-.2-2.8-1.9-5.2-5.9-5.6V3.2z"
        })
      ),
      label
    ),
    menu ? h(
      "div",
      { className: "dshp-rewind-menu", role: "menu" },
      h(
        "button",
        {
          type: "button",
          className: "dshp-rewind-item",
          onMouseDown: (e) => e.preventDefault(),
          onClick: () => runRewind("once")
        },
        h("b", null, rewindText(t, "rewind.once", "\u56DE\u9000\u4E00\u6B21")),
        h("span", null, rewindText(t, "rewind.once.hint", "\u53EA\u9000\u5F53\u524D\u5BF9\u8BDD\u4E0A\u4E00\u53E5"))
      ),
      h(
        "button",
        {
          type: "button",
          className: "dshp-rewind-item",
          onMouseDown: (e) => e.preventDefault(),
          onClick: () => runRewind("round")
        },
        h("b", null, rewindText(t, "rewind.round", "\u56DE\u9000\u4E0A\u4E00\u8F6E")),
        h("span", null, rewindText(t, "rewind.round.hint", "\u9000\u56DE\u4E0A\u4E00\u8F6E\u4E3B\u5BF9\u8BDD\uFF0C\u672C\u8F6E\u5B50\u4EE3\u7406\u4E00\u5E76\u53BB\u6389"))
      )
    ) : null
  );
}
function installRewindWatch(ctx) {
  const sessions = ctx.sessions;
  if (!sessions) return () => {
  };
  const tick = async () => {
    try {
      const data = await apiJson("/dsh-purge/rewind");
      if (!data || !data.sessionId || !data.at || data.at <= rewindSeenAt) return;
      rewindSeenAt = data.at;
      const current = currentSessionId(sessions);
      if (current && current !== data.parentId) return;
      const text = isPluginDraft(data.text) ? "" : data.text || "";
      armComposerFill(data.sessionId, text);
      scheduleComposerFill(data.sessionId, text);
      await openRewoundSession(sessions, data.sessionId);
      scheduleComposerFill(data.sessionId, text);
    } catch {
    }
  };
  const timer = window.setInterval(tick, 1200);
  return () => window.clearInterval(timer);
}
async function installRewindUi(ctx) {
  const status = await apiJson("/dsh-purge/status").catch(() => null);
  if (!status || status.rewindEnabled === false) return;
  rewindHost = ctx;
  rewindSessions = ctx.sessions;
  ctx.slots.inject(
    "conversation.input.right",
    () => ctx.slots.register(
      {
        name: "conversation.input.right",
        id: "dsh-purge-rewind",
        order: 20,
        inject: (sessionId) => ({
          sessionId,
          t: ctx.locale.bind(NS)
        })
      },
      RewindSafe
    )
  );
  ctx.effect(() => installRewindWatch(ctx), "dsh-purge: rewind watch");
}

// client-src/app.js
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dsh-purge: dictionaries");
  const t = ctx.locale.bind(NS);
  setTranslate(t);
  ctx.slots.inject(
    "settings.section",
    () => ctx.slots.register(
      {
        name: "settings.section",
        id: "dsh-purge",
        order: 40,
        label: () => t("nav"),
        locale: NS,
        inject: () => ({ t })
      },
      SettingsRoot
    )
  );
  try {
    if (typeof ctx.inject === "function") {
      ctx.inject(["sessions"], (host) => installRewindUi(host));
    } else if (ctx.sessions) {
      installRewindUi(ctx);
    }
  } catch (e) {
    try {
      console.warn("[dsh-purge] rewind ui skipped:", e);
    } catch {
    }
  }
}
return module.exports; }});
