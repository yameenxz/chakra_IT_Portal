import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { transitionWhere } from "@/lib/workflow";

export async function POST() {
  const guard = await requireRole(
    "PARTNER",
    "DIRECTOR",
    "ADMIN"
  );
  if (!guard.ok) return guard.response;

  try {
    const employees =
      await prisma.employee.findMany({
        where: {
          workflowStage:
            "PENDING_PARTNERS",
        },
        select: { id: true, name: true },
      });

    if (employees.length === 0) {
      return NextResponse.json({
        success: false,
        error:
          "No employees waiting for partner approval",
      });
    }

    // One query instead of one per employee (the original looped findMany).
    const approvals =
      await prisma.partnerApproval.findMany({
        where: {
          employeeId: {
            in: employees.map((e) => e.id),
          },
        },
        select: { employeeId: true, status: true },
      });

    const byEmployee = new Map<string, string[]>();
    for (const approval of approvals) {
      const list = byEmployee.get(approval.employeeId) ?? [];
      list.push(approval.status);
      byEmployee.set(approval.employeeId, list);
    }

    // An employee with NO approval rows must not count as approved.
    const notReady = employees.filter((employee) => {
      const statuses = byEmployee.get(employee.id) ?? [];
      return (
        statuses.length === 0 ||
        !statuses.every((status) => status === "APPROVED")
      );
    });

    if (notReady.length > 0) {
      // The original said only "Entire batch is not approved yet." Naming the
      // employees turns a dead end into something actionable.
      return NextResponse.json({
        success: false,
        error: `Not all partner approvals are in. Outstanding: ${notReady
          .map((e) => e.name)
          .join(", ")}`,
      });
    }

    const now = new Date();

    // ---------------------------------------------------------------------
    // C2 — ADVANCE TO PENDING_FINAL_DIRECTOR, NOT READY_FOR_IT.
    //
    // This previously set READY_FOR_IT, skipping the Guru Final Review stage
    // entirely — while the auto-advance path in partner-approvals correctly
    // set PENDING_FINAL_DIRECTOR. Two handlers, two different next stages, and
    // the shorter one bypassed a control in the documented workflow:
    //
    //   IT Upload → Guru Initial → Partner → Guru Final → IT Execution
    //
    // If partners are genuinely meant to be able to skip Guru final review,
    // that is a policy decision to make explicitly — not a divergence between
    // two code paths.
    // ---------------------------------------------------------------------
    await prisma.$transaction([
      prisma.employee.updateMany({
        where: {
          id: { in: employees.map((e) => e.id) },
          // Required previous stage comes from the state machine, so this
          // handler cannot be edited into skipping Guru final review.
          ...transitionWhere("PENDING_FINAL_DIRECTOR"),
        },
        data: {
          workflowStage: "PENDING_FINAL_DIRECTOR",
        },
      }),
      prisma.auditLog.createMany({
        data: employees.map((employee) => ({
          employeeId: employee.id,
          action:
            "Partner Batch Approval Completed",
          details: `${employee.name} moved to PENDING_FINAL_DIRECTOR`,
          performedBy: guard.email,
        })),
      }),
    ]);

    return NextResponse.json({
      success: true,
      count: employees.length,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to submit partner batch",
      },
      {
        status: 500,
      }
    );
  }
}
