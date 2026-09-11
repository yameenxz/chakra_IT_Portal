import { NextResponse } from "next/server";
import { getAssets } from "@/lib/snipeit";
import { requireRole } from "@/lib/auth-guard";

export async function GET() {
  // SECURITY: this reached the Snipe-IT client unauthenticated. Once
  // SNIPEIT_API_URL is configured, that makes the portal an open proxy into
  // the asset system for anyone who can reach the host.
  const guard = await requireRole("ADMIN", "IT", "IT_HEAD");
  if (!guard.ok) return guard.response;

  try {
    const assets = await getAssets();

    return NextResponse.json(assets);
  } catch (error) {
    // Do not return error.message to the caller — upstream errors leak the
    // Snipe-IT hostname and token-handling detail. Log it, return generic.
    console.error("snipe-assets:", error);

    return NextResponse.json(
      { error: "Failed to load assets" },
      { status: 500 }
    );
  }
}
