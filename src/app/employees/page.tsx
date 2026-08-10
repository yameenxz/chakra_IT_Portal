import { prisma } from "@/lib/prisma";
import SendForApprovalButton from "./SendForApprovalButton";

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    orderBy: {
      slNo: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-slate-800">
            Employees
          </h1>

          <p className="text-slate-500 mt-2">
            View employee records and workflow status.
          </p>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 px-6 py-4 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Employees
            </p>

            <p className="text-2xl font-semibold text-slate-800">
              {employees.length}
            </p>
          </div>

          <SendForApprovalButton />
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-violet-100">
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
              {employees.map((employee, index) => (
                <tr
                  key={employee.id}
                  className={
                    index % 2 === 0
                      ? "bg-white hover:bg-violet-50"
                      : "bg-slate-50 hover:bg-violet-50"
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
                    {employee.team ?? "Not Assigned"}
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        employee.workflowStage === "UPLOADED"
                          ? "bg-purple-100 text-purple-700"
                          : employee.workflowStage ===
                            "PENDING_DIRECTOR"
                          ? "bg-orange-100 text-orange-700"
                          : employee.workflowStage ===
                            "PENDING_PARTNERS"
                          ? "bg-blue-100 text-blue-700"
                          : employee.workflowStage ===
                            "READY_FOR_IT"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {employee.workflowStage}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        employee.statusByIT === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : employee.statusByIT === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : employee.statusByIT ===
                            "STARTED_DOWNLOAD"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-pink-100 text-pink-700"
                      }`}
                    >
                      {employee.statusByIT}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}