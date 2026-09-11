import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // SECURITY: unauthenticated DELETE of inventory records.
  const guard = await requireRole("ADMIN", "IT_HEAD");
  if (!guard.ok) return guard.response;

  try {
    const { id } = await params;

    const laptop =
      await prisma.laptopInventory.findUnique({
        where: { id },
      });

    if (!laptop) {
      return NextResponse.json(
        { error: "Laptop not found" },
        { status: 404 }
      );
    }

    if (laptop.status !== "AVAILABLE") {
      return NextResponse.json(
        {
          error:
            "Only available laptops can be deleted",
        },
        { status: 400 }
      );
    }

    await prisma.laptopInventory.delete({
      where: { id },
    });

    console.warn(
      `[audit] laptop inventory deleted: ${laptop.assetTag} (${id}) by ${guard.email}`
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to delete laptop",
      },
      {
        status: 500,
      }
    );
  }
}
