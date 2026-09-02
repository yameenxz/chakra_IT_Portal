import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth";

import EmployeeActions from "./EmployeeActions";

export default async function EmployeesPage() {
  const session = await getServerSession(
    authOptions
  );

  const role = (
    session?.user as {
      role?: string;
    }
  )?.role;

  if (
    role !== "IT" &&
    role !== "ADMIN" &&
    role !== "GURU"
  ) {
    redirect("/home");
  }

  const employees = await prisma.employee.findMany({
    orderBy: {
      slNo: "asc",
    },
  });

  const getWorkflowLabel = (
    workflowStage: string
  ) => {
    switch (workflowStage) {
      case "UPLOADED":
        return "Uploaded";

      case "PENDING_DIRECTOR":
        return "Pending Guru Review";

      case "PENDING_PARTNERS":
        return "Pending Director & Partner Review";

      case "PENDING_FINAL_DIRECTOR":
        return "Pending Final Guru Review";

      case "READY_FOR_IT":
        return "Ready For IT";

      case "COMPLETED":
        return "Completed";

      default:
        return workflowStage;
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F2EC] p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-[#1B2A41]">
            Employees
          </h1>

          <p className="mt-2 text-slate-600">
            View employee records and workflow status.
          </p>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="rounded-2xl border border-[#DFDACB] bg-white px-6 py-4 shadow-md">
            <p className="text-sm text-slate-600">
              Total Employees
            </p>

            <p className="text-3xl font-bold text-[#1B2A41]">
              {employees.length}
            </p>
          </div>

          {employees.some(
            (employee) =>
              employee.workflowStage ===
              "UPLOADED"
          ) && <EmployeeActions />}
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#DFDACB] bg-white shadow-md">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F6F2E8]">
                <th className="px-6 py-5 text-left font-semibold text-slate-700">
                  Sl No
                </th>

                <th className="px-6 py-5 text-left font-semibold text-slate-700">
                  Employee
                </th>

                <th className="px-6 py-5 text-left font-semibold text-slate-700">
                  Email
                </th>

                <th className="px-6 py-5 text-left font-semibold text-slate-700">
                  Team
                </th>

                <th className="px-6 py-5 text-left font-semibold text-slate-700">
                  Workflow Stage
                </th>

                <th className="px-6 py-5 text-left font-semibold text-slate-700">
                  IT Status
                </th>
              </tr>
            </thead>

            <tbody>
              {employees.map(
                (employee, index) => (
                  <tr
                    key={employee.id}
                    className={
                      index % 2 === 0
                        ? "bg-white transition hover:bg-slate-50"
                        : "bg-slate-50 transition hover:bg-slate-100"
                    }
                  >
                    <td className="px-6 py-5 text-slate-700">
                      {employee.slNo}
                    </td>

                    <td className="px-6 py-5 font-medium text-slate-800">
                      {employee.name}
                    </td>

                    <td className="px-6 py-5 text-slate-600">
                      {employee.emailId}
                    </td>

                    <td className="px-6 py-5 text-slate-600">
                      {employee.team ??
                        "Not Assigned"}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                          employee.workflowStage ===
                          "UPLOADED"
                            ? "bg-[#F0E7FF] text-[#5B21B6]"
                            : employee.workflowStage ===
                              "PENDING_DIRECTOR"
                            ? "bg-[#FBE5D6] text-[#C2410C]"
                            : employee.workflowStage ===
                              "PENDING_PARTNERS"
                            ? "bg-[#E8EBF2] text-[#1B2A41]"
                            : employee.workflowStage ===
                                "READY_FOR_IT" ||
                              employee.workflowStage ===
                                "PENDING_FINAL_DIRECTOR"
                            ? "bg-[#DCEAE0] text-[#2D6A4F]"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {getWorkflowLabel(
                          employee.workflowStage
                        )}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                          employee.statusByIT ===
                          "COMPLETED"
                            ? "bg-[#DCEAE0] text-green-700"
                            : employee.statusByIT ===
                              "PENDING"
                            ? "bg-[#F1E6BE] text-yellow-700"
                            : employee.statusByIT ===
                              "STARTED_DOWNLOAD"
                            ? "bg-[#E8EBF2] text-blue-700"
                            : "bg-[#FCE7F3] text-pink-700"
                        }`}
                      >
                        {employee.statusByIT}
                      </span>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}