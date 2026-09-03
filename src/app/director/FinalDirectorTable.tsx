"use client";

import { useState } from "react";

type Employee = {
  id: string;
  name: string;
  emailId: string;
  team: string;

  guruCommentEmail: string | null;
  guruCommentOneDrive: string | null;

  partnerApprovals: {
    partnerEmail: string;
    reviewerRole?: string;
    emailDecision: string | null;
    oneDriveDecision: string | null;
    comment: string | null;
  }[];
};

function formatDecision(
  value: string | null
) {
  if (!value) return "-";

  switch (value) {
    case "BACKUP_AND_DELETE":
      return "Backup & Delete";

    case "DELETE":
      return "Delete";

    case "HOLD":
      return "Hold";

    default:
      return value;
  }
}

export default function FinalDirectorTable({
  employees,
}: {
  employees: Employee[];
}) {
  const [loading, setLoading] =
    useState(false);

  const [comments, setComments] =
    useState<Record<string, string>>(
      {}
    );

  const submitBatchToIT =
    async () => {
      try {
        setLoading(true);

        await fetch(
          "/api/final-director-approve",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              employees:
                employees.map(
                  (employee) => ({
                    id: employee.id,
                    finalGuruComment:
                      comments[
                        employee.id
                      ] ?? "",
                  })
                ),
            }),
          }
        );

        location.reload();
      } finally {
        setLoading(false);
      }
    };

  return (
  <div>
    <div className="overflow-x-auto rounded-3xl border border-[#DFDACB] bg-white shadow-sm">
      <table className="min-w-full">
        <thead>
          <tr className="bg-[#F6F2E8]">
            <th className="px-4 py-4 text-left">
              Employee
            </th>

            <th className="px-4 py-4 text-left">
              Email
            </th>

            <th className="px-4 py-4 text-left">
              Team
            </th>

            <th className="px-4 py-4 text-left">
              Guru Email Decision
            </th>

            <th className="px-4 py-4 text-left">
              Guru OneDrive Decision
            </th>

            <th className="px-4 py-4 text-left min-w-[400px]">
              Reviewer Decisions
            </th>

            <th className="px-4 py-4 text-left min-w-[450px]">
              Reviewer Comments
            </th>

            <th className="px-4 py-4 text-left min-w-[350px]">
              Final Guru Comment
            </th>
          </tr>
        </thead>

        <tbody>
          {employees.map(
            (employee) => (
              <tr
                key={employee.id}
                className="border-b border-[#DFDACB] align-top"
              >
                <td className="px-4 py-4">
                  {employee.name}
                </td>

                <td className="px-4 py-4">
                  {employee.emailId}
                </td>

                <td className="px-4 py-4">
                  {employee.team}
                </td>

                <td className="px-4 py-4">
                  {formatDecision(
                    employee.guruCommentEmail
                  )}
                </td>

                <td className="px-4 py-4">
                  {formatDecision(
                    employee.guruCommentOneDrive
                  )}
                </td>

                <td className="px-4 py-4">
                  {employee.partnerApprovals.map(
                    (
                      approval,
                      index
                    ) => (
                      <div
                        key={index}
                        className="mb-4 rounded-xl border border-[#DFDACB] bg-[#FAF8F3] p-4"
                      >
                        <div className="mb-2 rounded-lg bg-[#F1E6BE] px-3 py-2 text-sm font-bold text-[#1B2A41]">
                          {approval.reviewerRole ??
                            "Reviewer"}
                        </div>

                        <div className="mb-3 text-sm text-slate-600">
                          {
                            approval.partnerEmail
                          }
                        </div>

                        <div>
                          <span className="font-medium">
                            Email Decision:
                          </span>{" "}
                          {formatDecision(
                            approval.emailDecision
                          )}
                        </div>

                        <div className="mt-2">
                          <span className="font-medium">
                            OneDrive Decision:
                          </span>{" "}
                          {formatDecision(
                            approval.oneDriveDecision
                          )}
                        </div>
                      </div>
                    )
                  )}
                </td>

                <td className="px-4 py-4">
                  {employee.partnerApprovals
                    .filter(
                      (approval) =>
                        approval.comment &&
                        approval.comment.trim() !==
                          ""
                    )
                    .map(
                      (
                        approval,
                        index
                      ) => (
                        <div
                          key={index}
                          className="mb-4 rounded-xl border border-[#DFDACB] bg-[#FAF8F3] p-4"
                        >
                          <div className="mb-2 rounded-lg bg-[#F1E6BE] px-3 py-2 text-sm font-bold text-[#1B2A41]">
                            {approval.reviewerRole ??
                              "Reviewer"}{" "}
                            Comment
                          </div>

                          <div className="mb-3 text-sm text-slate-600">
                            {
                              approval.partnerEmail
                            }
                          </div>

                          <div className="whitespace-pre-wrap break-words text-slate-700">
                            {
                              approval.comment
                            }
                          </div>
                        </div>
                      )
                    )}

                  {employee.partnerApprovals.filter(
                    (approval) =>
                      approval.comment &&
                      approval.comment.trim() !==
                        ""
                  ).length === 0 && (
                    <div className="italic text-slate-400">
                      No reviewer comments.
                    </div>
                  )}
                </td>

                <td className="px-4 py-4">
                  <textarea
                    placeholder="Enter final Guru comments for IT..."
                    value={
                      comments[
                        employee.id
                      ] ?? ""
                    }
                    onChange={(e) =>
                      setComments({
                        ...comments,
                        [employee.id]:
                          e.target.value,
                      })
                    }
                    className="h-40 w-[350px] rounded-xl border border-[#DFDACB] p-3 outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#F1E6BE]"
                  />
                </td>
              </tr>
            )
          )}

          {employees.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="p-12 text-center text-slate-500"
              >
                No employees waiting for final Guru approval.
              </td>
            </tr>
          )}
        </tbody>
            </table>
    </div>

    {employees.length > 0 && (
      <div className="mt-6 flex justify-end">
        <button
          onClick={submitBatchToIT}
          disabled={loading}
          className="rounded-xl bg-[#1B2A41] px-6 py-3 text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading
            ? "Submitting..."
            : "Submit Batch To IT"}
        </button>
      </div>
    )}
  </div>
);
}