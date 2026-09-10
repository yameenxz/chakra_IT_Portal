import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAssets } from "@/lib/snipeit";

export async function GET() {
  try {
    const assets = await getAssets();

    const laptops = assets.rows.map(
      (asset: any) => ({
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
  try {
    const body =
      await request.json();

    const laptop =
      await prisma.laptopInventory.create({
        data: {
          assetTag:
            body.assetTag,
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