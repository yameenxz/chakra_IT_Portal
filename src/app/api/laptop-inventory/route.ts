import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const laptops =
      await prisma.laptopInventory.findMany({
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
          "Failed to load laptop inventory",
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
    const body =
      await request.json();

    const laptop =
      await prisma.laptopInventory.create({
        data: {
          assetTag:
            body.assetTag,
          model:
            body.model,
          condition:
            body.condition,
          location:
            body.location,
        },
      });

    return NextResponse.json(laptop);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to create laptop",
      },
      {
        status: 500,
      }
    );
  }
}
