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
          status: "APPROVED",
          approvedBy: "IT Head",
          approvedAt: new Date(),
          itHeadComment: comment,
        },
      });

    await prisma.laptopInventory.update({
      where: {
        assetTag:
          laptopRequest.newAssetTag,
      },
      data: {
        status: "ASSIGNED",
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
          "Failed to approve request",
      },
      {
        status: 500,
      }
    );
  }
}