import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET() {
  try {
    await sendEmail(
      "it.intern@gurujana.com",
      "Employee Offboarding Test",
      `
      <h2>Test Email</h2>
      <p>Email notifications are working.</p>
      `
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}