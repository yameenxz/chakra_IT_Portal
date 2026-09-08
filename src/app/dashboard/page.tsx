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
  role !== "IT_HEAD" &&
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
    <main className="min-h-screen bg-[#F4F2EC] p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-[#1B2A41]">
            Dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            IT work queue for approved
            requests.
          </p>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-4">
          <div className="rounded-2xl border border-[#DFDACB] bg-[#F1E6BE] p-6 shadow-md">
            <p className="text-sm text-blue-700">
              Pending
            </p>

            <h2 className="mt-3 text-4xl font-bold text-[#1B2A41]">
              {pending}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#DFDACB] bg-[#F0E7FF] p-6 shadow-md">
            <p className="text-sm text-[#1B2A41]">
              Started Download
            </p>

            <h2 className="mt-3 text-4xl font-bold text-violet-900">
              {started}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#DFDACB] bg-[#DCEAE0] p-6 shadow-md">
            <p className="text-sm text-[#2D6A4F]">
              Completed
            </p>

            <h2 className="mt-3 text-4xl font-bold text-[#2D6A4F]">
              {completed}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#DFDACB] bg-[#FCE7F3] p-6 shadow-md">
            <p className="text-sm text-[#9D174D]">
              Hold
            </p>

            <h2 className="mt-3 text-4xl font-bold text-[#9D174D]">
              {hold}
            </h2>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#DFDACB] bg-white shadow-md">
          <div className="border-b border-[#DFDACB] px-6 py-5">
            <h2 className="text-2xl font-bold text-[#1B2A41]">
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