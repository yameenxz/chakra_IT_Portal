"use client";

import { useEffect, useState } from "react";
import PartnerApprovalTable from "./PartnerApprovalTable";

type Approval = {
  id: string;
  employeeId: string;
  partnerEmail: string;
  status: string;
  emailDecision?: string | null;
  oneDriveDecision?: string | null;
  comment?: string | null;
  employeeName: string;
  waitingDays: number;
  overdue: boolean;
};

export default function PartnerPage() {
  const [approvals, setApprovals] =
    useState<Approval[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const currentEmail =
      localStorage.getItem("email");

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
  }, []);

  const overdueCount =
    approvals.filter(
      (approval) => approval.overdue
    ).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold text-slate-800 mb-2">
          Partner Approval Queue
        </h1>

        <p className="text-slate-500 mb-8">
          Individual partner approval tasks.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-slate-500 text-sm mb-2">
              Pending Tasks
            </h2>

            <p className="text-4xl font-bold text-slate-800">
              {approvals.length}
            </p>
          </div>

          <div className="bg-green-50 rounded-3xl border border-green-200 shadow-sm p-6">
            <h2 className="text-green-700 text-sm mb-2">
              On Track
            </h2>

            <p className="text-4xl font-bold text-green-700">
              {approvals.length -
                overdueCount}
            </p>
          </div>

          <div className="bg-red-50 rounded-3xl border border-red-200 shadow-sm p-6">
            <h2 className="text-red-700 text-sm mb-2">
              Overdue
            </h2>

            <p className="text-4xl font-bold text-red-700">
              {overdueCount}
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
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
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <div>
                      <p className="font-medium">
                        {approval.employeeName}
                      </p>

                      <p className="text-sm text-slate-500">
                        {
                          approval.partnerEmail
                        }
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
                      className={`px-3 py-1 rounded-full text-sm ${
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

        <PartnerApprovalTable
          employees={approvals}
        />
      </div>
    </main>
  );
}