import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";

export async function GET() {
  // SECURITY: returned 200 with the pending-request list to unauthenticated
  // callers. Verified against the running instance on 11 Sep 2026.
  const guard = await requireRole("ADMIN", "IT", "IT_HEAD");
  if (!guard.ok) return guard.response;

  try {
    const requests =
      await prisma.laptopChangeRequest.findMany({
        where: {
          status: "PENDING_IT_HEAD",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(requests);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to load requests",
      },
      {
        status: 500,
      }
    );
  }
}
