import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth";

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const session =
    await getServerSession(authOptions);

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
    const { id } =
      await context.params;

    const license =
      await prisma.license.findUnique({
        where: {
          id,
        },
      });

    if (!license) {
      return NextResponse.json(
        {
          error:
            "License not found",
        },
        {
          status: 404,
        }
      );
    }

    const history =
      await prisma.licenseRenewalHistory.findMany({
        where: {
          licenseId: id,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

    return NextResponse.json({
      licenseName:
        license.productName,
      history,
    });
  } catch (error) {
    console.error(
      "LICENSE HISTORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load history",
      },
      {
        status: 500,
      }
    );
  }
}