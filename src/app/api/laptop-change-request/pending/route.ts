import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const requests =
      await prisma.laptopChangeRequest.findMany({
        where: {
          status: "PENDING_IT_HEAD",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(requests);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to load requests",
      },
      {
        status: 500,
      }
    );
  }
}