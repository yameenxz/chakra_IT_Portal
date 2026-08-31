import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth";

export async function GET(
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

  if (!session) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const { id } =
      await context.params;

    const employee =
      await prisma.onboardingEmployee.findUnique(
        {
          where: {
            id,
          },
          include: {
            tasks: {
              orderBy: {
                slNo: "asc",
              },
            },
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

    return NextResponse.json(
      employee
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to load employee",
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
      await prisma.onboardingEmployee.findUnique(
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
          await prisma.onboardingTask.findUnique(
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
          await prisma.onboardingAuditLog.create(
            {
              data: {
                onboardingEmployeeId:
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
          await prisma.onboardingAuditLog.create(
            {
              data: {
                onboardingEmployeeId:
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

        if (
          (existingTask.azureTeam ??
            "") !==
          (task.azureTeam ?? "")
        ) {
          await prisma.onboardingAuditLog.create(
            {
              data: {
                onboardingEmployeeId:
                  id,
                employeeName:
                  employee.employeeName,
                action:
                  "Azure Team Assigned",
                details: `${existingTask.taskName} Azure Team changed to ${task.azureTeam || "None"}`,
                performedBy:
                  session?.user?.name ??
                  "System",
              },
            }
          );
        }

        if (
          (existingTask.seqriteTeam ??
            "") !==
          (task.seqriteTeam ?? "")
        ) {
          await prisma.onboardingAuditLog.create(
            {
              data: {
                onboardingEmployeeId:
                  id,
                employeeName:
                  employee.employeeName,
                action:
                  "Seqrite Team Assigned",
                details: `${existingTask.taskName} Seqrite Team changed to ${task.seqriteTeam || "None"}`,
                performedBy:
                  session?.user?.name ??
                  "System",
              },
            }
          );
        }

        await prisma.onboardingTask.update(
          {
            where: {
              id: task.id,
            },
            data: {
              status:
                task.status,
              azureTeam:
                task.azureTeam ||
                null,
              seqriteTeam:
                task.seqriteTeam ||
                null,
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
          "Failed to update onboarding tasks",
      },
      {
        status: 500,
      }
    );
  }
}

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
      await prisma.onboardingEmployee.findUnique(
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

    await prisma.onboardingAuditLog.create(
      {
        data: {
          onboardingEmployeeId:
            employee.id,
          employeeName:
            employee.employeeName,
          action:
            "Employee Deleted",
          details: `Deleted onboarding employee record for ${employee.employeeName}`,
          performedBy:
            session?.user?.name ??
            "System",
        },
      }
    );

    await prisma.onboardingEmployee.delete(
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