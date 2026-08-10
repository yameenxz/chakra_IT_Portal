import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const result = await prisma.employee.updateMany({
      where: {
        workflowStage: "UPLOADED",
      },
      data: {
        workflowStage: "PENDING_DIRECTOR",
      },
    });

    await prisma.auditLog.create({
      data: {
        employeeId: (
          await prisma.employee.findFirst()
        )?.id ?? "",
        action: "Employees Sent For Approval",
        details: `${result.count} employees moved to PENDING_DIRECTOR`,
        performedBy: "System",
      },
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