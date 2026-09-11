/**
 * Workflow state machine for the employee email-deletion process.
 *
 * The documented process is:
 *
 *   UPLOADED
 *     → PENDING_DIRECTOR          (Guru initial review)
 *     → PENDING_PARTNERS          (partner review)
 *     → PENDING_FINAL_DIRECTOR    (Guru FINAL review — mandatory)
 *     → READY_FOR_IT              (IT execution)
 *     → COMPLETED
 *
 * Guru final approval is mandatory: there is no legitimate path from
 * PENDING_PARTNERS straight to READY_FOR_IT.
 *
 * Two handlers previously disagreed about this. `partner-submit-batch` set
 * READY_FOR_IT directly (skipping the Guru), while the auto-advance in
 * `partner-approvals` correctly set PENDING_FINAL_DIRECTOR. Separately,
 * `final-director-approve` set READY_FOR_IT without checking the current
 * stage at all, so partner review could be skipped from the other side.
 *
 * Fixing those two call sites is necessary but not sufficient — the next
 * handler someone writes has nothing stopping it making the same mistake.
 * This module is the single place the rule lives. Route handlers should use
 * `assertTransition` (or `transitionWhere`) rather than writing a stage
 * literal into a Prisma call.
 */

export type WorkflowStage =
  | "UPLOADED"
  | "PENDING_DIRECTOR"
  | "PENDING_PARTNERS"
  | "PENDING_FINAL_DIRECTOR"
  | "READY_FOR_IT"
  | "COMPLETED";

/** The only stage each stage may advance to. */
const ALLOWED_TRANSITIONS: Record<
  WorkflowStage,
  readonly WorkflowStage[]
> = {
  UPLOADED: ["PENDING_DIRECTOR"],
  PENDING_DIRECTOR: ["PENDING_PARTNERS"],
  PENDING_PARTNERS: ["PENDING_FINAL_DIRECTOR"],
  PENDING_FINAL_DIRECTOR: ["READY_FOR_IT"],
  READY_FOR_IT: ["COMPLETED"],
  COMPLETED: [],
};

/**
 * Which stage an employee must currently be in to legitimately reach `to`.
 * There is exactly one for every stage in this workflow.
 */
export function requiredPreviousStage(
  to: WorkflowStage
): WorkflowStage | null {
  for (const [from, targets] of Object.entries(
    ALLOWED_TRANSITIONS
  ) as [WorkflowStage, readonly WorkflowStage[]][]) {
    if (targets.includes(to)) return from;
  }
  return null;
}

export function isValidTransition(
  from: WorkflowStage,
  to: WorkflowStage
): boolean {
  return (
    ALLOWED_TRANSITIONS[from]?.includes(to) ?? false
  );
}

/**
 * Throws if the transition is not permitted. Use in handlers that have already
 * loaded the employee and want to fail loudly.
 */
export function assertTransition(
  from: WorkflowStage,
  to: WorkflowStage
): void {
  if (!isValidTransition(from, to)) {
    throw new WorkflowTransitionError(from, to);
  }
}

export class WorkflowTransitionError extends Error {
  readonly from: WorkflowStage;
  readonly to: WorkflowStage;

  constructor(from: WorkflowStage, to: WorkflowStage) {
    super(
      `Illegal workflow transition: ${from} → ${to}. ` +
        `${to} may only be reached from ${
          requiredPreviousStage(to) ?? "nowhere"
        }.`
    );
    this.name = "WorkflowTransitionError";
    this.from = from;
    this.to = to;
  }
}

/**
 * Prisma `where` fragment that makes an illegal transition match zero rows.
 *
 * Spreading this into an update/updateMany means the database enforces the
 * sequence, and a concurrent request cannot apply the same transition twice:
 *
 *   await prisma.employee.updateMany({
 *     where: { id: { in: ids }, ...transitionWhere("READY_FOR_IT") },
 *     data:  { workflowStage: "READY_FOR_IT" },
 *   });
 *
 * Check the returned `count` — a zero means the employees were not in the
 * expected stage, which is a 409, not a success.
 */
export function transitionWhere(
  to: WorkflowStage
): { workflowStage: WorkflowStage } {
  const from = requiredPreviousStage(to);

  if (!from) {
    throw new Error(
      `No stage transitions to ${to}; it cannot be set by a transition.`
    );
  }

  return { workflowStage: from };
}

/** Human-readable stage names, for error messages and UI. */
export const STAGE_LABELS: Record<WorkflowStage, string> = {
  UPLOADED: "Uploaded",
  PENDING_DIRECTOR: "Pending Guru initial review",
  PENDING_PARTNERS: "Pending partner review",
  PENDING_FINAL_DIRECTOR: "Pending Guru final review",
  READY_FOR_IT: "Ready for IT execution",
  COMPLETED: "Completed",
};
