/**
 * Workflow transition tests.
 *
 * Run: npx tsx src/lib/workflow.test.ts
 *
 * The two cases that matter most are marked — they are the bypasses that
 * existed in production code at commit 37c9a71.
 */

import assert from "node:assert/strict";

import {
  isValidTransition,
  requiredPreviousStage,
  transitionWhere,
  type WorkflowStage,
} from "./workflow";

let failures = 0;

function check(description: string, fn: () => void) {
  try {
    fn();
    console.log(`  ok   ${description}`);
  } catch (error) {
    failures += 1;
    console.error(
      `  FAIL ${description}\n       ${
        (error as Error).message
      }`
    );
  }
}

// --- the happy path, one step at a time ---

const chain: WorkflowStage[] = [
  "UPLOADED",
  "PENDING_DIRECTOR",
  "PENDING_PARTNERS",
  "PENDING_FINAL_DIRECTOR",
  "READY_FOR_IT",
  "COMPLETED",
];

for (let i = 0; i < chain.length - 1; i++) {
  check(`${chain[i]} → ${chain[i + 1]}`, () => {
    assert.equal(
      isValidTransition(chain[i], chain[i + 1]),
      true
    );
  });
}

// --- the bypasses that existed in production ---

check(
  "REGRESSION: PENDING_PARTNERS → READY_FOR_IT is rejected (Guru final is mandatory)",
  () => {
    assert.equal(
      isValidTransition("PENDING_PARTNERS", "READY_FOR_IT"),
      false
    );
  }
);

check(
  "REGRESSION: PENDING_DIRECTOR → READY_FOR_IT is rejected (partner review is mandatory)",
  () => {
    assert.equal(
      isValidTransition("PENDING_DIRECTOR", "READY_FOR_IT"),
      false
    );
  }
);

// --- other skips ---

check("UPLOADED → PENDING_PARTNERS is rejected", () => {
  assert.equal(
    isValidTransition("UPLOADED", "PENDING_PARTNERS"),
    false
  );
});

check("UPLOADED → COMPLETED is rejected", () => {
  assert.equal(
    isValidTransition("UPLOADED", "COMPLETED"),
    false
  );
});

check("PENDING_PARTNERS → COMPLETED is rejected", () => {
  assert.equal(
    isValidTransition("PENDING_PARTNERS", "COMPLETED"),
    false
  );
});

// --- no going backwards ---

check("READY_FOR_IT → PENDING_PARTNERS is rejected", () => {
  assert.equal(
    isValidTransition("READY_FOR_IT", "PENDING_PARTNERS"),
    false
  );
});

check("COMPLETED is terminal", () => {
  for (const stage of chain) {
    assert.equal(
      isValidTransition("COMPLETED", stage),
      false
    );
  }
});

// --- no self-transitions (guards against double-apply) ---

check("no stage transitions to itself", () => {
  for (const stage of chain) {
    assert.equal(isValidTransition(stage, stage), false);
  }
});

// --- the where-fragment helper ---

check(
  "transitionWhere('READY_FOR_IT') requires PENDING_FINAL_DIRECTOR",
  () => {
    assert.deepEqual(transitionWhere("READY_FOR_IT"), {
      workflowStage: "PENDING_FINAL_DIRECTOR",
    });
  }
);

check(
  "transitionWhere('PENDING_FINAL_DIRECTOR') requires PENDING_PARTNERS",
  () => {
    assert.deepEqual(
      transitionWhere("PENDING_FINAL_DIRECTOR"),
      { workflowStage: "PENDING_PARTNERS" }
    );
  }
);

check("UPLOADED cannot be reached by transition", () => {
  assert.equal(requiredPreviousStage("UPLOADED"), null);
  assert.throws(() => transitionWhere("UPLOADED"));
});

console.log(`\n${failures === 0 ? "all passed" : `${failures} failed`}`);

if (failures > 0) process.exit(1);
