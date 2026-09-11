import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

/**
 * Pending-work notification for the signed-in user.
 *
 * Two fixes here, both schema-compatible:
 *
 *  1. Previously returned `200 null` to anonymous callers instead of
 *     rejecting. Harmless in itself, but an endpoint that answers requests it
 *     should refuse is one refactor away from answering with data.
 *
 *  2. The DIRECTOR/PARTNER branch counted every PENDING PartnerApproval in
 *     the system, so a partner was told about work assigned to other people.
 *     Now scoped to their own queue.
 *
 * Server-side dismissal (replacing the sessionStorage flag in Navbar.tsx)
 * needs the notificationDismissedKey column — see NO-BROWSER-STORAGE.md.
 * That ships with the Stage 4 migration, not here.
 */
export async function GET() {
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;

  const role = guard.role;

  try {
    if (role === "GURU") {
      const pending = await prisma.employee.count({
        where: { workflowStage: "PENDING_DIRECTOR" },
      });

      if (pending > 0) {
        return NextResponse.json({
          title: "New Approval Request",
          message: `${pending} employees are waiting for your review.`,
          count: pending,
        });
      }
    }

    if (role === "DIRECTOR" || role === "PARTNER") {
      const pending = await prisma.partnerApproval.count({
        where: {
          status: "PENDING",
          // Scoped to this reviewer. A partner should not be prompted about
          // approvals assigned to someone else.
          ...(role === "PARTNER"
            ? { partnerEmail: guard.email }
            : {}),
        },
      });

      if (pending > 0) {
        return NextResponse.json({
          title: "Approval Queue",
          message: `${pending} approval requests require review.`,
          count: pending,
        });
      }
    }

    if (role === "IT_HEAD" || role === "ADMIN") {
      const pending = await prisma.laptopChangeRequest.count({
        where: { status: "PENDING_IT_HEAD" },
      });

      if (pending > 0) {
        return NextResponse.json({
          title: "Laptop Approval Required",
          message: `${pending} laptop requests are awaiting approval.`,
          count: pending,
        });
      }
    }

    return NextResponse.json(null);
  } catch (error) {
    console.error(error);
    return NextResponse.json(null);
  }
}
