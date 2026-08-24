import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth";

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
    role !== "GURU" &&
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
    const body = await request.json();

    const employee =
      await prisma.employee.findUnique({
        where: {
          id: body.employeeId,
        },
      });

    if (!employee) {
      return NextResponse.json(
        {
          error: "Employee not found",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.employee.update({
      where: {
        id: employee.id,
      },
      data: {
        workflowStage: "READY_FOR_IT",

        finalGuruComment:
          body.finalGuruComment || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        employeeId: employee.id,

        action:
          "Final Guru Approval",

        details:
          body.finalGuruComment
            ? `${employee.name} approved for IT processing. Comment: ${body.finalGuruComment}`
            : `${employee.name} approved for IT processing`,

        performedBy:
          session?.user?.email ??
          "Guru",
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to approve employee",
      },
      {
        status: 500,
      }
    );
  }
}