import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request
) {
  try {
    const formData =
      await request.formData();

    const file =
      formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          error: "No file uploaded",
        },
        {
          status: 400,
        }
      );
    }

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    const workbook = XLSX.read(
      buffer,
      {
        type: "buffer",
      }
    );

    console.log(
      "Available sheets:",
      workbook.SheetNames
    );

    const sheet =
      workbook.Sheets[
        "Instock Laptops"
      ];

    if (!sheet) {
      return NextResponse.json(
        {
          error:
            "Instock Laptops sheet not found",
        },
        {
          status: 400,
        }
      );
    }

    const rows =
      XLSX.utils.sheet_to_json(
        sheet,
        {
          header: 1,
          defval: "",
        }
      ) as any[][];

    let headerRow = -1;

    for (
      let i = 0;
      i < rows.length;
      i++
    ) {
      const row = rows[i].map(
        (cell) =>
          String(cell)
            .trim()
            .toLowerCase()
      );

      if (
        row.includes("asset tag")
      ) {
        headerRow = i;
        break;
      }
    }

    if (headerRow === -1) {
      return NextResponse.json(
        {
          error:
            "Asset Tag header not found",
        },
        {
          status: 400,
        }
      );
    }

    const headers =
      rows[headerRow].map(
        (header) =>
          String(header)
            .trim()
            .toLowerCase()
      );

    const assetTagIndex =
      headers.findIndex(
        (h) =>
          h === "asset tag"
      );

    const modelIndex =
      headers.findIndex(
        (h) =>
          h === "model"
      );

    const conditionIndex =
      headers.findIndex(
        (h) =>
          h === "condition"
      );

    const locationIndex =
      headers.findIndex(
        (h) =>
          h === "location"
      );

    let imported = 0;

    for (
      let i = headerRow + 1;
      i < rows.length;
      i++
    ) {
      const row = rows[i];

      const assetTag =
        String(
          row[assetTagIndex] ??
            ""
        ).trim();

      if (!assetTag) {
        continue;
      }

      const existing =
        await prisma.laptopInventory.findUnique(
          {
            where: {
              assetTag,
            },
          }
        );

      if (existing) {
        continue;
      }

      await prisma.laptopInventory.create(
        {
          data: {
            assetTag,

            model: String(
              row[
                modelIndex
              ] ?? ""
            ).trim(),

            condition:
              String(
                row[
                  conditionIndex
                ] || "Working"
              ).trim(),

            location:
              String(
                row[
                  locationIndex
                ] || ""
              ).trim(),
          },
        }
      );

      imported++;
    }

    return NextResponse.json({
      success: true,
      imported,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to import file",
      },
      {
        status: 500,
      }
    );
  }
}