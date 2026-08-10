import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const approvals =
      await prisma.partnerApproval.findMany({
        where: {
          status: "PENDING",
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
          employeeId: approval.employeeId,
          partnerEmail: approval.partnerEmail,
          status: approval.status,
          emailDecision:
            approval.emailDecision,
          oneDriveDecision:
            approval.oneDriveDecision,
          comment: approval.comment,
          employeeName:
            approval.employee?.name ??
            "Unknown Employee",
          waitingDays,
          overdue: waitingDays >= 4,
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
  try {
    const body =
      await request.json();

    await prisma.partnerApproval.updateMany({
      where: {
        employeeId:
          body.employeeId,
        partnerEmail:
          body.partnerEmail,
      },
      data: {
        status: "APPROVED",
        emailDecision:
          body.emailDecision,
        oneDriveDecision:
          body.oneDriveDecision,
        comment: body.comment,
        approvedAt:
          new Date(),
      },
    });

    const pendingApprovals =
      await prisma.partnerApproval.count({
        where: {
          status: "PENDING",
        },
      });

    if (pendingApprovals === 0) {
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

      const employees =
        await prisma.employee.findMany({
          where: {
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
              "All Partner Approvals Completed",
            details:
              `${employee.name} moved to READY_FOR_IT`,
            performedBy:
              "System",
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
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