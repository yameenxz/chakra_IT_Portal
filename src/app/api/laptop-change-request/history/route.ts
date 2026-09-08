import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const requests =
      await prisma.laptopChangeRequest.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(requests);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to load history",
      },
      {
        status: 500,
      }
    );
  }
}