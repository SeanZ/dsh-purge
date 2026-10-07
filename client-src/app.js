import { zh } from "./locale-zh.js";
import { en } from "./locale-en.js";
import { NS, setTranslate } from "./common.js";

import { SettingsRoot } from "./theme-settings.js";
import { installRewindUi } from "./rewind.js";
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dsh-purge: dictionaries");
  const t = ctx.locale.bind(NS);
  setTranslate(t);
  ctx.slots.inject("settings.section", () =>
    ctx.slots.register(
      {
        name: "settings.section",
        id: "dsh-purge",
        order: 40,
        label: () => t("nav"),
        locale: NS,
        inject: () => ({ t }),
      },
      SettingsRoot,
    ),
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
      /* ignore */
    }
  }
}

export { apply };
export { name, inject } from "./common.js";
