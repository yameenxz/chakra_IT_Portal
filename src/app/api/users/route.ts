import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth";

export async function GET() {
  const session =
    await getServerSession(authOptions);

  const role = (
    session?.user as {
      role?: string;
    }
  )?.role;

  if (
    role !== "ADMIN" &&
    role !== "IT" &&
    role !== "GURU" &&
    role !== "DIRECTOR" &&
    role !== "PARTNER"
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
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        team: true,
        isActive: true,
      },
      orderBy: [
        {
          role: "asc",
        },
        {
          name: "asc",
        },
      ],
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch users",
      },
      {
        status: 500,
      }
    );
  }
}