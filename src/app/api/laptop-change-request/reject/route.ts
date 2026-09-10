import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request
) {
  try {
    const {
      requestId,
      comment,
    } = await request.json();

    const laptopRequest =
      await prisma.laptopChangeRequest.update({
        where: {
          id: requestId,
        },
        data: {
          status: "REJECTED",
          rejectedBy: "IT Head",
          rejectedAt: new Date(),
          itHeadComment: comment,
        },
      });

    console.log(
      "Rejected Request:",
      laptopRequest
    );

    await prisma.laptopInventory.updateMany({
      where: {
        assetTag:
          laptopRequest.newAssetTag,
      },
      data: {
        status: "AVAILABLE",
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