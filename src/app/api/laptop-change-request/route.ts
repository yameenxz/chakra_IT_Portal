import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";

export async function POST(
  request: Request
) {
  // SECURITY: unauthenticated POST that created laptop change requests.
  const guard = await requireRole("ADMIN", "IT", "IT_HEAD");
  if (!guard.ok) return guard.response;

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

          // AUDIT: was `body.requestedBy` — taken from the request body, so
          // the requester was whatever the client claimed. Anyone could
          // submit a request in someone else's name. Now the authenticated
          // user, which the client cannot forge.
          requestedBy: guard.email,
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
