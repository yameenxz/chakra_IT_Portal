import { prisma } from "@/lib/prisma";

export default async function HistoryPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: {
      timestamp: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-slate-800">
            Activity History
          </h1>

          <p className="text-slate-500 mt-2">
            Review workflow approvals and system activity.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-violet-100">
                <th className="px-6 py-5 text-left font-semibold text-slate-700">
                  Action
                </th>

                <th className="px-6 py-5 text-left font-semibold text-slate-700">
                  Details
                </th>

                <th className="px-6 py-5 text-left font-semibold text-slate-700">
                  Performed By
                </th>

                <th className="px-6 py-5 text-left font-semibold text-slate-700">
                  Timestamp
                </th>
              </tr>
            </thead>

            <tbody>
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <tr
                    key={log.id}
                    className={
                      index % 2 === 0
                        ? "bg-white hover:bg-violet-50"
                        : "bg-slate-50 hover:bg-violet-50"
                    }
                  >
                    <td className="px-6 py-5 font-medium text-slate-800">
                      {log.action}
                    </td>

                    <td className="px-6 py-5 text-slate-600">
                      {log.details ||
                        "No details available"}
                    </td>

                    <td className="px-6 py-5 text-slate-600">
                      {log.performedBy}
                    </td>

                    <td className="px-6 py-5 text-slate-600">
                      {log.timestamp.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No activity history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Activity Types Currently Tracked
          </h2>

          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li>Director Approval Completed</li>
            <li>IT Download Started</li>
            <li>IT Processing On Hold</li>
            <li>Offboarding Completed</li>
            <li>Employee Updated</li>
          </ul>
        </div>
      </div>
    </main>
  );
}