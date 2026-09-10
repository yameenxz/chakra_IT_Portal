import { NextResponse } from "next/server";
import { getAssets } from "@/lib/snipeit";

export async function GET() {
  try {
    const assets = await getAssets();

    const availableAssets = assets.rows
      .filter(
        (asset: any) =>
          asset.status_label?.name ===
            "Ready to Deploy" &&
          asset.assigned_to === null
      )
      .map((asset: any) => ({
        id: String(asset.id),
        name: asset.name ?? "",
        rawName: asset.name,
        assetTag: asset.asset_tag,
        model: asset.model?.name ?? "",
        category:
          asset.category?.name ?? "",
        status:
          asset.status_label?.name ?? "",
        assignedTo:
          asset.assigned_to?.name ?? null,
      }));

    return NextResponse.json(
      availableAssets
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to load available assets",
      },
      {
        status: 500,
      }
    );
  }
}