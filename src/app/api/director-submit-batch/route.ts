import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const pendingDirectorEmployees =
      await prisma.employee.findMany({
        where: {
          workflowStage: "PENDING_DIRECTOR",
        },
      });

    if (pendingDirectorEmployees.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No employees pending director approval.",
      });
    }

    const incompleteEmployees =
      pendingDirectorEmployees.filter(
        (employee) =>
          !employee.guruCommentEmail ||
          !employee.guruCommentOneDrive
      );

    if (incompleteEmployees.length > 0) {
      return NextResponse.json({
        success: false,
        error:
          "Please complete director decisions for all employees before submitting the batch.",
      });
    }

    const partners =
      await prisma.user.findMany({
        where: {
          role: "PARTNER",
          isActive: true,
        },
      });

    for (const employee of pendingDirectorEmployees) {
      await prisma.employee.update({
        where: {
          id: employee.id,
        },
        data: {
          workflowStage: "PENDING_PARTNERS",
          partnerAssignedAt: new Date(),
          partnerReminderSent: false,
        },
      });

      const assignments = partners.map((partner) => ({
        employeeId: employee.id,
        partnerEmail: partner.email,
        status: "PENDING" as const,
        assignedAt: new Date(),
      }));

      await prisma.partnerApproval.createMany({
        data: assignments,
      });

      await prisma.auditLog.create({
        data: {
          employeeId: employee.id,
          action: "Director Batch Submitted",
          details: `${employee.name} moved to PENDING_PARTNERS`,
          performedBy: "Director",
        },
      });
    }

    return NextResponse.json({
      success: true,
      count: pendingDirectorEmployees.length,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to submit director batch",
      },
      {
        status: 500,
      }
    );
  }
}