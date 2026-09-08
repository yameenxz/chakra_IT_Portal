import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth";

export async function GET() {
  const session =
    await getServerSession(authOptions);

  const role = (
    session?.user as {
      role?: string;
    }
  )?.role;

  if (!role) {
    return NextResponse.json(null);
  }

  try {
    if (role === "GURU") {
      const pending =
        await prisma.employee.count({
          where: {
            workflowStage:
              "PENDING_DIRECTOR",
          },
        });

      if (pending > 0) {
        return NextResponse.json({
          title:
            "New Approval Request",
          message: `${pending} employees are waiting for your review.`,
          count: pending,
        });
      }
    }

    if (
      role === "DIRECTOR" ||
      role === "PARTNER"
    ) {
      const pending =
        await prisma.partnerApproval.count({
          where: {
            status: "PENDING",
          },
        });

      if (pending > 0) {
        return NextResponse.json({
          title:
            "Approval Queue",
          message: `${pending} approval requests require review.`,
          count: pending,
        });
      }
    }

    if (
      role === "IT_HEAD" ||
      role === "ADMIN"
    ) {
      const pending =
        await prisma.laptopChangeRequest.count({
          where: {
            status:
              "PENDING_IT_HEAD",
          },
        });

      if (pending > 0) {
        return NextResponse.json({
          title:
            "Laptop Approval Required",
          message: `${pending} laptop requests are awaiting approval.`,
          count: pending,
        });
      }
    }

    return NextResponse.json(null);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      null
    );
  }
}