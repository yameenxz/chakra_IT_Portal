"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  ArrowRight,
  Laptop,
  ClipboardList,
  CheckCircle,
  History,
} from "lucide-react";

export default function ChangeLaptopHomePage() {
  const router = useRouter();

  const { data: session } =
    useSession();

  const role =
    (session?.user as {
      role?: string;
    })?.role || "";

  return (
    <main className="min-h-screen bg-[#F4F2EC]">
      <div className="mx-auto max-w-7xl px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-[#1B2A41]">
            Laptop Change Management
          </h2>

          <p className="mt-2 text-slate-600">
            Manage inventory, requests and approvals.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Inventory - Everyone in Laptop Module */}
          <button
            onClick={() =>
              router.push(
                "/change-laptop/inventory"
              )
            }
            className="group rounded-2xl border border-[#DFDACB] bg-white p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A227] hover:shadow-xl"
          >
            <Laptop
              className="mb-4 text-blue-600"
              size={28}
            />

            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                Laptop Inventory
              </h3>

              <ArrowRight
                size={18}
              />
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Manage available laptops and inventory records.
            </p>
          </button>

          {/* Create Request - IT & ADMIN ONLY */}
          {(role === "IT" ||
            role === "ADMIN") && (
            <button
              onClick={() =>
                router.push(
                  "/change-laptop/create"
                )
              }
              className="group rounded-2xl border border-[#DFDACB] bg-white p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A227] hover:shadow-xl"
            >
              <ClipboardList
                className="mb-4 text-violet-600"
                size={28}
              />

              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  Create Request
                </h3>

                <ArrowRight
                  size={18}
                />
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Submit a laptop replacement request.
              </p>
            </button>
          )}

          {/* Approval Queue - IT_HEAD & ADMIN ONLY */}
          {(role === "IT_HEAD" ||
            role === "ADMIN") && (
            <button
              onClick={() =>
                router.push(
                  "/change-laptop/approvals"
                )
              }
              className="group rounded-2xl border border-[#DFDACB] bg-white p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A227] hover:shadow-xl"
            >
              <CheckCircle
                className="mb-4 text-green-600"
                size={28}
              />

              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  Approval Queue
                </h3>

                <ArrowRight
                  size={18}
                />
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Review and approve pending requests.
              </p>
            </button>
          )}

          {/* History - Everyone */}
          <button
  onClick={() =>
    router.push(
      "/change-laptop/history"
    )
  }
  className="group rounded-2xl border border-[#DFDACB] bg-white p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A227] hover:shadow-xl"
>
            <History
              className="mb-4 text-orange-600"
              size={28}
            />

            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                Request History
              </h3>

              <ArrowRight
                size={18}
              />
            </div>

            <p className="mt-2 text-sm text-slate-500">
              View approved, rejected and completed requests.
            </p>
          </button>
        </div>
      </div>
    </main>
  );
}