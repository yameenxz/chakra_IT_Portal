/**
 * Boundary tests for batch naming.
 *
 * Run with any test runner; these are plain assertions with no framework
 * dependency, so `npx tsx src/lib/batch.test.ts` works if you'd rather not
 * add one yet.
 *
 * Every case below passes with the current implementation. They exist so that
 * the next person to touch the 15th-to-14th rule finds out immediately if
 * they've broken the rollover.
 */

import assert from "node:assert/strict";

import { getCurrentBatchName } from "./batch";

/** A given wall-clock time in Asia/Kolkata (UTC+5:30), expressed as UTC. */
function ist(
  year: number,
  month: number, // 1-based
  day: number,
  hour = 12,
  minute = 0
): Date {
  return new Date(
    Date.UTC(year, month - 1, day, hour - 5, minute - 30)
  );
}

const cases: Array<[Date, string, string]> = [
  // --- the boundary itself ---
  [ist(2026, 9, 14, 23, 59), "August 2026", "last minute of the August batch"],
  [ist(2026, 9, 15, 0, 0), "September 2026", "first minute of the September batch"],
  [ist(2026, 9, 15, 12, 0), "September 2026", "midday on the 15th"],
  [ist(2026, 9, 16), "September 2026", "day after the boundary"],

  // --- mid-batch ---
  [ist(2026, 9, 1), "August 2026", "start of calendar month is still the previous batch"],
  [ist(2026, 9, 30), "September 2026", "end of calendar month"],

  // --- year rollover ---
  [ist(2027, 1, 1), "December 2026", "New Year's Day belongs to December's batch"],
  [ist(2027, 1, 14, 23, 59), "December 2026", "last minute of December's batch"],
  [ist(2027, 1, 15), "January 2027", "January batch opens"],
  [ist(2026, 12, 31), "December 2026", "New Year's Eve"],

  // --- short and leap months ---
  [ist(2026, 3, 1), "February 2026", "1 March falls in February's batch"],
  [ist(2026, 3, 14), "February 2026", "14 March, last day of February's batch"],
  [ist(2028, 2, 29), "February 2028", "leap day, after the 15th"],
  [ist(2028, 3, 14), "February 2028", "February 2028 batch runs to 14 March"],

  // --- timezone independence ---
  // 15 Sep 00:30 IST is still 14 Sep 19:00 UTC. A host running UTC would have
  // computed "August" here; pinning the timezone means it does not.
  [new Date("2026-09-14T19:00:00Z"), "September 2026", "just past midnight IST, evening UTC"],
  // 14 Sep 23:00 IST is 17:30 UTC — still the August batch.
  [new Date("2026-09-14T17:30:00Z"), "August 2026", "late on the 14th IST"],
];

let failures = 0;

for (const [when, expected, description] of cases) {
  const actual = getCurrentBatchName(when);

  try {
    assert.equal(actual, expected);
    console.log(`  ok   ${description} → ${actual}`);
  } catch {
    failures += 1;
    console.error(
      `  FAIL ${description}\n       expected ${expected}, got ${actual}`
    );
  }
}

console.log(
  `\n${cases.length - failures}/${cases.length} passed`
);

if (failures > 0) {
  process.exit(1);
}
