import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } =
      await context.params;

    await prisma.laptopInventory.update({
      where: {
        id,
      },
      data: {
        status: "AVAILABLE",
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to return laptop",
      },
      {
        status: 500,
      }
    );
  }
}