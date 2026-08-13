import { prisma } from "@/lib/prisma";
import ApprovalsTable from "../approvals/ApprovalsTable";
import FinalDirectorTable from "./FinalDirectorTable";

export default async function DirectorPage() {
  const directorEmployees =
    await prisma.employee.findMany({
      where: {
        workflowStage:
          "PENDING_DIRECTOR",
      },
      orderBy: {
        slNo: "asc",
      },
    });

  const finalDirectorEmployees =
    await prisma.employee.findMany({
      where: {
        workflowStage:
          "PENDING_FINAL_DIRECTOR",
      },
      include: {
        partnerApprovals: true,
      },
      orderBy: {
        slNo: "asc",
      },
    });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Guru Approval Queue
          </h1>

          <p className="mt-2 text-slate-300">
            Employees waiting for Guru review.
          </p>
        </div>

        <div className="mb-8 rounded-3xl bg-white p-8 shadow-2xl">
          <h2 className="mb-4 text-2xl font-bold">
            Initial Guru Review
          </h2>

          <ApprovalsTable
            employees={
              directorEmployees
            }
          />
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-2xl">
          <h2 className="mb-4 text-2xl font-bold">
            Final Guru Review
          </h2>

          <FinalDirectorTable
            employees={
              finalDirectorEmployees
            }
          />
        </div>
      </div>
    </main>
  );
}