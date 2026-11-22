// Upstream #188 (general part): a file that exists but no longer contains the
// anchor used to be reported as "skipped" — a soft success — so a host upgrade
// could silently disable a patch while the status page stayed green.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { patchStatusDetail, patchStatusReady, patchDrift } from "../lib/core.js";
import { tallyPatchStatus } from "../lib/selfcheck.js";
import { recordRuntimeEvidence } from "../lib/runtime-evidence.js";
import { removeTreeNoFollowSync } from "../lib/remove-tree.js";

const MISSING_ANCHOR = {
  id: 959,
  name: "SYNTHETIC_DRIFT",
  layer: "代码",
  optional: true,
  file: ["pi-ai-responses-shared"],
  replacements: [{ pattern: "const goneAnchor = 1;", replace: "const replaced = 2;" }],
  markers: ["[dsh-purge] synthetic drift"],
};

function fixture(text) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "purge-drift-"));
  const app = path.join(root, "app");
  const host = path.join(app, "node_modules/@deepseek-ai");
  const pi = path.join(app, "node_modules/@earendil-works/pi-ai/dist/api");
  const home = path.join(root, "home");
  for (const dir of [host, pi, home]) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(pi, "openai-responses-shared.js"), text);
  return { root, host, home, close: () => removeTreeNoFollowSync(root) };
}

test("a file without the anchor is drifted, not skipped", async () => {
  const f = fixture("export const unrelated = 1;\n");
  try {
    const opts = { dshHome: f.home, surface: "desktop" };
    const report = await patchStatusDetail(f.host, [MISSING_ANCHOR], opts);
    assert.equal(report.status[959], "drifted");
    assert.equal(report.files[959][0].status, "drifted");
    assert.equal(patchStatusReady("drifted", MISSING_ANCHOR), false);
    assert.equal(tallyPatchStatus(report.status, [MISSING_ANCHOR]).partial, 0);

    const drift = await patchDrift(f.host, [MISSING_ANCHOR], opts);
    assert.equal(drift.optionalDrift.length, 1);
    assert.equal(drift.optionalDrift[0].id, 959);
  } finally {
    f.close();
  }
});

// 0.2.3-alpha.1 把几条旧规则的机制换成了原生实现：锚点必须不在、替代机制的痕迹必须在，
// 才报 superseded。既不能把"新版不需要"长期显示成红色漂移，也不能在锚点还在时假装完成。
const SUPERSEDED = {
  ...MISSING_ANCHOR,
  id: 962,
  name: "SYNTHETIC_SUPERSEDED",
  optional: false,
  supersededBy: {
    since: "0.2.3-alpha.1",
    by: "原生增量提交",
    native: ["nativeReplacement"],
    note: "宿主自己接管了这条规则。",
  },
};

test("a vanished anchor with the native replacement present is superseded, not drifted", async () => {
  const f = fixture("export const nativeReplacement = 1;\n");
  try {
    const opts = { dshHome: f.home, surface: "desktop" };
    const report = await patchStatusDetail(f.host, [SUPERSEDED], opts);
    assert.equal(report.status[962], "superseded");
    assert.equal(report.files[962][0].status, "superseded");
    // 不是故障，也不是本插件写进去的。
    assert.equal(patchStatusReady("superseded", SUPERSEDED), true);
    const tally = tallyPatchStatus(report.status, [SUPERSEDED]);
    assert.equal(tally.total, 0);
    assert.equal(tally.not_applicable, 1);
    assert.equal(tally.superseded, 1);
    const drift = await patchDrift(f.host, [SUPERSEDED], opts);
    assert.equal(drift.drifted.length, 0);
    assert.equal(drift.optionalDrift.length, 0);
    assert.equal(drift.superseded.length, 1);
    assert.equal(drift.superseded[0].id, 962);
    assert.equal(drift.superseded[0].since, "0.2.3-alpha.1");
  } finally {
    f.close();
  }
});

// 宿主换成原生机制 ≠ 行为已经补回：像 #40 这样靠插件运行时补回行为的条目，
// 必须拿到运行时挂载证据。没装 guard 的宿主仍然要报未完成，不能显示成已接管。
const RUNTIME_SUPERSEDED = {
  ...MISSING_ANCHOR,
  id: 963,
  name: "SYNTHETIC_RUNTIME_SUPERSEDED",
  optional: false,
  supersededBy: {
    since: "0.2.3-alpha.1",
    by: "运行时组合",
    native: ["nativeReplacement"],
    requiresRuntime: "completeComposition",
    note: "宿主换了机制，行为由插件运行时补回。",
  },
};

test("supersededBy.requiresRuntime stays drifted until the runtime composition is mounted", async () => {
  const f = fixture("export const nativeReplacement = 1;\n");
  try {
    const opts = { dshHome: f.home, surface: "desktop" };
    // 宿主源码看起来已经换了机制，但运行时没有挂载证据：功能仍然缺失。
    assert.equal((await patchStatusDetail(f.host, [RUNTIME_SUPERSEDED], opts)).status[963], "drifted");
    assert.equal((await patchDrift(f.host, [RUNTIME_SUPERSEDED], opts)).drifted.some((p) => p.id === 963), true);

    recordRuntimeEvidence(f.home, "completeComposition", true);
    const mounted = await patchStatusDetail(f.host, [RUNTIME_SUPERSEDED], opts);
    assert.equal(mounted.status[963], "superseded");
    assert.equal(patchStatusReady("superseded", RUNTIME_SUPERSEDED), true);
  } finally {
    f.close();
  }
});

test("superseded never masks a real anchor or an absent native mechanism", async () => {
  const anchorPresent = fixture("const goneAnchor = 1;\n");
  const unrelated = fixture("export const unrelated = 1;\n");
  try {
    const opts = { dshHome: anchorPresent.home, surface: "desktop" };
    // 锚点还在 → 仍然待应用，不能被 superseded 吞掉。
    assert.equal((await patchStatusDetail(anchorPresent.host, [SUPERSEDED], opts)).status[962], "pending");
    // 锚点不在、替代机制也不在 → 仍然是漂移。
    const report = await patchStatusDetail(unrelated.host, [SUPERSEDED], { dshHome: unrelated.home, surface: "desktop" });
    assert.equal(report.status[962], "drifted");
  } finally {
    anchorPresent.close();
    unrelated.close();
  }
});

test("silentWhenMissing and self-marked patches keep reporting skipped", async () => {
  const f = fixture("export const unrelated = 1;\n");
  try {
    const opts = { dshHome: f.home, surface: "desktop" };
    const silent = { ...MISSING_ANCHOR, id: 960, name: "SYNTHETIC_SILENT", silentWhenMissing: true };
    const selfMarked = { ...MISSING_ANCHOR, id: 961, name: "SYNTHETIC_SELF",
      replacements: [{ pattern: "// [dsh-purge] already here", replace: "x" }] };
    const report = await patchStatusDetail(f.host, [silent, selfMarked], opts);
    assert.equal(report.status[960], "skipped");
    assert.equal(report.status[961], "skipped");
  } finally {
    f.close();
  }
});
