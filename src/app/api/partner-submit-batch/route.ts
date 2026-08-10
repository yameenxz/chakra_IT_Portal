import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const employees =
      await prisma.employee.findMany({
        where: {
          workflowStage:
            "PENDING_PARTNERS",
        },
      });

    if (employees.length === 0) {
      return NextResponse.json({
        success: false,
        error:
          "No employees waiting for partner approval",
      });
    }

    let entireBatchApproved =
      true;

    for (const employee of employees) {
      const approvals =
        await prisma.partnerApproval.findMany({
          where: {
            employeeId:
              employee.id,
          },
        });

      const allApproved =
        approvals.length > 0 &&
        approvals.every(
          (approval) =>
            approval.status ===
            "APPROVED"
        );

      if (!allApproved) {
        entireBatchApproved =
          false;
        break;
      }
    }

    if (!entireBatchApproved) {
      return NextResponse.json({
        success: false,
        error:
          "Entire batch is not approved yet.",
      });
    }

    await prisma.employee.updateMany({
      where: {
        workflowStage:
          "PENDING_PARTNERS",
      },
      data: {
        workflowStage:
          "READY_FOR_IT",
      },
    });

    for (const employee of employees) {
      await prisma.auditLog.create({
        data: {
          employeeId:
            employee.id,
          action:
            "Partner Batch Approval Completed",
          details:
            `${employee.name} moved to READY_FOR_IT`,
          performedBy:
            "System",
        },
      });
    }

    return NextResponse.json({
      success: true,
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