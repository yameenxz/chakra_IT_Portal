import { prisma } from "@/lib/prisma";
import ApprovalsTable from "../approvals/ApprovalsTable";

export default async function DirectorPage() {
  const directorEmployees =
    await prisma.employee.findMany({
      where: {
        workflowStage: "PENDING_DIRECTOR",
      },
      orderBy: {
        slNo: "asc",
      },
    });

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold text-slate-800 mb-2">
          Director Approval Queue
        </h1>

        <p className="text-slate-500 mb-8">
          Employees waiting for Guru approval.
        </p>

        <ApprovalsTable
          employees={directorEmployees}
        />
      </div>
    </main>
  );
}