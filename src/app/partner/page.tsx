"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import PartnerApprovalTable from "./PartnerApprovalTable";

type Approval = {
  id: string;
  employeeId: string;
  partnerEmail: string;

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

type User = {
  name: string;
  email: string;
};

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

  const [approvals, setApprovals] =
    useState<Approval[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [partnerName, setPartnerName] =
    useState("Partner");

  useEffect(() => {
    const currentEmail =
      session?.user?.email;

    if (!currentEmail) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetch("/api/partner-approvals").then(
        (res) => res.json()
      ),
      fetch("/api/users").then((res) =>
        res.json()
      ),
    ])
      .then(([approvalsData, users]) => {
        const filtered =
          approvalsData.filter(
            (approval: Approval) =>
              approval.partnerEmail ===
              currentEmail
          );

        setApprovals(filtered);

        const currentUser =
          users.find(
            (user: User) =>
              user.email === currentEmail
          );

        if (currentUser) {
          setPartnerName(
            currentUser.name
          );
        }
      })
      .catch(console.error)
      .finally(() =>
        setLoading(false)
      );
  }, [session]);

  const overdueCount =
    approvals.filter(
      (approval) => approval.overdue
    ).length;

  if (
    loading ||
    status === "loading"
  ) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-8">
        <div className="text-white">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Partner Approval Queue
          </h1>

          <p className="mt-2 text-slate-300">
            Individual partner approval tasks.
          </p>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white p-6 shadow-xl">
            <p className="text-sm text-slate-500">
              Pending Tasks
            </p>

            <h2 className="mt-3 text-4xl font-bold text-slate-900">
              {approvals.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-xl">
            <p className="text-sm text-green-700">
              On Track
            </p>

            <h2 className="mt-3 text-4xl font-bold text-green-800">
              {approvals.length -
                overdueCount}
            </h2>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-xl">
            <p className="text-sm text-red-700">
              Overdue
            </p>

            <h2 className="mt-3 text-4xl font-bold text-red-800">
              {overdueCount}
            </h2>
          </div>
        </div>

        <div className="mb-8 overflow-x-auto rounded-3xl bg-white p-8 shadow-2xl">
          <PartnerApprovalTable
            employees={approvals}
            partnerName={
              partnerName
            }
          />
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-2xl">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">
            SLA Overview
          </h2>

          {approvals.length === 0 ? (
            <p className="text-slate-500">
              No pending partner tasks.
            </p>
          ) : (
            <div className="space-y-3">
              {approvals.map(
                (approval) => (
                  <div
                    key={approval.id}
                    className="flex items-center justify-between border-b border-slate-200 pb-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {
                          approval.employeeName
                        }
                      </p>

                      <p className="text-sm text-slate-500">
                        {
                          approval.employeeEmail
                        }
                      </p>

                      <p className="text-sm text-slate-500">
                        Team:{" "}
                        {approval.team}
                      </p>

                      <p className="text-sm text-slate-500">
                        Waiting{" "}
                        {
                          approval.waitingDays
                        }{" "}
                        day(s)
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-sm ${
                        approval.overdue
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {approval.overdue
                        ? "Overdue"
                        : "On Track"}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}