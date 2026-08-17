import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(
  request: Request
) {
  try {
    const {
      name,
      email,
      password,
    } = await request.json();

    if (
      !email.endsWith(
        "@gurujana.com"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Only @gurujana.com email addresses are allowed.",
        },
        { status: 400 }
      );
    }

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    const passwordHash =
      await bcrypt.hash(
        password,
        10
      );

    if (existingUser) {
      // User exists but has never set a password
      if (
        existingUser.passwordHash ===
        null
      ) {
        await prisma.user.update({
          where: {
            email,
          },
          data: {
            name:
              existingUser.name ||
              name,
            passwordHash,
          },
        });

        return NextResponse.json({
          success: true,
          message:
            "Password created successfully.",
        });
      }

      // User already has a password
      return NextResponse.json(
        {
          error:
            "Account already activated. Please login.",
        },
        {
          status: 400,
        }
      );
    }

    // Brand new user
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "EMPLOYEE",
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Account created successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to create account.",
      },
      {
        status: 500,
      }
    );
  }
}