import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

import { resetTokens } from "../forgot-password/route";

export async function POST(
  request: Request
) {
  try {
    const {
      token,
      password,
    } = await request.json();

    const email =
      resetTokens.get(token);

    if (!email) {
      return NextResponse.json(
        {
          error:
            "Invalid or expired reset token.",
        },
        {
          status: 400,
        }
      );
    }

    const passwordHash =
      await bcrypt.hash(
        password,
        10
      );

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        passwordHash,
      },
    });

    resetTokens.delete(token);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to reset password.",
      },
      {
        status: 500,
      }
    );
  }
}