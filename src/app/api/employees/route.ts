import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth";
import { getCurrentBatchName } from "@/lib/batch";

type EmployeeUpload = {
  slNo: number;
  name: string;
  emailId: string;
  team?: string | null;
};

const DEFAULT_OFFBOARDING_TASKS = [
  "Check Separation Form",
  "AD Account Block",
  "BitLocker Remove",
  "Data in Laptop",
  "Laptop Damage Check",
  "Azure Policy Remove",
  "Remove from LIFE Group",
  "Update in Asset",
];

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

    const latestEmployee =
      await prisma.employee.findFirst({
        orderBy: {
          slNo: "desc",
        },
      });

    let nextSlNo =
      (latestEmployee?.slNo ?? 0) + 1;

    const batchName =
      getCurrentBatchName();

    await prisma.employee.createMany({
      data: employees.map(
        (employee) => ({
          slNo:
            employee.slNo > 0
              ? employee.slNo
              : nextSlNo++,
          name: employee.name,
          emailId:
            employee.emailId,
          team:
            employee.team ?? "",
          workflowStage:
            "UPLOADED",
          batchName,
        })
      ),
    });

    for (const employee of employees) {
      await prisma.offboardingEmployee.create({
        data: {
          employeeName:
            employee.name,

          team:
            employee.team ?? "",

          tasks: {
            create:
              DEFAULT_OFFBOARDING_TASKS.map(
                (
                  taskName,
                  index
                ) => ({
                  slNo:
                    index + 1,
                  stage:
                    "Offboarding",
                  taskName,
                  status:
                    "Not Started",
                })
              ),
          },
        },
      });
    }

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