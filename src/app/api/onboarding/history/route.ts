import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth";

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
    const logs =
      await prisma.onboardingAuditLog.findMany(
        {
          include: {
            onboardingEmployee: {
              select: {
                employeeName: true,
              },
            },
          },
          orderBy: {
            timestamp: "desc",
          },
        }
      );

    return NextResponse.json(
      logs
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to load onboarding audit history",
      },
      {
        status: 500,
      }
    );
  }
}