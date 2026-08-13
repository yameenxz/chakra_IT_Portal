import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type EmployeeUpload = {
  slNo: number;
  name: string;
  emailId: string;
  team?: string | null;
};

export async function GET() {
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