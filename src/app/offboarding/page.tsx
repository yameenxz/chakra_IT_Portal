"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  Users,
  LayoutDashboard,
  FileSpreadsheet,
  History,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  const { data: session } = useSession();

  const role =
    ((session?.user as { role?: string })
      ?.role ?? "EMPLOYEE");

  const cardClass =
    "group rounded-2xl border border-[#DFDACB] bg-white p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#C9A227]";

  return (
    <main className="min-h-screen bg-[#F4F2EC]">
      <div className="mx-auto max-w-7xl px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-[#1B2A41]">
            {role === "GURU"
              ? "Guru Portal"
              : role === "DIRECTOR"
              ? "Director Portal"
              : role === "PARTNER"
              ? "Partner Portal"
              : role === "ADMIN"
              ? "Admin Portal"
              : "IT Service Portal"}
          </h1>

          <p className="mt-2 text-slate-600">
            Employee Email ID Deletion Management System
          </p>
        </div>

        {(role === "IT" ||
          role === "IT_HEAD" ||
          role === "ADMIN") && (
          <>
            <h2 className="mb-4 text-lg font-semibold text-[#1B2A41]">
              Quick Actions
            </h2>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <button
                onClick={() =>
                  router.push("/employees")
                }
                className={cardClass}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0E7FF]">
                  <Users
                    size={24}
                    className="text-violet-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">
                    Employees
                  </h3>

                  <ArrowRight
                    size={18}
                    className="text-slate-400"
                  />
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Manage employee records.
                </p>
              </button>

              <button
                onClick={() =>
                  router.push("/dashboard")
                }
                className={cardClass}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8EBF2]">
                  <LayoutDashboard
                    size={24}
                    className="text-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">
                    Dashboard
                  </h3>

                  <ArrowRight
                    size={18}
                    className="text-slate-400"
                  />
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Process IT actions.
                </p>
              </button>

              <button
                onClick={() =>
                  router.push("/reports")
                }
                className={cardClass}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#DCEAE0]">
                  <FileSpreadsheet
                    size={24}
                    className="text-cyan-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">
                    Reports
                  </h3>

                  <ArrowRight
                    size={18}
                    className="text-slate-400"
                  />
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Analytics and exports.
                </p>
              </button>

              <button
                onClick={() =>
                  router.push("/history")
                }
                className={cardClass}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F1E6BE]">
                  <History
                    size={24}
                    className="text-amber-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">
                    History
                  </h3>

                  <ArrowRight
                    size={18}
                    className="text-slate-400"
                  />
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Audit trail and logs.
                </p>
              </button>
            </div>
          </>
        )}

        {(role === "GURU" ||
          role === "ADMIN") && (
          <div className="mt-6 grid gap-5 md:grid-cols-4">
            <button
              onClick={() =>
                router.push("/director")
              }
              className={cardClass}
            >
              <CheckCircle2 className="mb-4 text-green-600" />

              <h3 className="font-semibold">
                Guru Queue
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Review pending approvals.
              </p>
            </button>

            <button
              onClick={() =>
                router.push("/employees")
              }
              className={cardClass}
            >
              <Users className="mb-4 text-violet-600" />

              <h3 className="font-semibold">
                Employees
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Track workflow progress.
              </p>
            </button>

            <button
              onClick={() =>
                router.push("/reports")
              }
              className={cardClass}
            >
              <FileSpreadsheet className="mb-4 text-cyan-600" />

              <h3 className="font-semibold">
                Reports
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Export reports.
              </p>
            </button>

            <button
              onClick={() =>
                router.push("/history")
              }
              className={cardClass}
            >
              <History className="mb-4 text-amber-600" />

              <h3 className="font-semibold">
                History
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Review audit logs and activity.
              </p>
            </button>
          </div>
        )}

        {(role === "DIRECTOR" ||
          role === "PARTNER") && (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <button
              onClick={() =>
                router.push("/partner")
              }
              className={cardClass}
            >
              <CheckCircle2 className="mb-4 text-purple-600" />

              <h3 className="font-semibold">
                Review Queue
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Review approvals.
              </p>
            </button>

            <button
              onClick={() =>
                router.push("/history")
              }
              className={cardClass}
            >
              <History className="mb-4 text-amber-600" />

              <h3 className="font-semibold">
                History
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Review previous actions.
              </p>
            </button>
          </div>
        )}
      </div>
    </main>
  );
}