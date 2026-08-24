import { NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export const resetTokens = new Map<
  string,
  string
>();

export async function POST(
  request: Request
) {
  try {
    const { email } =
      await request.json();

    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "No account found with that email.",
        },
        {
          status: 404,
        }
      );
    }

    const token =
      crypto.randomUUID();

    resetTokens.set(
      token,
      email
    );

    const resetUrl = `http://localhost:3000/reset-password/${token}`;

    await sendEmail(
      email,
      "Reset Your Password",
      `
      <h2>Password Reset Request</h2>

      <p>
        A password reset was requested for your account.
      </p>

      <p>
        Click the link below to reset your password:
      </p>

      <p>
        ${resetUrl}
          Reset Password
        </a>
      </p>

      <p>
        If you did not request this change,
        please ignore this email.
      </p>
      `
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to process request.",
      },
      {
        status: 500,
      }
    );
  }
}