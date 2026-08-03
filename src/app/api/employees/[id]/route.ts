import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const employee = await prisma.employee.update({
      where: {
        id,
      },
      data: {
        guruCommentEmail: body.guruCommentEmail,
        guruCommentOneDrive: body.guruCommentOneDrive,
        partnerCommentEmail: body.partnerCommentEmail,
        partnerCommentOneDrive: body.partnerCommentOneDrive,
        statusByIT: body.statusByIT,
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Update failed",
      },
      {
        status: 500,
      }
    );
  }
}