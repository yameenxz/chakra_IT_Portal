import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth";
import { getCurrentBatchName } from "@/lib/batch";

export default async function DirectorPage() {
  const session = await getServerSession(authOptions);

  const role = (
    session?.user as {
      role?: string;
    }
  )?.role;

  if (role !== "GURU" && role !== "ADMIN") {
    redirect("/home");
  }

  const currentBatch = getCurrentBatchName();

  const employeeCount = await prisma.employee.count({
  where: {
    batchName: currentBatch,
    OR: [
      {
        workflowStage: "PENDING_DIRECTOR",
      },
      {
        workflowStage:
          "PENDING_FINAL_DIRECTOR",
      },
    ],
  },
});

  return (
    <main className="min-h-screen bg-[#F4F2EC] p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-[#1B2A41]">
            Guru Dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            Select the active monthly batch to continue workflow processing.
          </p>
        </div>

        <Link
          href={
            "/director/batch/" +
            encodeURIComponent(currentBatch)
          }
        >
          <div className="max-w-xs cursor-pointer">
  <div className="rounded-2xl border border-[#DFDACB] bg-white p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
    <div className="mb-4 flex items-center justify-between">

      <span className="rounded-full bg-[#DCEAE0] px-3 py-1 text-sm font-semibold text-[#2D6A4F]">
        Active
      </span>
    </div>

    <h2 className="text-xl font-bold text-[#1B2A41]">
      {currentBatch}
    </h2>

    <p className="mt-2 text-slate-500">
      Awaiting Guru Review
    </p>

    <div className="mt-5 flex items-center justify-between">
      <div>
        <p className="text-xl font-bold text-[#1B2A41]">
          {employeeCount}
        </p>

        <p className="text-sm text-slate-500">
          Employees
        </p>
      </div>

      <div className="text-lg font-semibold text-[#2563EB]">
        Review Batch →
      </div>
    </div>
  </div>
</div>
        </Link>
      </div>
    </main>
  );
}