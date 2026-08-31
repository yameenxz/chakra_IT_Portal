"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  BriefcaseBusiness,
  ArrowRight,
  KeyRound,
  UserPlus,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  const {
    data: session,
    status,
  } = useSession();
  const role =
  (session?.user as {
    role?: string;
  })?.role || "";

  useEffect(() => {
    if (
      status === "unauthenticated"
    ) {
      router.push("/login");
    }
  }, [status, router]);

  if (
    status === "loading"
  ) {
    return null;
  }

  if (
    status === "unauthenticated"
  ) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-800">
      <div className="mx-auto max-w-7xl px-8 py-8">


        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white">
            Available Services
          </h2>

          <p className="mt-2 text-slate-400">
            Select a service to continue.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          <button
            onClick={() =>
              router.push(
                "/offboarding"
              )
            }
            className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50">
              <BriefcaseBusiness
                size={24}
                className="text-violet-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">
                Employee Offboarding
              </h3>

              <ArrowRight
                size={18}
                className="text-slate-400"
              />
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Manage employee exits,
              Guru approvals,
              partner reviews,
              IT execution,
              audit history and
              reporting.
            </p>

            <div className="mt-4 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              Active Service
            </div>
          </button>

          <button
            onClick={() =>
              router.push(
                "/licenses"
              )
            }
            className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <KeyRound
                size={24}
                className="text-blue-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">
                License Renewal
                Tracking
              </h3>

              <ArrowRight
                size={18}
                className="text-slate-400"
              />
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Track Microsoft
              licenses, renewal dates,
              subscription status,
              utilization and future
              renewals.
            </p>

            <div className="mt-4 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              Active Service
            </div>
          </button>

          {(role === "IT" ||
  role === "ADMIN") && (
  <button
    onClick={() =>
      router.push(
        "/onboarding"
      )
    }
    className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl"
  >
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
      <UserPlus
        size={24}
        className="text-emerald-600"
      />
    </div>

    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-slate-900">
        Employee Onboarding
        Tracking
      </h3>

      <ArrowRight
        size={18}
        className="text-slate-400"
      />
    </div>

    <p className="mt-2 text-sm text-slate-500">
      Track onboarding
      activities, task
      completion, Azure policy
      assignment, antivirus
      installation and user
      provisioning progress.
    </p>

    <div className="mt-4 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
      New Service
    </div>
  </button>
)}

        </div>

      </div>
    </main>
  );
}