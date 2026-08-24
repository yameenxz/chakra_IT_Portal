import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth";

type EmployeeUpload = {
  slNo: number;
  name: string;
  emailId: string;
  team?: string | null;
};

export async function GET() {
  const session =
    await getServerSession(authOptions);

  const role = (
    session?.user as {
      role?: string;
    }
  )?.role;

  if (
    role !== "IT" &&
    role !== "ADMIN" &&
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

  const employees =
    await prisma.employee.findMany({
      orderBy: {
        slNo: "asc",
      },
    });

  return NextResponse.json(
    employees
  );
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
    const employees: EmployeeUpload[] =
      await request.json();

    await prisma.employee.createMany({
      data: employees.map(
        (employee) => ({
          slNo: employee.slNo,
          name: employee.name,
          emailId:
            employee.emailId,
          team:
            employee.team ?? "",
          workflowStage:
            "UPLOADED",
        })
      ),
    });

    return NextResponse.json({
      success: true,
      imported:
        employees.length,
      skipped: 0,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to save employees",
      },
      {
        status: 500,
      }
    );
  }
}