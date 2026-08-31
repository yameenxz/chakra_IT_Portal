import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth";

const ONBOARDING_TASKS = [
  {
    slNo: 1,
    stage: "Pre-Boarding",
    taskName: "Email ID Approval from Guru",
  },
  {
    slNo: 2,
    stage: "Pre-Boarding",
    taskName: "Life Group Assignment",
  },
  {
    slNo: 3,
    stage: "Onboard",
    taskName: "System Login",
  },
  {
    slNo: 4,
    stage: "Onboard",
    taskName: "Work / School Register",
  },
  {
    slNo: 5,
    stage: "Onboard",
    taskName: "Email Login",
  },
  {
    slNo: 6,
    stage: "Onboard",
    taskName: "VPN Configuration",
  },
  {
    slNo: 7,
    stage: "Onboard",
    taskName: "BitLocker Enabled",
  },
  {
    slNo: 8,
    stage: "Onboard",
    taskName: "Zoho Login",
  },
  {
    slNo: 9,
    stage: "Onboard",
    taskName: "Conditional Policy Apply",
  },
  {
    slNo: 10,
    stage: "Onboard",
    taskName: "Seqrite Antivirus Installation",
  },
  {
    slNo: 11,
    stage: "Onboard",
    taskName: "Mobile Access Denied",
  },
  {
    slNo: 12,
    stage: "Onboard",
    taskName: "Asset Assignment",
  },
  {
    slNo: 13,
    stage: "Onboard",
    taskName: "Group Assignment",
  },
];

export async function GET() {
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
    const employees =
      await prisma.onboardingEmployee.findMany({
        include: {
          tasks: {
            orderBy: {
              slNo: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(
      employees
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to load onboarding employees",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
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

    const employeeName =
      body.employeeName?.trim();

    if (!employeeName) {
      return NextResponse.json(
        {
          error:
            "Employee name is required",
        },
        {
          status: 400,
        }
      );
    }

    const employee =
      await prisma.onboardingEmployee.create({
        data: {
          employeeName,
        },
      });

    await prisma.onboardingAuditLog.create({
      data: {
        onboardingEmployeeId:
          employee.id,
        employeeName:
          employee.employeeName,
        action:
          "Employee Created",
        details: `Created onboarding employee record for ${employeeName}`,
        performedBy:
          session?.user?.name ||
          "System",
      },
    });

    await prisma.onboardingTask.createMany({
      data: ONBOARDING_TASKS.map(
        (task) => ({
          onboardingEmployeeId:
            employee.id,
          slNo: task.slNo,
          stage: task.stage,
          taskName: task.taskName,
          status: "Not Started",
        })
      ),
    });

    return NextResponse.json({
      success: true,
      employee,
    });
  } catch (error) {
    console.error(
      "ONBOARDING CREATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create onboarding employee",
      },
      {
        status: 500,
      }
    );
  }
}