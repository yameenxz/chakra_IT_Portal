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

    const employees =
      body.employees ?? [];

    for (const item of employees) {
      await prisma.employee.update({
        where: {
          id: item.id,
        },
        data: {
          workflowStage:
            "READY_FOR_IT",

          finalGuruComment:
            item.finalGuruComment ||
            null,
        },
      });

      const employee =
        await prisma.employee.findUnique({
          where: {
            id: item.id,
          },
        });

      if (employee) {
        await prisma.auditLog.create({
          data: {
            employeeId:
              employee.id,

            action:
              "Final Guru Approval",

            details:
              item.finalGuruComment
                ? `${employee.name} approved for IT processing. Comment: ${item.finalGuruComment}`
                : `${employee.name} approved for IT processing`,

            performedBy:
              session?.user?.email ??
              "Guru",
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
          "Failed to submit batch",
      },
      {
        status: 500,
      }
    );
  }
}