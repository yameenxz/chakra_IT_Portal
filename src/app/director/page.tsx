import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth";

import ApprovalsTable from "../approvals/ApprovalsTable";
import FinalDirectorTable from "./FinalDirectorTable";

export default async function DirectorPage() {
  const session = await getServerSession(
    authOptions
  );

  const role = (
    session?.user as {
      role?: string;
    }
  )?.role;

  if (
    role !== "GURU" &&
    role !== "ADMIN"
  ) {
    redirect("/home");
  }

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
    <main className="min-h-screen bg-[#F4F2EC] p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-[#1B2A41]">
            Guru Approval Queue
          </h1>

          <p className="mt-2 text-slate-600">
            Employees waiting for Guru review.
          </p>
        </div>

        <div className="mb-8 rounded-3xl border border-[#DFDACB] bg-white p-8 shadow-md">
          <h2 className="mb-4 text-2xl font-bold">
            Initial Guru Review
          </h2>

          <ApprovalsTable
            employees={
              directorEmployees
            }
          />
        </div>

        <div className="rounded-3xl border border-[#DFDACB] bg-white p-8 shadow-md">
          <h2 className="mb-4 text-2xl font-bold text-[#1B2A41]">
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