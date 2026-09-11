import { NextResponse } from "next/server";
import { getAssets } from "@/lib/snipeit";
import { requireRole } from "@/lib/auth-guard";

type SnipeAsset = {
  id: number | string;
  name?: string | null;
  asset_tag?: string | null;
  model?: { name?: string } | null;
  category?: { name?: string } | null;
  status_label?: { name?: string } | null;
  assigned_to?: { name?: string } | null;
};

export async function GET() {
  // SECURITY: reached the Snipe-IT client with no session.
  const guard = await requireRole("ADMIN", "IT", "IT_HEAD");
  if (!guard.ok) return guard.response;

  try {
    const assets = await getAssets();

    const availableAssets = (assets.rows as SnipeAsset[])
      .filter(
        (asset) =>
          asset.status_label?.name ===
            "Ready to Deploy" &&
          asset.assigned_to === null
      )
      .map((asset) => ({
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
