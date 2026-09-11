import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  // SECURITY: this was an unauthenticated hard DELETE. Anyone who could reach
  // the host could permanently remove any licence record by id, with no
  // authentication, no audit entry, and no way to tell afterwards who did it.
  const guard = await requireRole("ADMIN", "IT_HEAD");
  if (!guard.ok) return guard.response;

  try {
    const { id } =
      await context.params;

    const existing = await prisma.license.findUnique({
      where: { id },
      select: { id: true, productName: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "License not found" },
        { status: 404 }
      );
    }

    await prisma.license.delete({
      where: {
        id,
      },
    });

    // A destructive action with no record of who performed it is not
    // defensible in an audit-facing system. If you have a licence-specific
    // audit model, prefer that over console output.
    console.warn(
      `[audit] license deleted: ${existing.productName} (${id}) by ${guard.email}`
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to delete license",
      },
      {
        status: 500,
      }
    );
  }
}
