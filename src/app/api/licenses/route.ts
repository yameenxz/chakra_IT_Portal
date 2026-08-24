import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth";

function safeDate(value?: string) {
  if (!value) {
    return null;
  }

  const cleaned = value.trim();

  if (
    cleaned === "" ||
    cleaned === "Date not available" ||
    cleaned === "Not available"
  ) {
    return null;
  }

  const date = new Date(cleaned);

  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export async function GET() {
  const session =
    await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const licenses =
      await prisma.license.findMany({
        orderBy: {
          productName: "asc",
        },
      });

    return NextResponse.json(
      licenses
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to load licenses",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
) {
  const session =
    await getServerSession(authOptions);

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
        error: "Unauthorized",
      },
      {
        status: 403,
      }
    );
  }

  try {
    const data =
      await request.json();

    /*
      EXCEL IMPORT
    */
    if (Array.isArray(data)) {
      await prisma.license.createMany({
        data: data.map(
          (license: {
            productName: string;
            assignedLicenses: string;
            availableLicenses: string;
            nextInvoiceDate?: string;
            purchaseDate?: string;
            purchasedQuantity?: number;
            renewalDate?: string;
            subscriptionStatus?: string;
          }) => ({
            productName:
              license.productName,

            assignedLicenses:
              license.assignedLicenses,

            availableLicenses:
              license.availableLicenses,

            nextInvoiceDate:
              safeDate(
                license.nextInvoiceDate
              ),

            purchaseDate:
              safeDate(
                license.purchaseDate
              ),

            purchasedQuantity:
              license.purchasedQuantity,

            renewalDate:
              safeDate(
                license.renewalDate
              ),

            subscriptionStatus:
              license.subscriptionStatus ||
              "Active",
          })
        ),
      });

      return NextResponse.json({
        success: true,
        imported:
          data.length,
      });
    }

    /*
      MANUAL ADD LICENSE
    */
    const newLicense =
      await prisma.license.create({
        data: {
          productName:
            data.productName,

          assignedLicenses:
            data.assignedLicenses,

          availableLicenses:
            data.availableLicenses,

          nextInvoiceDate:
            safeDate(
              data.nextInvoiceDate
            ),

          purchaseDate:
            safeDate(
              data.purchaseDate
            ),

          purchasedQuantity:
            data.purchasedQuantity,

          renewalDate:
            safeDate(
              data.renewalDate
            ),

          notes:
            data.notes || null,

          subscriptionStatus:
            "Active",

          updatedBy:
            session?.user?.email ||
            session?.user?.name ||
            "Unknown",

          lastUpdatedAt:
            new Date(),
        },
      });

    return NextResponse.json({
      success: true,
      license: newLicense,
    });
  } catch (error) {
    console.error(
      "LICENSE SAVE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to save licenses",
      },
      {
        status: 500,
      }
    );
  }
}