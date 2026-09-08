"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Approval = {
  id: string;
  employeeId: string;
  partnerEmail: string;
  batchName: string;

  employeeName: string;
  employeeEmail: string;
  team: string;

  directorEmailDecision: string;
  directorOneDriveDecision: string;

  status: string;

  emailDecision?: string | null;
  oneDriveDecision?: string | null;
  comment?: string | null;

  waitingDays: number;
  overdue: boolean;
};

function getCurrentBatchName() {
  const today = new Date();

  const day = today.getDate();

  let batchMonth = today.getMonth();
  let batchYear = today.getFullYear();

  if (day < 15) {
    batchMonth -= 1;

    if (batchMonth < 0) {
      batchMonth = 11;
      batchYear -= 1;
    }
  }

  const monthName = new Date(
    batchYear,
    batchMonth
  ).toLocaleString("en-US", {
    month: "long",
  });

  return `${monthName} ${batchYear}`;
}

export default function PartnerPage() {
  const router = useRouter();

  const {
    data: session,
    status,
  } = useSession();

  const role =
    (session?.user as {
      role?: string;
    })?.role;

  const [approvals, setApprovals] =
    useState<Approval[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (
      status !== "loading" &&
      role !== "PARTNER" &&
      role !== "DIRECTOR" &&
      role !== "ADMIN"
    ) {
      router.push("/home");
    }
  }, [role, status, router]);

  useEffect(() => {
    const currentEmail =
      session?.user?.email;

    if (!currentEmail) {
      setLoading(false);
      return;
    }

    fetch("/api/partner-approvals")
      .then((res) => res.json())
      .then((data) => {
        const filtered =
          data.filter(
            (approval: Approval) =>
              approval.partnerEmail ===
              currentEmail
          );

        setApprovals(filtered);
      })
      .catch(console.error)
      .finally(() =>
        setLoading(false)
      );
  }, [session]);

  if (
    loading ||
    status === "loading"
  ) {
    return (
      <main className="min-h-screen bg-[#F4F2EC] p-8">
        <div className="text-[#1B2A41]">
          Loading...
        </div>
      </main>
    );
  }

  const currentBatch =
    getCurrentBatchName();

  const employeeCount =
    approvals.filter(
      (approval) =>
        approval.batchName ===
        currentBatch
    ).length;

  return (
    <main className="min-h-screen bg-[#F4F2EC] p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-[#1B2A41]">
            Partner Dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            Select the active monthly batch to review.
          </p>
        </div>

        <div
          onClick={() =>
            router.push(
              "/partner/batch/" +
                encodeURIComponent(
                  currentBatch
                )
            )
          }
          className="max-w-xs cursor-pointer"
        >
          <div className="rounded-2xl border border-[#DFDACB] bg-white p-5 shadow-md transition hover:shadow-lg">
            <div className="mb-4">
  <span className="rounded-full bg-[#DCEAE0] px-3 py-1 text-sm font-semibold text-[#2D6A4F]">
    Active
  </span>
</div>
            <h2 className="text-xl font-bold text-[#1B2A41]">
              {currentBatch}
            </h2>

            <p className="mt-2 text-slate-500">
  Awaiting Partner Review
</p>
<div className="mt-5">
  <p className="text-xl font-bold text-[#1B2A41]">
    {employeeCount}
  </p>

  <p className="text-sm text-slate-500">
    Pending
  </p>
</div>

            <div className="mt-4 text-sm font-semibold text-blue-600">
              Review Batch →
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
