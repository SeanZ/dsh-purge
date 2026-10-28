import { h } from "../shared/react.js";

/** 与状态接口共用目标身份，只展示当前实例，不提供多实例切换。 */
export function MaintenanceTarget({ status }) {
  const target = status?.maintenance_target;
  if (!target) return null;
  return h(
    "div",
    {
      className: "dshpp-hint",
      role: "status",
      style: { margin: "0 20px 10px", overflowWrap: "anywhere" },
    },
    h("strong", null, "应用范围：仅当前 Web 实例"),
    h("div", null, `Profile：${target.profile?.name || "未指定"}`),
    h("div", null, `宿主目录：${target.aiBase}`),
    h("div", null, `数据目录：${target.homes?.[0] || "未指定"}`),
  );
}
