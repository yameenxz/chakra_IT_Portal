"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function OffboardingTrackingPage() {
  const router = useRouter();

  const { data: session, status } =
    useSession();

  const role =
    (session?.user as {
      role?: string;
    })?.role || "";

  useEffect(() => {
    if (
      status !== "loading" &&
      role !== "IT" &&
      role !== "ADMIN"
    ) {
      router.replace("/home");
    }
  }, [role, status, router]);

  if (
    status === "loading" ||
    (role !== "IT" &&
      role !== "ADMIN")
  ) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#F4F2EC] px-8 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-[#1B2A41]">
            Employee Offboarding Tracking
          </h1>

          <p className="mt-2 text-slate-600">
            Manage offboarding employees,
            tasks and audit history.
          </p>
        </div>

        <h2 className="mb-6 text-2xl font-semibold text-[#1B2A41]">
          Quick Actions
        </h2>

        <div className="max-w-3xl">
          <div className="grid gap-5 md:grid-cols-2">

            <button
              onClick={() =>
                router.push(
                  "/offboarding-tracking/employees"
                )
              }
              className="rounded-2xl border border-[#DFDACB] bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0E7FF]">
                <span className="text-2xl">
                  👥
                </span>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  Employees
                </h3>

                <span className="text-3xl text-slate-400">
                  →
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Manage offboarding employee
                records.
              </p>
            </button>

            <button
              onClick={() =>
                router.push(
                  "/offboarding-tracking/history"
                )
              }
              className="rounded-2xl border border-[#DFDACB] bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F1E6BE]">
                <span className="text-2xl">
                  🕒
                </span>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  History
                </h3>

                <span className="text-3xl text-slate-400">
                  →
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Audit trail and logs.
              </p>
            </button>

          </div>
        </div>
      </div>
    </main>
  );
}