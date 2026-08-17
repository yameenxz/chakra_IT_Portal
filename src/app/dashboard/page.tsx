import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth";

import DashboardTable from "./DashboardTable";

export default async function DashboardPage() {
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
    role !== "ADMIN"
  ) {
    redirect("/home");
  }

  const employees =
    await prisma.employee.findMany({
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

  const allEmployees =
    await prisma.employee.findMany();

  const pending =
    allEmployees.filter(
      (employee) =>
        employee.statusByIT ===
        "PENDING"
    ).length;

  const started =
    allEmployees.filter(
      (employee) =>
        employee.statusByIT ===
        "STARTED_DOWNLOAD"
    ).length;

  const completed =
    allEmployees.filter(
      (employee) =>
        employee.statusByIT ===
        "COMPLETED"
    ).length;

  const hold =
    allEmployees.filter(
      (employee) =>
        employee.statusByIT ===
        "HOLD"
    ).length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Dashboard
          </h1>

          <p className="mt-2 text-slate-300">
            IT work queue for approved
            requests.
          </p>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-4">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-xl">
            <p className="text-sm text-blue-700">
              Pending
            </p>

            <h2 className="mt-3 text-4xl font-bold text-blue-900">
              {pending}
            </h2>
          </div>

          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-6 shadow-xl">
            <p className="text-sm text-violet-700">
              Started Download
            </p>

            <h2 className="mt-3 text-4xl font-bold text-violet-900">
              {started}
            </h2>
          </div>

          <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-xl">
            <p className="text-sm text-green-700">
              Completed
            </p>

            <h2 className="mt-3 text-4xl font-bold text-green-900">
              {completed}
            </h2>
          </div>

          <div className="rounded-2xl border border-pink-200 bg-pink-50 p-6 shadow-xl">
            <p className="text-sm text-pink-700">
              Hold
            </p>

            <h2 className="mt-3 text-4xl font-bold text-pink-900">
              {hold}
            </h2>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-2xl font-bold text-slate-900">
              IT Work Queue
            </h2>
          </div>

          <div className="p-6">
            <DashboardTable
              employees={employees}
            />
          </div>
        </div>
      </div>
    </main>
  );
}