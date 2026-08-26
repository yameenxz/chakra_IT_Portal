import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const licenses =
      await prisma.license.findMany({
        orderBy: {
          productName: "asc",
        },
      });

    const worksheet =
      XLSX.utils.json_to_sheet(
        licenses.map((license) => ({
          "Product Name":
            license.productName,

          "Assigned Licenses":
            license.assignedLicenses,

          "Available Licenses":
            license.availableLicenses,

          "Next Invoice Date":
            license.nextInvoiceDate
              ? new Date(
                  license.nextInvoiceDate
                ).toLocaleDateString(
                  "en-GB"
                )
              : "",

          "Purchase Date":
            license.purchaseDate
              ? new Date(
                  license.purchaseDate
                ).toLocaleDateString(
                  "en-GB"
                )
              : "",

          "Purchased Quantity":
            license.purchasedQuantity,

          "Renewal Date":
            license.renewalDate
              ? new Date(
                  license.renewalDate
                ).toLocaleDateString(
                  "en-GB"
                )
              : "",

          "Subscription Status":
            license.subscriptionStatus,
        }))
      );

    worksheet["!cols"] = [
      { wch: 40 }, // Product Name
      { wch: 20 }, // Assigned Licenses
      { wch: 20 }, // Available Licenses
      { wch: 18 }, // Next Invoice Date
      { wch: 18 }, // Purchase Date
      { wch: 20 }, // Purchased Quantity
      { wch: 18 }, // Renewal Date
      { wch: 20 }, // Subscription Status
    ];

    worksheet["!autofilter"] = {
      ref: "A1:H1",
    };

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Licenses"
    );

    const buffer =
      XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        "Content-Disposition":
          'attachment; filename="licenses.xlsx"',
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to export licenses",
      },
      {
        status: 500,
      }
    );
  }
}