import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const pendingDirectorEmployees =
      await prisma.employee.findMany({
        where: {
          workflowStage: "PENDING_DIRECTOR",
        },
      });

    if (pendingDirectorEmployees.length === 0) {
      return NextResponse.json({
        success: false,
        error:
          "No employees pending Guru approval.",
      });
    }

    const incompleteEmployees =
      pendingDirectorEmployees.filter(
        (employee) =>
          !employee.guruCommentEmail ||
          !employee.guruCommentOneDrive
      );

    if (incompleteEmployees.length > 0) {
      return NextResponse.json({
        success: false,
        error:
          "Please complete Guru decisions for all employees before submitting the batch.",
      });
    }

    for (const employee of pendingDirectorEmployees) {
      if (!employee.team) {
        return NextResponse.json({
          success: false,
          error: `${employee.name} does not have a team assigned.`,
        });
      }

      const reviewers =
        await prisma.user.findMany({
          where: {
            team: employee.team,
            isActive: true,
            role: {
              in: [
                "DIRECTOR",
                "PARTNER",
              ],
            },
          },
        });

      if (reviewers.length === 0) {
        return NextResponse.json({
          success: false,
          error: `No reviewers found for team ${employee.team}.`,
        });
      }

      await prisma.employee.update({
        where: {
          id: employee.id,
        },
        data: {
          workflowStage:
            "PENDING_PARTNERS",
          partnerAssignedAt:
            new Date(),
          partnerReminderSent: false,
        },
      });

      for (const reviewer of reviewers) {
        const existingApproval =
          await prisma.partnerApproval.findFirst({
            where: {
              employeeId:
                employee.id,
              partnerEmail:
                reviewer.email,
            },
          });

        if (!existingApproval) {
          await prisma.partnerApproval.create({
            data: {
              employeeId:
                employee.id,

              partnerEmail:
                reviewer.email,

              reviewerRole:
                reviewer.role,

              status: "PENDING",

              assignedAt:
                new Date(),
            },
          });

          await prisma.auditLog.create({
            data: {
              employeeId:
                employee.id,

              action:
                "Assigned To Reviewer",

              details:
                `${employee.name} assigned to ${reviewer.email} (${reviewer.role}) (${employee.team})`,

              performedBy:
                "Guru",
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      count:
        pendingDirectorEmployees.length,
      message:
        "Employees successfully assigned to Directors and Partners.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to submit batch",
      },
      {
        status: 500,
      }
    );
  }
}