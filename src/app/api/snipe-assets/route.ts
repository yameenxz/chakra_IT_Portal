import { NextResponse } from "next/server";
import { getAssets } from "@/lib/snipeit";

export async function GET() {
  try {
    const assets = await getAssets();

    return NextResponse.json(assets);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}