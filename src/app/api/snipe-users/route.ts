import { NextResponse } from "next/server";
import { getUsers } from "@/lib/snipeit";
import { requireRole } from "@/lib/auth-guard";

type SnipeUser = {
  id: number | string;
  name?: string | null;
};

export async function GET() {
  // SECURITY: unauthenticated callers could enumerate every user in Snipe-IT
  // once SNIPEIT_API_URL is configured.
  const guard = await requireRole("ADMIN", "IT", "IT_HEAD");
  if (!guard.ok) return guard.response;

  try {
    const users = await getUsers();

    const formattedUsers =
      (users.rows as SnipeUser[]).map(
        (user) => ({
          id: String(user.id),
          name: user.name ?? "",
        })
      );

    return NextResponse.json(
      formattedUsers
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to load Snipe-IT users",
      },
      {
        status: 500,
      }
    );
  }
}
