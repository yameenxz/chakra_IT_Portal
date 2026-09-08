"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type AuditLog = {
  id: string;
  employeeName: string;
  action: string;
  details?: string | null;
  performedBy: string;
  timestamp: string;
};

export default function OnboardingHistoryPage() {
  const router = useRouter();

  const { data: session, status } =
    useSession();

  const role =
    (session?.user as {
      role?: string;
    })?.role || "";

  const [logs, setLogs] =
    useState<AuditLog[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [actionFilter, setActionFilter] =
    useState("All Actions");

  useEffect(() => {
  if (
    status !== "loading" &&
    role !== "IT" &&
    role !== "IT_HEAD" &&
    role !== "ADMIN"
  ) {
    router.replace("/home");
  }
}, [role, status, router]);

  useEffect(() => {
    async function loadLogs() {
      try {
        const response =
          await fetch(
            "/api/onboarding/history"
          );

        const data =
          await response.json();

        setLogs(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (
      status === "authenticated"
    ) {
      loadLogs();
    }
  }, [status]);

  const actions =
    useMemo(() => {
      const uniqueActions =
        Array.from(
          new Set(
            logs.map(
              (log) => log.action
            )
          )
        );

      return [
        "All Actions",
        ...uniqueActions,
      ];
    }, [logs]);

  const filteredLogs =
    useMemo(() => {
      const query =
        search.toLowerCase();

      return logs.filter(
        (log) => {
          const matchesSearch =
            log.employeeName
              .toLowerCase()
              .includes(query) ||
            log.action
              .toLowerCase()
              .includes(query) ||
            (log.details ?? "")
              .toLowerCase()
              .includes(query) ||
            log.performedBy
              .toLowerCase()
              .includes(query);

          const matchesAction =
            actionFilter ===
              "All Actions" ||
            log.action ===
              actionFilter;

          return (
            matchesSearch &&
            matchesAction
          );
        }
      );
    }, [
      logs,
      search,
      actionFilter,
    ]);

  if (
  status === "loading" ||
  (role !== "IT" &&
    role !== "IT_HEAD" &&
    role !== "ADMIN")
) {
  return null;
}

  return (
    <main className="min-h-screen bg-[#F4F2EC] px-8 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1B2A41]">
            Onboarding Audit History
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            View onboarding activity,
            task updates, assignments,
            and employee lifecycle logs.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search employee, action, details or user..."
            className="flex-1 rounded-xl border border-[#DFDACB] bg-white px-4 py-3 text-[#1B2A41] outline-none placeholder:text-slate-500 focus:border-[#C9A227]"
          />

          <select
            value={actionFilter}
            onChange={(e) =>
              setActionFilter(
                e.target.value
              )
            }
            className="rounded-xl border border-[#DFDACB] bg-white px-4 py-3 text-[#1B2A41] outline-none focus:border-[#C9A227]"
          >
            {actions.map(
              (action) => (
                <option
                  key={action}
                  value={action}
                >
                  {action}
                </option>
              )
            )}
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#DFDACB] bg-white shadow-md">
          {loading ? (
            <div className="p-8 text-center">
              Loading history...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No matching audit logs
              found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F6F2E8]">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      Employee
                    </th>

                    <th className="px-4 py-3 text-left">
                      Action
                    </th>

                    <th className="px-4 py-3 text-left">
                      Details
                    </th>

                    <th className="px-4 py-3 text-left">
                      Performed By
                    </th>

                    <th className="px-4 py-3 text-left">
                      Timestamp
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLogs.map(
                    (log) => (
                      <tr
                        key={log.id}
                        className="border-t"
                      >
                        <td className="px-4 py-4 font-medium">
                          {
                            log.employeeName
                          }
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-full bg-[#E8EBF2] px-3 py-1 text-sm font-medium text-[#1B2A41]">
                            {log.action}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          {log.details}
                        </td>

                        <td className="px-4 py-4">
                          {
                            log.performedBy
                          }
                        </td>

                        <td className="px-4 py-4 text-slate-500">
                          {new Date(
  log.timestamp
).toLocaleString("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}