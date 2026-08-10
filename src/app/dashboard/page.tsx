import { prisma } from "@/lib/prisma";
import DashboardTable from "./DashboardTable";

export default async function DashboardPage() {
  const employees = await prisma.employee.findMany({
    where: {
      workflowStage: "READY_FOR_IT",
    },
    include: {
      partnerApprovals: true,
    },
    orderBy: {
      slNo: "asc",
    },
  });

  const pending = employees.filter(
    (employee) => employee.statusByIT === "PENDING"
  ).length;

  const started = employees.filter(
    (employee) =>
      employee.statusByIT === "STARTED_DOWNLOAD"
  ).length;

  const completed = employees.filter(
    (employee) =>
      employee.statusByIT === "COMPLETED"
  ).length;

  const hold = employees.filter(
    (employee) => employee.statusByIT === "HOLD"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-slate-800">
            Dashboard
          </h1>

          <p className="text-slate-500 mt-2">
            IT work queue for approved requests.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <div className="bg-blue-100 rounded-2xl p-6">
            <p>Pending</p>
            <h2 className="text-4xl font-bold">
              {pending}
            </h2>
          </div>

          <div className="bg-purple-100 rounded-2xl p-6">
            <p>Started Download</p>
            <h2 className="text-4xl font-bold">
              {started}
            </h2>
          </div>

          <div className="bg-green-100 rounded-2xl p-6">
            <p>Completed</p>
            <h2 className="text-4xl font-bold">
              {completed}
            </h2>
          </div>

          <div className="bg-pink-100 rounded-2xl p-6">
            <p>Hold</p>
            <h2 className="text-4xl font-bold">
              {hold}
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">
            IT Work Queue
          </h2>

          <DashboardTable employees={employees} />
        </div>
      </div>
    </main>
  );
}