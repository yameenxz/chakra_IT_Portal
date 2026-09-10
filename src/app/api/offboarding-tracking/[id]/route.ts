import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth";

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const session =
    await getServerSession(
      authOptions
    );

  const role =
    (session?.user as {
      role?: string;
    })?.role;

  if (
  role !== "IT" &&
  role !== "IT_HEAD" &&
  role !== "ADMIN"
)  {
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
    const { id } =
      await context.params;

    const employee =
      await prisma.offboardingEmployee.findUnique(
        {
          where: {
            id,
          },
        }
      );

    if (!employee) {
      return NextResponse.json(
        {
          error:
            "Employee not found",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.offboardingAuditLog.create(
      {
        data: {
          offboardingEmployeeId:
            employee.id,
          employeeName:
            employee.employeeName,
          action:
            "Employee Deleted",
          details: `Deleted offboarding employee record for ${employee.employeeName}`,
          performedBy:
            session?.user?.name ??
            "System",
        },
      }
    );

    await prisma.offboardingEmployee.delete(
      {
        where: {
          id,
        },
      }
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to delete employee",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const session =
    await getServerSession(
      authOptions
    );

  const role =
    (session?.user as {
      role?: string;
    })?.role;

  if (
  role !== "IT" &&
  role !== "IT_HEAD" &&
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
    const { id } =
      await context.params;

    const employee =
      await prisma.offboardingEmployee.findUnique(
        {
          where: {
            id,
          },
        }
      );

    if (!employee) {
      return NextResponse.json(
        {
          error:
            "Employee not found",
        },
        {
          status: 404,
        }
      );
    }

    const body =
      await request.json();

    if (
      Array.isArray(body.tasks)
    ) {
      for (const task of body.tasks) {
        const existingTask =
          await prisma.offboardingTask.findUnique(
            {
              where: {
                id: task.id,
              },
            }
          );

        if (!existingTask) {
          continue;
        }

        if (
          existingTask.status !==
          task.status
        ) {
          await prisma.offboardingAuditLog.create(
            {
              data: {
                offboardingEmployeeId:
                  id,
                employeeName:
                  employee.employeeName,
                action:
                  "Task Status Updated",
                details: `${existingTask.taskName} changed from ${existingTask.status} to ${task.status}`,
                performedBy:
                  session?.user?.name ??
                  "System",
              },
            }
          );
        }

        if (
          (existingTask.assignedTo ??
            "") !==
          (task.assignedTo ?? "")
        ) {
          await prisma.offboardingAuditLog.create(
            {
              data: {
                offboardingEmployeeId:
                  id,
                employeeName:
                  employee.employeeName,
                action:
                  "Owner Assigned",
                details: `${existingTask.taskName} assigned to ${task.assignedTo || "Unassigned"}`,
                performedBy:
                  session?.user?.name ??
                  "System",
              },
            }
          );
        }

        await prisma.offboardingTask.update(
          {
            where: {
              id: task.id,
            },
            data: {
              status:
                task.status,
              assignedTo:
                task.assignedTo ||
                null,
            },
          }
        );
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
          "Failed to update offboarding tasks",
      },
      {
        status: 500,
      }
    );
  }
}