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

  return NextResponse.json(employees);
}

export async function POST(
  request: Request
) {
  try {
    const employees: EmployeeUpload[] =
      await request.json();

    const existingEmployees =
      await prisma.employee.findMany({
        select: {
          emailId: true,
        },
      });

    const existingEmails = new Set(
      existingEmployees.map((employee) =>
        employee.emailId.toLowerCase()
      )
    );

    const newEmployees =
      employees.filter(
        (employee) =>
          !existingEmails.has(
            employee.emailId.toLowerCase()
          )
      );

    if (newEmployees.length > 0) {
      await prisma.employee.createMany({
        data: newEmployees.map(
          (employee) => ({
            ...employee,
            workflowStage:
              "UPLOADED",
          })
        ),
      });
    }

    return NextResponse.json({
      success: true,
      imported: newEmployees.length,
      skipped:
        employees.length -
        newEmployees.length,
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