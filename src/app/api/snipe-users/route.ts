import { NextResponse } from "next/server";
import { getUsers } from "@/lib/snipeit";

export async function GET() {
  try {
    const users = await getUsers();

    const formattedUsers =
      users.rows.map(
        (user: any) => ({
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