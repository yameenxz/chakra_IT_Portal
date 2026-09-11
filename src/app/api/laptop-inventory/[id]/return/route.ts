import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  // SECURITY: unauthenticated PATCH that flipped any asset back to AVAILABLE —
  // effectively un-assigning equipment with no record of who did it.
  const guard = await requireRole("ADMIN", "IT", "IT_HEAD");
  if (!guard.ok) return guard.response;

  try {
    const { id } =
      await context.params;

    // The original called update() straight away, so a non-existent id came
    // back as an opaque 500 from Prisma rather than a 404.
    const existing =
      await prisma.laptopInventory.findUnique({
        where: { id },
        select: { id: true, assetTag: true, status: true },
      });

    if (!existing) {
      return NextResponse.json(
        { error: "Laptop not found" },
        { status: 404 }
      );
    }

    if (existing.status === "AVAILABLE") {
      return NextResponse.json(
        { error: "Laptop is already available" },
        { status: 409 }
      );
    }

    await prisma.laptopInventory.update({
      where: {
        id,
      },
      data: {
        status: "AVAILABLE",
      },
    });

    console.warn(
      `[audit] laptop returned to pool: ${existing.assetTag} (${id}) by ${guard.email}`
    );

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
