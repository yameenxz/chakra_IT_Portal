import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
        header: "Name",
        key: "name",
        width: 30,
      },
      {
        header: "Email ID",
        key: "emailId",
        width: 35,
      },
      {
        header: "Team",
        key: "team",
        width: 15,
      },
      {
        header:
          "Guru Comment - Email",
        key: "guruEmail",
        width: 25,
      },
      {
        header:
          "Guru Comment - OneDrive",
        key: "guruOneDrive",
        width: 25,
      },
      {
        header:
          "Partner Comment - Email",
        key: "partnerEmailComment",
        width: 40,
      },
      {
        header:
          "Partner Comment - OneDrive",
        key: "partnerOneDriveComment",
        width: 40,
      },
      {
        header: "Status By IT",
        key: "statusByIT",
        width: 20,
      },
    ];

    employees.forEach(
      (employee) => {
        const comments =
          employee.partnerApprovals
            .map(
              (approval) =>
                approval.comment
            )
            .filter(Boolean)
            .join(" | ");

        worksheet.addRow({
          slNo: employee.slNo,
          name: employee.name,
          emailId:
            employee.emailId,
          team:
            employee.team ?? "",
          guruEmail:
            employee.guruCommentEmail ??
            "",
          guruOneDrive:
            employee.guruCommentOneDrive ??
            "",
          partnerEmailComment:
            comments,
          partnerOneDriveComment:
            comments,
          statusByIT:
            employee.statusByIT,
        });
      }
    );

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