import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";

/** Reject anything larger than this before parsing it. */
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(
  request: Request
) {
  // SECURITY: unauthenticated file upload. An anonymous caller could POST an
  // arbitrary spreadsheet and have the server parse it and write rows.
  const guard = await requireRole("ADMIN", "IT_HEAD");
  if (!guard.ok) return guard.response;

  try {
    const formData =
      await request.formData();

    const file =
      formData.get("file") as File | null;

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

    // The original read the whole file into memory with no size check.
    // XLSX.read on a large or malicious workbook is a denial-of-service
    // vector — it parses everything before you can inspect it.
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          error: `File too large (max ${
            MAX_UPLOAD_BYTES / 1024 / 1024
          } MB)`,
        },
        { status: 413 }
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
      ) as unknown[][];

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

    // The original issued a findUnique + create per row inside a loop —
    // two round trips per row, and a failure halfway through leaves the
    // import partially applied with no way to tell where it stopped.
    // Collect first, then write once.
    const candidates = new Map<
      string,
      {
        assetTag: string;
        model: string;
        condition: string;
        location: string;
      }
    >();

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

      // De-duplicate within the file itself, which the original did not do.
      candidates.set(assetTag, {
        assetTag,

        model: String(
          row[modelIndex] ?? ""
        ).trim(),

        condition: String(
          row[conditionIndex] || "Working"
        ).trim(),

        location: String(
          row[locationIndex] || ""
        ).trim(),
      });
    }

    if (candidates.size === 0) {
      return NextResponse.json({
        success: true,
        imported: 0,
        message: "No rows with an asset tag were found",
      });
    }

    const result =
      await prisma.laptopInventory.createMany({
        data: [...candidates.values()],
        skipDuplicates: true,
      });

    console.warn(
      `[audit] laptop inventory import: ${result.count} rows by ${guard.email}`
    );

    return NextResponse.json({
      success: true,
      imported: result.count,
      skipped: candidates.size - result.count,
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
