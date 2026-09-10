import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import ExcelJS from "exceljs";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth";

function formatDecision(
  value: string | null
) {
  if (!value) return "";

  switch (value) {
    case "BACKUP_AND_DELETE":
      return "Backup & Delete";

    case "DELETE":
      return "Delete";

    case "HOLD":
      return "Hold";

    default:
      return value;
  }
}

export async function GET() {
  const session =
    await getServerSession(authOptions);

  const role = (
    session?.user as {
      role?: string;
    }
  )?.role;

  if (
  role !== "ADMIN" &&
  role !== "IT" &&
  role !== "IT_HEAD" &&
  role !== "GURU"
)  {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 403,
      }
    );
  }

  try {
    const employees =
      await prisma.employee.findMany({
        include: {
          partnerApprovals: true,
        },
        orderBy: {
          slNo: "asc",
        },
      });

    const workbook =
      new ExcelJS.Workbook();

    const worksheet =
      workbook.addWorksheet(
        "Employee Offboarding Report"
      );

    worksheet.columns = [
      {
        header: "Sl No",
        key: "slNo",
        width: 10,
      },
      {
        header: "Employee Name",
        key: "name",
        width: 25,
      },
      {
        header: "Email ID",
        key: "emailId",
        width: 30,
      },
      {
        header: "Team",
        key: "team",
        width: 15,
      },
      {
        header:
          "Guru Email Decision",
        key: "guruEmail",
        width: 25,
      },
      {
        header:
          "Guru OneDrive Decision",
        key: "guruOneDrive",
        width: 25,
      },
      {
        header:
          "Director Email",
        key: "directorEmail",
        width: 40,
      },
      {
        header:
          "Director Email Decision",
        key: "directorEmailDecision",
        width: 35,
      },
      {
        header:
          "Director OneDrive Decision",
        key: "directorOneDriveDecision",
        width: 35,
      },
      {
        header:
          "Director Comment",
        key: "directorComment",
        width: 40,
      },
      {
        header:
          "Partner Email",
        key: "partnerEmail",
        width: 40,
      },
      {
        header:
          "Partner Email Decision",
        key: "partnerEmailDecision",
        width: 35,
      },
      {
        header:
          "Partner OneDrive Decision",
        key: "partnerOneDriveDecision",
        width: 35,
      },
      {
        header:
          "Partner Comment",
        key: "partnerComment",
        width: 40,
      },
      {
        header:
          "Final Guru Comment",
        key: "finalGuruComment",
        width: 40,
      },
      {
        header:
          "Workflow Stage",
        key: "workflowStage",
        width: 25,
      },
      {
        header:
          "Status By IT",
        key: "statusByIT",
        width: 20,
      },
    ];

    for (const employee of employees) {
      const directorApprovals =
        employee.partnerApprovals.filter(
          (approval) =>
            approval.reviewerRole ===
            "DIRECTOR"
        );

      const partnerApprovals =
        employee.partnerApprovals.filter(
          (approval) =>
            approval.reviewerRole ===
            "PARTNER"
        );

      const directorEmails =
        directorApprovals
          .map(
            (approval) =>
              approval.partnerEmail
          )
          .join("\n");

      const directorEmailDecisions =
        directorApprovals
          .map((approval) =>
            formatDecision(
              approval.emailDecision
            )
          )
          .join("\n");

      const directorOneDriveDecisions =
        directorApprovals
          .map((approval) =>
            formatDecision(
              approval.oneDriveDecision
            )
          )
          .join("\n");

      const directorComments =
        directorApprovals
          .map(
            (approval) =>
              approval.comment ?? ""
          )
          .join("\n");

      const partnerEmails =
        partnerApprovals
          .map(
            (approval) =>
              approval.partnerEmail
          )
          .join("\n");

      const partnerEmailDecisions =
        partnerApprovals
          .map((approval) =>
            formatDecision(
              approval.emailDecision
            )
          )
          .join("\n");

      const partnerOneDriveDecisions =
        partnerApprovals
          .map((approval) =>
            formatDecision(
              approval.oneDriveDecision
            )
          )
          .join("\n");

      const partnerComments =
        partnerApprovals
          .map(
            (approval) =>
              approval.comment ?? ""
          )
          .join("\n");

      const row =
        worksheet.addRow({
          slNo: employee.slNo,

          name: employee.name,

          emailId:
            employee.emailId,

          team: employee.team,

          guruEmail:
            formatDecision(
              employee.guruCommentEmail
            ),

          guruOneDrive:
            formatDecision(
              employee.guruCommentOneDrive
            ),

          directorEmail:
            directorEmails,

          directorEmailDecision:
            directorEmailDecisions,

          directorOneDriveDecision:
            directorOneDriveDecisions,

          directorComment:
            directorComments,

          partnerEmail:
            partnerEmails,

          partnerEmailDecision:
            partnerEmailDecisions,

          partnerOneDriveDecision:
            partnerOneDriveDecisions,

          partnerComment:
            partnerComments,

          finalGuruComment:
            employee.finalGuruComment ??
            "",

          workflowStage:
            employee.workflowStage,

          statusByIT:
            employee.statusByIT,
        });

      row.alignment = {
        wrapText: true,
        vertical: "top",
      };
    }

    const headerRow =
      worksheet.getRow(1);

    headerRow.font = {
      bold: true,
      color: {
        argb: "FFFFFFFF",
      },
    };

    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "333333",
      },
    };

    worksheet.views = [
      {
        state: "frozen",
        ySplit: 1,
      },
    ];

    const buffer =
      await workbook.xlsx.writeBuffer();

    return new NextResponse(
      Buffer.from(buffer),
      {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition":
            'attachment; filename="Employee_Offboarding_Report.xlsx"',
        },
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to export report",
      },
      {
        status: 500,
      }
    );
  }
}