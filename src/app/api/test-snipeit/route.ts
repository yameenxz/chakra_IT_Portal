import { NextResponse } from "next/server";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export async function GET() {
  try {
    const response = await fetch(
      `${process.env.SNIPEIT_API_URL}/hardware/674/checkout`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SNIPEIT_API_TOKEN}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assigned_user: 2287,
          checkout_to_type: "user",
          note: "Laptop Change Workflow Test",
        }),
      }
    );

    const data = await response.json();

    return NextResponse.json({
      status: response.status,
      data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: String(error),
      },
      {
        status: 500,
      }
    );
  }
}