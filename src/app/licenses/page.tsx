"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  KeyRound,
  Upload,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
} from "lucide-react";

export default function LicensesHomePage() {
  const router = useRouter();

  const { data: session } =
    useSession();

  const role =
    ((session?.user as {
      role?: string;
    })?.role ?? "EMPLOYEE");

  const cardClass =
  "group rounded-2xl border border-[#DFDACB] bg-white p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#C9A227]";

  return (
    <main className="min-h-screen bg-[#F4F2EC]">
      <div className="mx-auto max-w-7xl px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-[#1B2A41]">
            License Renewal Tracking
          </h1>

          <p className="mt-2 text-slate-600">
            Manage software licenses,
            renewals, utilization and
            subscription tracking.
          </p>
        </div>

        <h2 className="mb-4 text-lg font-semibold text-[#1B2A41]">
          Quick Actions
        </h2>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <button
            onClick={() =>
              router.push(
                "/licenses/list"
              )
            }
            className={cardClass}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8EBF2]">
              <KeyRound
                size={24}
                className="text-blue-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">
                License Dashboard
              </h3>

              <ArrowRight
                size={18}
                className="text-slate-400"
              />
            </div>

            <p className="mt-2 text-sm text-slate-500">
              View all licenses,
              tracking status and
              renewal information.
            </p>
          </button>

          {(role === "IT" ||
            role === "ADMIN") && (
            <button
              onClick={() =>
                router.push(
                  "/licenses/add"
                )
              }
              className={cardClass}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#DCEAE0]">
                <PlusCircle
                  size={24}
                  className="text-green-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  Add License
                </h3>

                <ArrowRight
                  size={18}
                  className="text-slate-400"
                />
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Create a new license
                record manually without
                importing an Excel file.
              </p>
            </button>
          )}

          {(role === "IT" ||
            role === "ADMIN") && (
            <button
              onClick={() =>
                router.push(
                  "/licenses/upload"
                )
              }
              className={cardClass}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0E7FF]">
                <Upload
                  size={24}
                  className="text-violet-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  Import Licenses
                </h3>

                <ArrowRight
                  size={18}
                  className="text-slate-400"
                />
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Import Microsoft
                license exports into
                the system.
              </p>
            </button>
          )}

          <button
            onClick={() =>
              router.push(
                "/licenses/expiring"
              )
            }
            className={cardClass}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FCE7F3]">
              <AlertTriangle
                size={24}
                className="text-red-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">
                Expiring Licenses
              </h3>

              <ArrowRight
                size={18}
                className="text-slate-400"
              />
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Review licenses that
              are approaching
              expiration.
            </p>
          </button>
        </div>
      </div>
    </main>
  );
}