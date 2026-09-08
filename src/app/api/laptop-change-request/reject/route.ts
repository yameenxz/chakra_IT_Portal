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

    await prisma.laptopInventory.update({
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
    });
  } catch (error) {
    console.error(error);

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