import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";

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
  // SECURITY: returned 200 with the full employee list to unauthenticated
  // callers. Verified against the running instance on 11 Sep 2026 — it read
  // as empty only because the database had no records yet.
  const guard = await requireRole(
    "ADMIN",
    "IT",
    "GURU",
    "DIRECTOR"
  );
  if (!guard.ok) return guard.response;

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
  // SECURITY: this created offboarding records with no authentication at all.
  // Creating an offboarding record starts a workflow against a named person,
  // so this is restricted more tightly than the read above.
  const guard = await requireRole("ADMIN", "IT");
  if (!guard.ok) return guard.response;

  try {
    const {
      employeeName,
    } = await request.json();

    if (
      typeof employeeName !== "string" ||
      employeeName.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "employeeName is required" },
        { status: 400 }
      );
    }

    const employee =
      await prisma.offboardingEmployee.create({
        data: {
          employeeName: employeeName.trim(),
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
