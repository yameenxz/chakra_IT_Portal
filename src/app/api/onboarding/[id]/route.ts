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
    const body =
      await request.json();

    if (
      Array.isArray(
        body.tasks
      )
    ) {
      for (const task of body.tasks) {
        await prisma.onboardingTask.update(
          {
            where: {
              id: task.id,
            },
            data: {
  status: task.status,
  azureTeam: task.azureTeam || null,
  seqriteTeam: task.seqriteTeam || null,
  assignedTo: task.assignedTo || null,
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