import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth";

import DownloadReportButton from "@/components/DownloadReportButton";

export default async function ReportsPage() {
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
    <main className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Reports
            </h1>

            <p className="mt-2 text-slate-300">
              Offboarding workflow summary and statistics.
            </p>
          </div>

          <DownloadReportButton />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-7">
          <div className="rounded-2xl border border-white/10 bg-white p-6 shadow-xl">
            <p className="text-sm text-slate-500">
              Total
            </p>

            <h2 className="mt-3 text-4xl font-bold text-slate-900">
              {totalEmployees}
            </h2>
          </div>

          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-6 shadow-xl">
            <p className="text-sm text-violet-700">
              Uploaded
            </p>

            <h2 className="mt-3 text-4xl font-bold text-violet-900">
              {uploaded}
            </h2>
          </div>

          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 shadow-xl">
            <p className="text-sm text-orange-700">
              Guru Queue
            </p>

            <h2 className="mt-3 text-4xl font-bold text-orange-900">
              {pendingDirector}
            </h2>
          </div>

          <div className="rounded-2xl border border-purple-200 bg-purple-50 p-6 shadow-xl">
            <p className="text-sm text-purple-700">
              Partner Queue
            </p>

            <h2 className="mt-3 text-4xl font-bold text-purple-900">
              {pendingPartner}
            </h2>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-xl">
            <p className="text-sm text-red-700">
              Overdue Reviews
            </p>

            <h2 className="mt-3 text-4xl font-bold text-red-900">
              {overdueReviews}
            </h2>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-xl">
            <p className="text-sm text-blue-700">
              Ready For IT
            </p>

            <h2 className="mt-3 text-4xl font-bold text-blue-900">
              {readyForIT}
            </h2>
          </div>

          <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-xl">
            <p className="text-sm text-green-700">
              Completed
            </p>

            <h2 className="mt-3 text-4xl font-bold text-green-900">
              {completed}
            </h2>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-2xl font-bold text-slate-900">
              Employee Workflow Summary
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700">
                    Employee
                  </th>

                  <th className="px-6 py-4 text-left font-semibold text-slate-700">
                    Email
                  </th>

                  <th className="px-6 py-4 text-left font-semibold text-slate-700">
                    Workflow Stage
                  </th>

                  <th className="px-6 py-4 text-left font-semibold text-slate-700">
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
                        ? "bg-white hover:bg-slate-50"
                        : "bg-slate-50 hover:bg-slate-100"
                    }
                  >
                    <td className="px-6 py-4">
                      {employee.name}
                    </td>

                    <td className="px-6 py-4">
                      {employee.emailId}
                    </td>

                    <td className="px-6 py-4">
                      {getWorkflowLabel(
                        employee.workflowStage
                      )}
                    </td>

                    <td className="px-6 py-4">
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