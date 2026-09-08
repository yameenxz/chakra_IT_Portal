import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const laptops =
      await prisma.laptopInventory.findMany({
        where: {
          status: "AVAILABLE",
        },
        orderBy: {
          assetTag: "asc",
        },
      });

    return NextResponse.json(laptops);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to load laptops",
      },
      {
        status: 500,
      }
    );
  }
}