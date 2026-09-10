import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session =
    await getServerSession(authOptions);

  const role = (
    session?.user as {
      role?: string;
    }
  )?.role;

  if (
  role !== "ADMIN" &&
  role !== "IT" &&
  role !== "IT_HEAD" &&
  role !== "GURU"
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
        "Guru Decision Saved";

      details =
        `${employee.name} guru review saved`;
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
          session?.user?.email ??
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