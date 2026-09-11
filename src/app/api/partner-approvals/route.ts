import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";

/** Partner SLA in days. Was hardcoded inline as `>= 2`. */
const OVERDUE_AFTER_DAYS = Number(
  process.env.PARTNER_SLA_DAYS ?? 2
);

export async function GET() {
  const guard = await requireRole(
    "PARTNER",
    "DIRECTOR",
    "ADMIN"
  );
  if (!guard.ok) return guard.response;

  try {
    // C6: this returned every pending approval in the system to any reviewer,
    // with employee names, emails and teams. The partner page filtered to
    // "mine" in the browser — presentation, not access control. Filter here.
    const scopeToSelf = guard.role === "PARTNER";

    const approvals =
      await prisma.partnerApproval.findMany({
        where: {
          status: "PENDING",
          ...(scopeToSelf
            ? { partnerEmail: guard.email }
            : {}),
        },
        include: {
          employee: true,
        },
        orderBy: {
          assignedAt: "asc",
        },
      });

    const today = new Date();

    const data = approvals.map(
      (approval) => {
        const waitingDays =
          Math.floor(
            (today.getTime() -
              approval.assignedAt.getTime()) /
              (1000 * 60 * 60 * 24)
          );

        return {
          id: approval.id,

          employeeId:
            approval.employeeId,

          partnerEmail:
            approval.partnerEmail,

          batchName:
            approval.employee?.batchName ?? "",

          reviewerRole:
            approval.reviewerRole,

          status: approval.status,

          emailDecision:
            approval.emailDecision,

          oneDriveDecision:
            approval.oneDriveDecision,

          comment:
            approval.comment,

          employeeName:
            approval.employee?.name ??
            "Unknown Employee",

          employeeEmail:
            approval.employee?.emailId ??
            "",

          team:
            approval.employee?.team ??
            "",

          directorEmailDecision:
            approval.employee
              ?.guruCommentEmail ?? "",

          directorOneDriveDecision:
            approval.employee
              ?.guruCommentOneDrive ?? "",

          waitingDays,

          overdue:
            waitingDays >= OVERDUE_AFTER_DAYS,
        };
      }
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to load partner approvals",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
) {
  const guard = await requireRole(
    "PARTNER",
    "DIRECTOR",
    "ADMIN"
  );
  if (!guard.ok) return guard.response;

  try {
    const body =
      await request.json();

    if (typeof body.employeeId !== "string" || !body.employeeId) {
      return NextResponse.json(
        { error: "employeeId is required" },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------------------
    // C1 — THE APPROVER IS THE CALLER, NOT WHOEVER THE BODY SAYS.
    //
    // This previously used `body.partnerEmail`, so any authenticated reviewer
    // could record an APPROVED decision in another partner's name, with a
    // comment that partner never wrote, and nothing anywhere recorded who
    // actually submitted it.
    //
    // An ADMIN acting on someone else's behalf is a legitimate need, but it
    // must be deliberate and visible in the audit trail — see `actingFor`.
    // ---------------------------------------------------------------------
    const targetPartnerEmail =
      guard.role === "ADMIN" &&
      typeof body.partnerEmail === "string" &&
      body.partnerEmail
        ? body.partnerEmail.trim().toLowerCase()
        : guard.email;

    const actingForSomeoneElse =
      targetPartnerEmail !== guard.email;

    const result =
      await prisma.partnerApproval.updateMany({
        where: {
          employeeId:
            body.employeeId,
          partnerEmail:
            targetPartnerEmail,
          // Only a pending assignment can be approved. Without this, an
          // approval can be silently rewritten after the fact.
          status: "PENDING",
        },
        data: {
          status: "APPROVED",
          emailDecision:
            body.emailDecision,
          oneDriveDecision:
            body.oneDriveDecision,
          comment:
            body.comment,
          approvedAt:
            new Date(),
        },
      });

    // C5: updateMany returns a count and the original ignored it. A mismatched
    // employeeId or partnerEmail updated nothing and still returned success,
    // so the partner saw confirmation for an approval that was never recorded.
    if (result.count === 0) {
      return NextResponse.json(
        {
          error:
            "No pending approval found for you on this employee",
        },
        { status: 404 }
      );
    }

    // C7: the partner's own decision — the sign-off this module exists to
    // capture — wrote nothing to AuditLog. Assignment and completion were
    // logged; the decision itself was not.
    await prisma.auditLog.create({
      data: {
        employeeId: body.employeeId,
        action: "Partner Approval Recorded",
        details: actingForSomeoneElse
          ? `Approval recorded for ${targetPartnerEmail} BY ADMIN ${guard.email}. Email: ${body.emailDecision ?? "-"}, OneDrive: ${body.oneDriveDecision ?? "-"}`
          : `Email: ${body.emailDecision ?? "-"}, OneDrive: ${body.oneDriveDecision ?? "-"}`,
        performedBy: guard.email,
      },
    });

    // ---------------------------------------------------------------------
    // C4 — COMPLETENESS IS PER EMPLOYEE, NOT GLOBAL.
    //
    // This previously counted PENDING approvals across the whole database and
    // advanced every employee in PENDING_PARTNERS when that hit zero. So a
    // single stale PENDING row anywhere — a departed partner, an abandoned
    // review — stalled the entire workflow permanently, and when the count did
    // reach zero it advanced employees that had no approval rows at all.
    // ---------------------------------------------------------------------
    const employeeApprovals =
      await prisma.partnerApproval.findMany({
        where: { employeeId: body.employeeId },
        select: { status: true },
      });

    const allApproved =
      employeeApprovals.length > 0 &&
      employeeApprovals.every(
        (approval) => approval.status === "APPROVED"
      );

    if (allApproved) {
      const advanced =
        await prisma.employee.updateMany({
          where: {
            id: body.employeeId,
            // Re-assert the stage so a concurrent request can't advance twice.
            workflowStage: "PENDING_PARTNERS",
          },
          data: {
            workflowStage:
              "PENDING_FINAL_DIRECTOR",
          },
        });

      if (advanced.count > 0) {
        await prisma.auditLog.create({
          data: {
            employeeId: body.employeeId,
            action:
              "Partner Approvals Completed",
            details:
              "All assigned partner approvals received; moved to PENDING_FINAL_DIRECTOR",
            performedBy: guard.email,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      allApproved,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to save partner approval",
      },
      {
        status: 500,
      }
    );
  }
}
