import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.license.createMany({
      data: [
        {
          productName: "Enterprise Mobility + Security E5",
          assignedLicenses: "1",
          availableLicenses: "0",
          purchasedQuantity: 1,
          subscriptionStatus: "Active",
        },
        {
          productName: "Exchange Online (Plan 2) - Extended Service Term",
          assignedLicenses: "1",
          availableLicenses: "0",
          purchasedQuantity: 1,
          subscriptionStatus: "Active",
        },
        {
          productName: "Microsoft 365 Apps for business",
          assignedLicenses: "273",
          availableLicenses: "6",
          purchasedQuantity: 279,
          subscriptionStatus: "Active",
        },
        {
          productName: "Microsoft 365 Business Basic",
          assignedLicenses: "298",
          availableLicenses: "2",
          purchasedQuantity: 300,
          subscriptionStatus: "Active",
        },
        {
          productName: "Microsoft 365 Business Premium - Extended Service Term",
          assignedLicenses: "32",
          availableLicenses: "0",
          purchasedQuantity: 32,
          subscriptionStatus: "Active",
        },
        {
          productName: "Microsoft 365 Business Standard",
          assignedLicenses: "298",
          availableLicenses: "2",
          purchasedQuantity: 300,
          subscriptionStatus: "Active",
        }
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Licenses seeded",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Seed failed",
      },
      {
        status: 500,
      }
    );
  }
}