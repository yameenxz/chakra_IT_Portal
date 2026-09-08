import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth";

export default async function HistoryPage() {
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
  role !== "IT_HEAD" &&
  role !== "ADMIN" &&
  role !== "GURU" &&
  role !== "DIRECTOR" &&
  role !== "PARTNER"
) {
  redirect("/home");
}

  const logs = await prisma.auditLog.findMany({
    orderBy: {
      timestamp: "desc",
    },
  });

  const formatDetails = (
    details: string | null
  ) => {
    if (!details) {
      return "No details available";
    }

    return details
      .replaceAll(
        "PENDING_DIRECTOR",
        "Pending Guru Review"
      )
      .replaceAll(
        "PENDING_PARTNERS",
        "Pending Director & Partner Review"
      )
      .replaceAll(
        "PENDING_FINAL_DIRECTOR",
        "Pending Final Guru Review"
      )
      .replaceAll(
        "READY_FOR_IT",
        "Ready For IT"
      )
      .replaceAll(
        "COMPLETED",
        "Completed"
      )
      .replaceAll(
        "UPLOADED",
        "Uploaded"
      );
  };

  return (
    <main className="min-h-screen bg-[#F4F2EC] p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-[#1B2A41]">
            Activity History
          </h1>

          <p className="mt-2 text-slate-600">
            Review workflow approvals and system activity.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#DFDACB] bg-white shadow-md">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F6F2E8]">
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

            <tbody className="divide-y divide-[#DFDACB]">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <tr
                    key={log.id}
                    className={
                      index % 2 === 0
                        ? "bg-white hover:bg-[#F8F5EE]"
                        : "bg-slate-50 hover:bg-[#F8F5EE]"
                    }
                  >
                    <td className="px-6 py-5 font-medium text-slate-800">
                      {log.action}
                    </td>

                    <td className="px-6 py-5 text-slate-600">
                      {formatDetails(
                        log.details
                      )}
                    </td>

                    <td className="px-6 py-5 text-slate-600">
                      {log.performedBy}
                    </td>

                    <td className="px-6 py-5 text-slate-600">
                      {log.timestamp.toLocaleString("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    No activity history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 rounded-3xl border border-[#DFDACB] bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-bold text-[#1B2A41]">
            Activity Types Currently Tracked
          </h2>

          <ul className="space-y-3 text-slate-700">
            <li>• Guru Approval Completed</li>
            <li>• IT Download Started</li>
            <li>• IT Processing On Hold</li>
            <li>• Offboarding Completed</li>
            <li>• Employee Updated</li>
          </ul>
        </div>
      </div>
    </main>
  );
}