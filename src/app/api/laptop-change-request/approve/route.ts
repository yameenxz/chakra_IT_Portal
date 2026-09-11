import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  findAssetByTag,
  findUserByName,
  checkoutAsset,
} from "@/lib/snipeit";
import { requireRole } from "@/lib/auth-guard";

export async function POST(
  request: Request
) {
  // SECURITY: this was an unauthenticated POST that performed a real Snipe-IT
  // checkout and marked a request APPROVED. Approval is a decision point, so
  // IT alone is not sufficient — IT_HEAD or ADMIN only.
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

    const laptopRequest =
      await prisma.laptopChangeRequest.findUnique({
        where: {
          id: requestId,
        },
      });

    if (!laptopRequest) {
      return NextResponse.json(
        {
          error: "Request not found",
        },
        {
          status: 404,
        }
      );
    }

    // Only a request still awaiting a decision may be approved. Without this,
    // an already-approved request can be re-approved, firing a second Snipe-IT
    // checkout and a second audit entry.
    if (laptopRequest.status !== "PENDING_IT_HEAD") {
      return NextResponse.json(
        {
          error: `Request is already ${laptopRequest.status}`,
        },
        { status: 409 }
      );
    }

    const asset =
      await findAssetByTag(
        laptopRequest.newAssetTag
      );

    if (!asset) {
      return NextResponse.json(
        {
          error:
            "Laptop not found in Snipe-IT",
        },
        {
          status: 400,
        }
      );
    }

    const user =
      await findUserByName(
        laptopRequest.assignedToUser
      );

    if (!user) {
      return NextResponse.json(
        {
          error: `User '${laptopRequest.assignedToUser}' not found in Snipe-IT`,
        },
        {
          status: 400,
        }
      );
    }

    const checkoutResult =
      await checkoutAsset(
        asset.id,
        user.id,
        `Laptop Change Request Approved (${laptopRequest.id})`
      );

    if (
      checkoutResult.status ===
      "error"
    ) {
      return NextResponse.json(
        {
          error:
            checkoutResult.messages ||
            "Failed to assign laptop in Snipe-IT",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.laptopChangeRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: "APPROVED",
        // AUDIT: was the hardcoded string "IT Head", so the record never
        // showed who actually approved. Now the authenticated user.
        approvedBy: guard.email,
        approvedAt: new Date(),
        itHeadComment: comment,
      },
    });

    await prisma.laptopChangeAuditLog.create({
      data: {
        requestId,
        action:
          "REQUEST_APPROVED",
        details: `Assigned laptop ${laptopRequest.newAssetTag} to ${laptopRequest.assignedToUser} in Snipe-IT`,
        performedBy: guard.email,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Request approved and laptop assigned successfully",
    });
  } catch (error) {
    // The original console.log'd the full request, asset and user objects on
    // every call. That puts employee names and asset detail into PM2 logs
    // indefinitely — removed.
    console.error(
      "Approval Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to approve request",
      },
      {
        status: 500,
      }
    );
  }
}
