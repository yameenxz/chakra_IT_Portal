import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const existingEmployee =
      await prisma.employee.findUnique({
        where: {
          id,
        },
      });

    const shouldSaveDirectorDecision =
      body.guruCommentEmail &&
      body.guruCommentOneDrive;

    const employee =
      await prisma.employee.update({
        where: {
          id,
        },
        data: {
          ...(body.guruCommentEmail && {
            guruCommentEmail:
              body.guruCommentEmail,
          }),

          ...(body.guruCommentOneDrive && {
            guruCommentOneDrive:
              body.guruCommentOneDrive,
          }),

          ...(body.statusByIT && {
            statusByIT:
              body.statusByIT,
          }),

          ...(body.workflowStage && {
            workflowStage:
              body.workflowStage,
          }),

          ...(shouldSaveDirectorDecision && {
            directorApprovedAt:
              new Date(),
          }),

          ...(body.statusByIT ===
            "COMPLETED" && {
            workflowStage:
              "COMPLETED",

            completedAt:
              new Date(),
          }),
        },
      });

    let action =
      "Employee Updated";

    let details =
      `${existingEmployee?.name ?? "Employee"} updated`;

    if (shouldSaveDirectorDecision) {
      action =
        "Director Decision Saved";

      details =
        `${employee.name} director review saved`;
    }

    if (
      body.statusByIT ===
      "STARTED_DOWNLOAD"
    ) {
      action =
        "IT Download Started";

      details =
        `${employee.name} marked as STARTED_DOWNLOAD`;
    }

    if (
      body.statusByIT ===
      "HOLD"
    ) {
      action =
        "IT Processing On Hold";

      details =
        `${employee.name} placed on HOLD`;
    }

    if (
      body.statusByIT ===
      "COMPLETED"
    ) {
      action =
        "Offboarding Completed";

      details =
        `${employee.name} offboarding process completed`;
    }

    await prisma.auditLog.create({
      data: {
        employeeId:
          employee.id,

        action,

        details,

        performedBy:
          "System",
      },
    });

    return NextResponse.json(
      employee
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Update failed",
      },
      {
        status: 500,
      }
    );
  }
}