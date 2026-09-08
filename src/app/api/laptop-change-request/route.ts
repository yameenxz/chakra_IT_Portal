import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    if (
      !body.currentAssetTag?.trim() ||
      !body.currentUser?.trim() ||
      !body.team?.trim() ||
      !body.reasonForChange?.trim() ||
      !body.newAssetTag?.trim() ||
      !body.assignedToUser?.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Please complete all required fields.",
        },
        {
          status: 400,
        }
      );
    }

    const requestRecord =
      await prisma.laptopChangeRequest.create({
        data: {
          currentAssetTag:
            body.currentAssetTag,

          currentUser:
            body.currentUser,

          team:
            body.team,

          location: "",

          reasonForChange:
            body.reasonForChange,

          newAssetTag:
            body.newAssetTag,

          assignedToUser:
            body.assignedToUser,

          requestedBy:
            body.requestedBy,
        },
      });

    await prisma.laptopInventory.update({
      where: {
        assetTag:
          body.newAssetTag,
      },
      data: {
        status: "RESERVED",
      },
    });

    return NextResponse.json({
      success: true,
      requestRecord,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to create laptop change request",
      },
      {
        status: 500,
      }
    );
  }
}