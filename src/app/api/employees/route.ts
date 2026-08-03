import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const employees = await prisma.employee.findMany({
    orderBy: {
      slNo: "asc",
    },
  });

  return NextResponse.json(employees);
}

export async function POST(request: Request) {
  const employees = await request.json();

  await prisma.employee.deleteMany();

  await prisma.employee.createMany({
    data: employees,
  });

  return NextResponse.json({
    success: true,
  });
}