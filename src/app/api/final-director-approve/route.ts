import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request
) {
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
          "Final Director Approval",

        details:
          body.finalGuruComment
            ? `${employee.name} approved for IT processing. Comment: ${body.finalGuruComment}`
            : `${employee.name} approved for IT processing`,

        performedBy: "Director",
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