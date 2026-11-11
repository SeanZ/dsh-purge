// 用户在真实实例上看到的「绿点 + 59/67，但三层红」：组里明明有 drifted，
// 汇总却因为"有一个 done"就返回 applied。这里把口径钉死。
import test from "node:test";
import assert from "node:assert/strict";
import {
  rollupDisplayStatus,
  tallyDisplayPatches,
  DISPLAY_ATTENTION,
} from "../lib/core.js";

test("a group with any drifted/partial member never rolls up to applied", () => {
  for (const bad of DISPLAY_ATTENTION) {
    assert.equal(rollupDisplayStatus(["applied", bad]), bad, `${bad} 必须冒泡`);
    assert.equal(
      rollupDisplayStatus(["applied", "applied", bad]),
      bad,
      `${bad} 必须冒泡（多条 applied 也不行）`,
    );
    assert.equal(rollupDisplayStatus([bad, "skipped"]), bad);
  }
});

test("clean groups keep their old meaning", () => {
  assert.equal(rollupDisplayStatus([]), "skipped");
  assert.equal(rollupDisplayStatus(["applied", "applied"]), "applied");
  // 已应用 + 声明跳过（例如 fileOptional 目标）仍然是 applied，别把正常组弄红。
  assert.equal(rollupDisplayStatus(["applied", "skipped"]), "applied");
  assert.equal(rollupDisplayStatus(["skipped", "skipped"]), "skipped");
  assert.equal(rollupDisplayStatus(["applied", "pending"]), "pending");
  assert.equal(rollupDisplayStatus(["applied", "unmatched"]), "unmatched");
});

test("attention rows are not counted as applied or as ready", () => {
  const rows = [
    { status: "applied" },
    { status: "applied" },
    { status: "drifted" },
    { status: "skipped" },
    { status: "pending" },
  ];
  const tally = tallyDisplayPatches(rows);
  assert.equal(tally.total, 5);
  assert.equal(tally.applied, 2);
  assert.equal(tally.attention, 1);
  assert.equal(tally.pending, 1);
  assert.equal(tally.skipped, 1);
  // 绿点数量必须等于真正落地的组数：2 applied + 1 skipped 而已，drifted 不算。
  assert.equal(tally.ready, 3);
  assert.equal(
    tally.applied + tally.attention + tally.pending + tally.skipped,
    tally.total,
  );
});

test("the CLI/report header can never print 67/67 while something is red", () => {
  const rows = Array.from({ length: 67 }, (_, i) => ({
    status: i < 66 ? "applied" : "drifted",
  }));
  const tally = tallyDisplayPatches(rows);
  assert.equal(tally.applied, 66);
  assert.equal(tally.attention, 1);
  assert.ok(
    tally.applied < tally.total,
    "存在未落地项时 applied 必须小于 total",
  );
});
