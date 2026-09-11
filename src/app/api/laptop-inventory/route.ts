import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAssets } from "@/lib/snipeit";
import { requireRole } from "@/lib/auth-guard";

type SnipeAsset = {
  id: number | string;
  name?: string | null;
  asset_tag?: string | null;
  model?: { name?: string } | null;
  category?: { name?: string } | null;
  location?: { name?: string } | null;
  rtd_location?: { name?: string } | null;
  status_label?: { name?: string } | null;
  assigned_to?: { name?: string } | null;
};

export async function GET() {
  // SECURITY: reached the Snipe-IT client with no session.
  const guard = await requireRole("ADMIN", "IT", "IT_HEAD");
  if (!guard.ok) return guard.response;

  try {
    const assets = await getAssets();

    const laptops = (assets.rows as SnipeAsset[]).map(
      (asset) => ({
        id: String(asset.id),
        name: asset.name ?? "",
        assetTag: asset.asset_tag ?? "",
        model: asset.model?.name ?? "",
        category: asset.category?.name ?? "",
        location:
          asset.location?.name ??
          asset.rtd_location?.name ??
          "",

        status: asset.assigned_to
          ? "Deployed"
          : asset.status_label?.name ===
            "Ready to Deploy"
          ? "Available"
          : asset.status_label?.name ??
            "Unknown",

        assignedTo:
          asset.assigned_to?.name ?? "-",
      })
    );

    return NextResponse.json(laptops);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to load laptop inventory",
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
  // SECURITY: created inventory records with no authentication.
  const guard = await requireRole("ADMIN", "IT", "IT_HEAD");
  if (!guard.ok) return guard.response;

  try {
    const body =
      await request.json();

    // The original passed body fields straight to Prisma with no checks;
    // a missing assetTag produced an opaque 500 rather than a 400.
    const assetTag =
      typeof body.assetTag === "string"
        ? body.assetTag.trim()
        : "";

    if (!assetTag) {
      return NextResponse.json(
        { error: "assetTag is required" },
        { status: 400 }
      );
    }

    const laptop =
      await prisma.laptopInventory.create({
        data: {
          assetTag,
          model:
            body.model,
          condition:
            body.condition,
          location:
            body.location,
        },
      });

    return NextResponse.json(laptop);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to create laptop",
      },
      {
        status: 500,
      }
    );
  }
}
