import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth";

export async function GET() {
  const session =
    await getServerSession(authOptions);

  const role = (
    session?.user as {
      role?: string;
    }
  )?.role;

  if (
    role !== "PARTNER" &&
    role !== "DIRECTOR" &&
    role !== "ADMIN"
  ) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 403,
      }
    );
  }

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

          employeeId:
            approval.employeeId,

          partnerEmail:
            approval.partnerEmail,

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
            waitingDays >= 2,
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
  const session =
    await getServerSession(authOptions);

  const role = (
    session?.user as {
      role?: string;
    }
  )?.role;

  if (
    role !== "PARTNER" &&
    role !== "DIRECTOR" &&
    role !== "ADMIN"
  ) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 403,
      }
    );
  }

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
        comment:
          body.comment,
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
      const employees =
        await prisma.employee.findMany({
          where: {
            workflowStage:
              "PENDING_PARTNERS",
          },
        });

      for (const employee of employees) {
        await prisma.employee.update({
          where: {
            id: employee.id,
          },
          data: {
            workflowStage:
              "PENDING_FINAL_DIRECTOR",
          },
        });

        await prisma.auditLog.create({
          data: {
            employeeId:
              employee.id,

            action:
              "Partner Approvals Completed",

            details:
              `${employee.name} moved to PENDING_FINAL_DIRECTOR`,

            performedBy:
              session?.user?.email ??
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