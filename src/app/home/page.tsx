"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  BriefcaseBusiness,
  ArrowRight,
  KeyRound,
  UserPlus,
  UserMinus,
  Laptop,
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
    <main className="min-h-screen bg-[#F4F2EC]">
      <div className="mx-auto w-full px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-[#1B2A41]">
            Available Services
          </h2>

          <p className="mt-2 text-slate-600">
            Select a service to continue.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {(role === "IT" ||
            role === "IT_HEAD" ||
            role === "ADMIN") && (
            <button
              onClick={() =>
                router.push(
                  "/offboarding-tracking"
                )
              }
              className="group rounded-2xl border border-[#DFDACB] bg-white p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A227] hover:shadow-xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FDE8E8]">
                <UserMinus
                  size={24}
                  className="text-red-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  Employee Offboarding
                  Tracking
                </h3>

                <ArrowRight
                  size={18}
                  className="text-slate-400"
                />
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Track offboarding
                activities, account
                deprovisioning, asset
                recovery, ownership
                assignments and audit
                history.
              </p>

              <div className="mt-4 inline-flex rounded-full bg-[#DCEAE0] px-3 py-1 text-xs font-medium text-green-700">
                Active Service
              </div>
            </button>
          )}

          <button
            onClick={() =>
              router.push(
                "/offboarding"
              )
            }
            className="group rounded-2xl border border-[#DFDACB] bg-white p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A227] hover:shadow-xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0E7FF]">
              <BriefcaseBusiness
                size={24}
                className="text-violet-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">
                Employee Email ID Deletion
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

            <div className="mt-4 inline-flex rounded-full bg-[#DCEAE0] px-3 py-1 text-xs font-medium text-green-700">
              Active Service
            </div>
          </button>

          {(role === "IT" ||
            role === "IT_HEAD" ||
            role === "ADMIN") && (
            <button
              onClick={() =>
                router.push(
                  "/onboarding"
                )
              }
              className="group rounded-2xl border border-[#DFDACB] bg-white p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A227] hover:shadow-xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#DCEAE0]">
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

              <div className="mt-4 inline-flex rounded-full bg-[#DCEAE0] px-3 py-1 text-xs font-medium text-green-700">
                Active Service
              </div>
            </button>
          )}

          <button
            onClick={() =>
              router.push(
                "/licenses"
              )
            }
            className="group rounded-2xl border border-[#DFDACB] bg-white p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A227] hover:shadow-xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8EBF2]">
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

            <div className="mt-4 inline-flex rounded-full bg-[#DCEAE0] px-3 py-1 text-xs font-medium text-[#1B2A41]">
              Active Service
            </div>
          </button>

          {(role === "IT" ||
            role === "IT_HEAD" ||
            role === "ADMIN") && (
            <button
              onClick={() =>
                router.push(
                  "/change-laptop"
                )
              }
              className="group rounded-2xl border border-[#DFDACB] bg-white p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A227] hover:shadow-xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F4FD]">
                <Laptop
                  size={24}
                  className="text-blue-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  Laptop Change
                  Management
                </h3>

                <ArrowRight
                  size={18}
                  className="text-slate-400"
                />
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Manage laptop inventory,
                replacement requests,
                approval workflows and
                laptop assignment
                tracking.
              </p>

              <div className="mt-4 inline-flex rounded-full bg-[#DCEAE0] px-3 py-1 text-xs font-medium text-green-700">
                Active Service
              </div>
            </button>
          )}
        </div>
      </div>
    </main>
  );
}