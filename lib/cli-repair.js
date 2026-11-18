import * as desktop from "./desktop.js";
import { adapterFor, detectSurface } from "./surface.js";

/** Web 没有桌面 CLI；显式指定桌面目标时仍执行完整检查。 */
export function repairOfficialCliAfterUnpack(exe) {
  if (exe === undefined && adapterFor(detectSurface()) !== "desktop") {
    return { ok: true, skipped: "not_desktop" };
  }
  try {
    return desktop.repairOfficialCliAfterUnpack(exe);
  } catch (error) {
    return { ok: false, error: String(error?.message ?? error) };
  }
}
