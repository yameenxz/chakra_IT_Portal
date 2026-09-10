import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  findAssetByTag,
  findUserByName,
  checkoutAsset,
} from "@/lib/snipeit";

export async function POST(
  request: Request
) {
  try {
    const {
      requestId,
      comment,
    } = await request.json();

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
        approvedBy: "IT Head",
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
        performedBy:
          "IT Head",
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Request approved and laptop assigned successfully",
    });
  } catch (error) {
    console.error(error);

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