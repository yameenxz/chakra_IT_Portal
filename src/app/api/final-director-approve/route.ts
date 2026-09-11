import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { transitionWhere } from "@/lib/workflow";

export async function POST(
  request: Request
) {
  const guard = await requireRole("GURU", "ADMIN");
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json();

    const employees: {
      id: string;
      finalGuruComment?: string | null;
    }[] = Array.isArray(body.employees)
      ? body.employees
      : [];

    if (employees.length === 0) {
      return NextResponse.json(
        { error: "No employees supplied" },
        { status: 400 }
      );
    }

    const ids = employees
      .map((item) => item.id)
      .filter(
        (id): id is string =>
          typeof id === "string" && id.length > 0
      );

    // ---------------------------------------------------------------------
    // C3 — ONLY EMPLOYEES ACTUALLY AWAITING FINAL REVIEW MAY BE APPROVED.
    //
    // The original updated by id with no stage check, so an employee could be
    // moved to READY_FOR_IT from UPLOADED or PENDING_PARTNERS — skipping
    // partner review entirely. It was also re-runnable, so the same approval
    // could be recorded twice (see A4 in the audit report).
    // ---------------------------------------------------------------------
    const eligible = await prisma.employee.findMany({
      where: {
        id: { in: ids },
        // Required previous stage comes from the state machine.
        ...transitionWhere("READY_FOR_IT"),
      },
      select: { id: true, name: true },
    });

    const eligibleIds = new Set(eligible.map((e) => e.id));

    const rejected = ids.filter(
      (id) => !eligibleIds.has(id)
    );

    if (eligible.length === 0) {
      return NextResponse.json(
        {
          error:
            "None of the supplied employees are awaiting final Guru review",
        },
        { status: 409 }
      );
    }

    const commentById = new Map(
      employees.map((item) => [
        item.id,
        item.finalGuruComment || null,
      ])
    );

    const nameById = new Map(
      eligible.map((e) => [e.id, e.name])
    );

    // Written as a single transaction so a failure partway cannot leave some
    // employees in READY_FOR_IT and the rest awaiting review.
    await prisma.$transaction([
      // A per-employee comment means one update each; the stage is re-asserted
      // in every where clause so a concurrent request cannot double-apply.
      ...eligible.map((employee) =>
        prisma.employee.update({
          where: {
            id: employee.id,
            ...transitionWhere("READY_FOR_IT"),
          },
          data: {
            workflowStage: "READY_FOR_IT",
            finalGuruComment:
              commentById.get(employee.id) ?? null,
          },
        })
      ),
      prisma.auditLog.createMany({
        data: eligible.map((employee) => {
          const comment = commentById.get(employee.id);
          return {
            employeeId: employee.id,
            action: "Final Guru Approval",
            details: comment
              ? `${nameById.get(employee.id)} approved for IT processing. Comment: ${comment}`
              : `${nameById.get(employee.id)} approved for IT processing`,
            performedBy: guard.email,
          };
        }),
      }),
    ]);

    return NextResponse.json({
      success: true,
      approved: eligible.length,
      // Tell the caller what was ignored rather than silently dropping it.
      skipped: rejected.length,
      skippedIds: rejected,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to submit final approval",
      },
      {
        status: 500,
      }
    );
  }
}
