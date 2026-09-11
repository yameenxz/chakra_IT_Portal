import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";

export async function POST() {
  // SECURITY: unauthenticated POST that advanced EVERY uploaded employee into
  // the approval workflow in one call.
  const guard = await requireRole("ADMIN", "IT");
  if (!guard.ok) return guard.response;

  try {
    // Capture the affected rows before updating, so the audit entry can name
    // them. The original recorded only a count.
    const toSend = await prisma.employee.findMany({
      where: { workflowStage: "UPLOADED" },
      select: { id: true },
    });

    if (toSend.length === 0) {
      return NextResponse.json({
        success: true,
        updated: 0,
        message: "No employees awaiting submission",
      });
    }

    const result = await prisma.employee.updateMany({
      where: {
        workflowStage: "UPLOADED",
      },
      data: {
        workflowStage: "PENDING_DIRECTOR",
      },
    });

    // AUDIT: the original attached this entry to
    //   (await prisma.employee.findFirst())?.id ?? ""
    // — an arbitrary employee unrelated to the action, or an empty string.
    // That makes the audit trail actively misleading. Write one entry per
    // employee actually moved, attributed to the authenticated user.
    await prisma.auditLog.createMany({
      data: toSend.map((employee) => ({
        employeeId: employee.id,
        action: "Employees Sent For Approval",
        details: `Moved to PENDING_DIRECTOR as part of a batch of ${result.count}`,
        performedBy: guard.email,
      })),
    });

    return NextResponse.json({
      success: true,
      updated: result.count,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to send employees for approval",
      },
      {
        status: 500,
      }
    );
  }
}
