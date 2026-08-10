import { prisma } from "@/lib/prisma";
import ApprovalsTable from "./ApprovalsTable";

export default async function ApprovalsPage() {
  const directorEmployees =
    await prisma.employee.findMany({
      where: {
        workflowStage: "PENDING_DIRECTOR",
      },
      orderBy: {
        slNo: "asc",
      },
    });

  const partnerEmployees =
    await prisma.employee.findMany({
      where: {
        workflowStage: "PENDING_PARTNERS",
      },
      orderBy: {
        slNo: "asc",
      },
    });

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-slate-800">
            Approvals
          </h1>

          <p className="text-slate-500 mt-2">
            Review employee offboarding requests.
          </p>
        </div>

        <div className="grid gap-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Director Approval Queue
            </h2>

            <p className="text-slate-500 mb-6">
              Employees waiting for Guru approval.
            </p>

            <ApprovalsTable
              employees={directorEmployees}
            />
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Partner Approval Queue
            </h2>

            <p className="text-slate-500 mb-6">
              Employees waiting for partner review.
            </p>

            <table className="w-full">
              <thead>
                <tr className="bg-violet-100">
                  <th className="px-6 py-4 text-left">
                    Employee
                  </th>

                  <th className="px-6 py-4 text-left">
                    Workflow Stage
                  </th>
                </tr>
              </thead>

              <tbody>
                {partnerEmployees.map(
                  (employee, index) => (
                    <tr
                      key={employee.id}
                      className={
                        index % 2 === 0
                          ? "bg-white"
                          : "bg-slate-50"
                      }
                    >
                      <td className="px-6 py-4">
                        {employee.name}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-sm">
                          Pending Partners
                        </span>
                      </td>
                    </tr>
                  )
                )}

                {partnerEmployees.length === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-6 py-6 text-center text-slate-500"
                    >
                      No employees waiting for partner approval.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}