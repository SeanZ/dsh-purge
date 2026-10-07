/** 限定 PE 的适用请求；未知枚举直接报错，避免静默扩大范围。 */
export function validatePromptScope(config) {
  if (!["all", "root"].includes(config.promptScope))
    throw new TypeError("promptScope must be all or root");
}

export function promptAllowed(config, context, assembly) {
  if (config.enabled === false) return false;
  if (config.promptScope !== "root") return true;
  const session = context?.agent?.session || context?.session;
  if (!session || !session.header || session.header.origin === "subagent")
    return false;
  const events =
    typeof session.snapshotEvents === "function"
      ? session.snapshotEvents()
      : session.events;
  if (
    Array.isArray(events) &&
    events.some((event) => event?.type === "subagent/descriptor")
  )
    return false;
  return !(assembly?.sections || []).some(
    (section) =>
      section?.complete === true ||
      [
        "tavern:card-system",
        "tavern:card-reference",
        "tavern:resource-workspace",
      ].includes(section?.name),
  );
}

/** 不在范围内只撤回本插件贡献，不改其它插件的输出契约。 */
export function withoutPurgeSections(assembly) {
  if (!Array.isArray(assembly?.sections)) return assembly;
  assembly.sections = assembly.sections.filter(
    (section) => !String(section?.name || "").startsWith("dsh-purge"),
  );
  return assembly;
}
