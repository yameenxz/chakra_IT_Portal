import { prisma } from "@/lib/prisma";
import DownloadReportButton from "@/components/DownloadReportButton";

export default async function ReportsPage() {
  const employees = await prisma.employee.findMany({
    orderBy: {
      slNo: "asc",
    },
  });

  const totalEmployees = employees.length;

  const uploaded = employees.filter(
    (employee) =>
      employee.workflowStage === "UPLOADED"
  ).length;

  const pendingDirector = employees.filter(
    (employee) =>
      employee.workflowStage ===
      "PENDING_DIRECTOR"
  ).length;

  const pendingPartner = employees.filter(
    (employee) =>
      employee.workflowStage ===
      "PENDING_PARTNERS"
  ).length;

  const readyForIT = employees.filter(
    (employee) =>
      employee.workflowStage ===
      "READY_FOR_IT"
  ).length;

  const completed = employees.filter(
    (employee) =>
      employee.workflowStage ===
      "COMPLETED"
  ).length;

  const today = new Date();

  const overdueReviews = employees.filter(
    (employee) => {
      if (
        employee.workflowStage !==
          "PENDING_PARTNERS" ||
        !employee.partnerAssignedAt
      ) {
        return false;
      }

      const waitingDays = Math.floor(
        (today.getTime() -
          employee.partnerAssignedAt.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      return waitingDays >= 4;
    }
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold text-slate-900">
              Reports
            </h1>

            <p className="mt-2 text-slate-600">
              Offboarding workflow summary and statistics.
            </p>
          </div>

          <DownloadReportButton />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-7">
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <p className="text-sm text-slate-500">
              Total
            </p>

            <h2 className="mt-3 text-4xl font-bold">
              {totalEmployees}
            </h2>
          </div>

          <div className="rounded-xl bg-slate-500 p-6 text-white shadow-lg">
            <p className="text-sm">
              Uploaded
            </p>

            <h2 className="mt-3 text-4xl font-bold">
              {uploaded}
            </h2>
          </div>

          <div className="rounded-xl bg-yellow-500 p-6 text-white shadow-lg">
            <p className="text-sm">
              Director Queue
            </p>

            <h2 className="mt-3 text-4xl font-bold">
              {pendingDirector}
            </h2>
          </div>

          <div className="rounded-xl bg-purple-500 p-6 text-white shadow-lg">
            <p className="text-sm">
              Partner Queue
            </p>

            <h2 className="mt-3 text-4xl font-bold">
              {pendingPartner}
            </h2>
          </div>

          <div className="rounded-xl bg-red-500 p-6 text-white shadow-lg">
            <p className="text-sm">
              Overdue Reviews
            </p>

            <h2 className="mt-3 text-4xl font-bold">
              {overdueReviews}
            </h2>
          </div>

          <div className="rounded-xl bg-blue-500 p-6 text-white shadow-lg">
            <p className="text-sm">
              Ready For IT
            </p>

            <h2 className="mt-3 text-4xl font-bold">
              {readyForIT}
            </h2>
          </div>

          <div className="rounded-xl bg-green-500 p-6 text-white shadow-lg">
            <p className="text-sm">
              Completed
            </p>

            <h2 className="mt-3 text-4xl font-bold">
              {completed}
            </h2>
          </div>
        </div>

        <div className="mt-10 rounded-xl bg-white p-6 shadow-lg">
          <h2 className="mb-6 text-2xl font-bold">
            Employee Workflow Summary
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left">
                    Employee
                  </th>

                  <th className="px-4 py-3 text-left">
                    Email
                  </th>

                  <th className="px-4 py-3 text-left">
                    Workflow Stage
                  </th>

                  <th className="px-4 py-3 text-left">
                    IT Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {employees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      {employee.name}
                    </td>

                    <td className="px-4 py-3">
                      {employee.emailId}
                    </td>

                    <td className="px-4 py-3">
                      {employee.workflowStage}
                    </td>

                    <td className="px-4 py-3">
                      {employee.statusByIT}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}