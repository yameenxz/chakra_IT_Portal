import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } =
      await context.params;

    const employee =
      await prisma.onboardingEmployee.findUnique({
        where: {
          id,
        },
        include: {
          tasks: {
            orderBy: {
              slNo: "asc",
            },
          },
        },
      });

    if (!employee) {
      return NextResponse.json(
        {
          error: "Employee not found",
        },
        {
          status: 404,
        }
      );
    }

    const workbook =
      new ExcelJS.Workbook();

    const worksheet =
      workbook.addWorksheet(
        "Onboarding Report"
      );

    const completedTasks =
      employee.tasks.filter(
        (task) =>
          task.status ===
          "Complete"
      ).length;

    const progress = Math.round(
      (employee.tasks.reduce(
        (total, task) => {
          if (
            task.status ===
            "Complete"
          ) {
            return total + 1;
          }

          if (
            task.status ===
            "In Progress"
          ) {
            return total + 0.5;
          }

          return total;
        },
        0
      ) /
        employee.tasks.length) *
        100
    );

    worksheet.mergeCells("A1:G1");

    const titleCell =
      worksheet.getCell("A1");

    titleCell.value =
      "IT SERVICE PORTAL - EMPLOYEE ONBOARDING REPORT";

    titleCell.font = {
      bold: true,
      size: 16,
      color: {
        argb: "FFFFFF",
      },
    };

    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "1B2A41",
      },
    };

    titleCell.alignment = {
      horizontal: "center",
    };

    worksheet.addRow([]);

    worksheet.addRow([
      "Employee Name",
      employee.employeeName,
    ]);

    worksheet.addRow([
      "Progress",
      `${progress}%`,
    ]);

    worksheet.addRow([
      "Tasks Completed",
      `${completedTasks}/${employee.tasks.length}`,
    ]);

    worksheet.addRow([
      "Exported On",
      new Date().toLocaleString(
        "en-GB"
      ),
    ]);

    worksheet.addRow([]);
    worksheet.addRow([]);

    const headerRow =
      worksheet.addRow([
        "Sl No",
        "Stage",
        "Task Name",
        "Owner",
        "Azure Team",
        "Seqrite Team",
        "Status",
      ]);

    headerRow.eachCell(
      (cell) => {
        cell.font = {
          bold: true,
          color: {
            argb: "FFFFFF",
          },
        };

        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: "1B2A41",
          },
        };

        cell.alignment = {
          horizontal: "center",
        };
      }
    );

    employee.tasks.forEach(
      (task) => {
        const row =
          worksheet.addRow([
            task.slNo,
            task.stage,
            task.taskName,
            task.assignedTo ?? "",
            task.azureTeam ?? "",
            task.seqriteTeam ?? "",
            task.status,
          ]);

        const statusCell =
          row.getCell(7);

        if (
          task.status ===
          "Complete"
        ) {
          statusCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
              argb: "C6EFCE",
            },
          };
        } else if (
          task.status ===
          "In Progress"
        ) {
          statusCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
              argb: "FFEB9C",
            },
          };
        } else {
          statusCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
              argb: "FFC7CE",
            },
          };
        }
      }
    );

    worksheet.columns = [
      { width: 10 },
      { width: 20 },
      { width: 40 },
      { width: 25 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
    ];

    worksheet.views = [
      {
        state: "frozen",
        ySplit: 8,
      },
    ];

    worksheet.autoFilter = {
      from: {
        row: 8,
        column: 1,
      },
      to: {
        row: 8,
        column: 7,
      },
    };

    const buffer =
      await workbook.xlsx.writeBuffer();

    return new Response(
      buffer as BodyInit,
      {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${employee.employeeName}_Onboarding_Report.xlsx"`,
        },
      }
    );
  } catch (error) {
    console.error(
      "EXPORT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to export employee",
      },
      {
        status: 500,
      }
    );
  }
}