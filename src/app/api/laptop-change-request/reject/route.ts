import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";

export async function POST(
  request: Request
) {
  // SECURITY: unauthenticated POST that rejected requests and released
  // inventory. Same decision-point restriction as approve.
  const guard = await requireRole("IT_HEAD", "ADMIN");
  if (!guard.ok) return guard.response;

  try {
    const {
      requestId,
      comment,
    } = await request.json();

    if (typeof requestId !== "string" || !requestId) {
      return NextResponse.json(
        { error: "requestId is required" },
        { status: 400 }
      );
    }

    // The original called update() directly on an unvalidated id, so a bad id
    // surfaced as an opaque 500 from Prisma rather than a 404.
    const existing =
      await prisma.laptopChangeRequest.findUnique({
        where: { id: requestId },
      });

    if (!existing) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    if (existing.status !== "PENDING_IT_HEAD") {
      return NextResponse.json(
        { error: `Request is already ${existing.status}` },
        { status: 409 }
      );
    }

    const laptopRequest =
      await prisma.laptopChangeRequest.update({
        where: {
          id: requestId,
        },
        data: {
          status: "REJECTED",
          // AUDIT: was the hardcoded string "IT Head".
          rejectedBy: guard.email,
          rejectedAt: new Date(),
          itHeadComment: comment,
        },
      });

    await prisma.laptopInventory.updateMany({
      where: {
        assetTag:
          laptopRequest.newAssetTag,
      },
      data: {
        status: "AVAILABLE",
      },
    });

    // The approve path writes a LaptopChangeAuditLog entry; the reject path
    // did not, leaving rejections invisible in the audit trail.
    await prisma.laptopChangeAuditLog.create({
      data: {
        requestId,
        action: "REQUEST_REJECTED",
        details: `Rejected request for ${laptopRequest.newAssetTag}; asset returned to AVAILABLE`,
        performedBy: guard.email,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Request rejected successfully",
    });
  } catch (error) {
    console.error(
      "Reject Route Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to reject request",
      },
      {
        status: 500,
      }
    );
  }
}
