import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_TASKS = [
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
  try {
    const employees =
      await prisma.offboardingEmployee.findMany({
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
          "Failed to load employees",
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
  try {
    const {
      employeeName,
    } = await request.json();

    const employee =
      await prisma.offboardingEmployee.create({
        data: {
          employeeName,
          tasks: {
            create:
              DEFAULT_TASKS.map(
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
        include: {
          tasks: true,
        },
      });

    return NextResponse.json(
      employee
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to create employee",
      },
      {
        status: 500,
      }
    );
  }
}