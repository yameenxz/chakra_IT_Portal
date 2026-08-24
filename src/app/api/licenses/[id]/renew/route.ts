import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth";

function safeDate(
  value?: string | null
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const session =
    await getServerSession(
      authOptions
    );

  const role =
    (session?.user as {
      role?: string;
      name?: string;
      email?: string;
    })?.role;

  if (
    role !== "IT" &&
    role !== "ADMIN"
  ) {
    return NextResponse.json(
      {
        error:
          "Unauthorized",
      },
      {
        status: 403,
      }
    );
  }

  try {
    const { id } =
      await context.params;

    const body =
      await request.json();

    const {
      productName,
      assignedLicenses,
      availableLicenses,
      purchasedQuantity,
      purchaseDate,
      nextInvoiceDate,
      renewalDate,
      notes,
    } = body;

    if (!renewalDate) {
      return NextResponse.json(
        {
          error:
            "Renewal date is required",
        },
        {
          status: 400,
        }
      );
    }

    const license =
      await prisma.license.findUnique({
        where: {
          id,
        },
      });

    if (!license) {
      return NextResponse.json(
        {
          error:
            "License not found",
        },
        {
          status: 404,
        }
      );
    }

    const newRenewalDate =
      new Date(
        renewalDate
      );

    if (
      isNaN(
        newRenewalDate.getTime()
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid renewal date",
        },
        {
          status: 400,
        }
      );
    }

    const oldRenewalTime =
      license.renewalDate
        ? new Date(
            license.renewalDate
          ).getTime()
        : null;

    const newRenewalTime =
      newRenewalDate.getTime();

    const renewalChanged =
      oldRenewalTime !==
      newRenewalTime;

    if (renewalChanged) {
      await prisma.licenseRenewalHistory.create(
        {
          data: {
            licenseId:
              license.id,

            oldRenewalDate:
              license.renewalDate,

            newRenewalDate,

            notes:
              notes || null,

            updatedBy:
              session?.user
                ?.email ||
              session?.user
                ?.name ||
              "Unknown",
          },
        }
      );
    }

    const updatedLicense =
      await prisma.license.update({
        where: {
          id:
            license.id,
        },
        data: {
          productName,

          assignedLicenses,

          availableLicenses,

          purchasedQuantity,

          purchaseDate:
            safeDate(
              purchaseDate
            ),

          nextInvoiceDate:
            safeDate(
              nextInvoiceDate
            ),

          renewalDate:
            newRenewalDate,

          notes:
            notes || null,

          updatedBy:
            session?.user
              ?.email ||
            session?.user
              ?.name ||
            "Unknown",

          lastUpdatedAt:
            new Date(),
        },
      });

    return NextResponse.json({
      success: true,
      license:
        updatedLicense,
      renewalChanged,
    });
  } catch (error) {
    console.error(
      "LICENSE MANAGE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update license",
      },
      {
        status: 500,
      }
    );
  }
}