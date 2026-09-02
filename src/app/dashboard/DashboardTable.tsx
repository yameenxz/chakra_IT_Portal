"use client";

import { useState } from "react";

type Employee = {
  id: string;
  name: string;
  emailId: string;
  guruCommentEmail: string | null;
  guruCommentOneDrive: string | null;
  finalGuruComment: string | null;
  statusByIT: string;

  partnerApprovals?: {
    partnerEmail: string;
    reviewerRole: string;
    comment: string | null;
    emailDecision: string | null;
    oneDriveDecision: string | null;
  }[];
};

function formatDecision(
  value: string | null | undefined
) {
  if (!value) return "No Decision";

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

export default function DashboardTable({
  employees,
}: {
  employees: Employee[];
}) {
  const [message, setMessage] =
    useState("");

  const saveStatuses = async () => {
    try {
      const rows =
        document.querySelectorAll(
          "tbody tr[data-id]"
        );

      await Promise.all(
        Array.from(rows).map(
          async (row) => {
            const id =
              row.getAttribute(
                "data-id"
              );

            const status =
              (
                row.querySelector(
                  "select"
                ) as HTMLSelectElement
              )?.value;

            return fetch(
              `/api/employees/${id}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  statusByIT: status,
                }),
              }
            );
          }
        )
      );

      setMessage(
        "Saved Successfully"
      );

      location.reload();
    } catch {
      setMessage("Failed");
    }
  };

  return (
    <>
      <div className="overflow-x-auto rounded-3xl border border-[#DFDACB] bg-white shadow-sm">
        <table className="min-w-[2600px] w-full">
          <thead>
            <tr className="bg-[#F6F2E8]">
              <th className="min-w-[180px] px-6 py-5 text-left font-semibold text-slate-700">
                Employee
              </th>

              <th className="min-w-[220px] px-6 py-5 text-left font-semibold text-slate-700">
                Email
              </th>

              <th className="min-w-[180px] px-6 py-5 text-left font-semibold text-slate-700">
                Guru Email Decision
              </th>

              <th className="min-w-[180px] px-6 py-5 text-left font-semibold text-slate-700">
                Guru OneDrive Decision
              </th>

              <th className="min-w-[350px] px-6 py-5 text-left font-semibold text-slate-700">
                Director Decisions
              </th>

              <th className="min-w-[300px] px-6 py-5 text-left font-semibold text-slate-700">
                Director Comments
              </th>

              <th className="min-w-[350px] px-6 py-5 text-left font-semibold text-slate-700">
                Partner Decisions
              </th>

              <th className="min-w-[300px] px-6 py-5 text-left font-semibold text-slate-700">
                Partner Comments
              </th>

              <th className="min-w-[300px] px-6 py-5 text-left font-semibold text-slate-700">
                Final Guru Comment
              </th>

              <th className="min-w-[220px] px-6 py-5 text-left font-semibold text-slate-700">
                IT Status
              </th>
            </tr>
          </thead>

          <tbody>
            {employees.map(
              (
                employee,
                index
              ) => {
                const directorApprovals =
                  employee.partnerApprovals?.filter(
                    (approval) =>
                      approval.reviewerRole ===
                      "DIRECTOR"
                  ) ?? [];

                const partnerApprovals =
                  employee.partnerApprovals?.filter(
                    (approval) =>
                      approval.reviewerRole ===
                      "PARTNER"
                  ) ?? [];

                const directorComments =
                  directorApprovals.filter(
                    (approval) =>
                      approval.comment &&
                      approval.comment.trim() !== ""
                  );

                const partnerComments =
                  partnerApprovals.filter(
                    (approval) =>
                      approval.comment &&
                      approval.comment.trim() !== ""
                  );
                                  return (
                  <tr
                    key={employee.id}
                    data-id={employee.id}
                    className={
                      index % 2 === 0
                        ? "bg-white hover:bg-[#F8F5EE]"
                        : "bg-slate-50 hover:bg-[#F8F5EE]"
                    }
                  >
                    <td className="px-6 py-5 font-medium text-slate-800 align-top">
                      {employee.name}
                    </td>

                    <td className="px-6 py-5 text-slate-600 align-top">
                      {employee.emailId}
                    </td>

                    <td className="px-6 py-5 text-slate-600 align-top">
                      {formatDecision(
                        employee.guruCommentEmail
                      )}
                    </td>

                    <td className="px-6 py-5 text-slate-600 align-top">
                      {formatDecision(
                        employee.guruCommentOneDrive
                      )}
                    </td>

                    <td className="px-6 py-5 align-top">
                      <div className="space-y-3">
                        {directorApprovals.map(
                          (
                            approval,
                            idx
                          ) => (
                            <div
                              key={idx}
                              className="rounded-xl border border-[#DFDACB] bg-[#FAF8F3] p-4"
                            >
                              <div className="mb-2 font-semibold text-slate-900">
                                {
                                  approval.partnerEmail
                                }
                              </div>

                              <div>
                                <span className="font-medium">
                                  Email:
                                </span>{" "}
                                {formatDecision(
                                  approval.emailDecision
                                )}
                              </div>

                              <div className="mt-1">
                                <span className="font-medium">
                                  OneDrive:
                                </span>{" "}
                                {formatDecision(
                                  approval.oneDriveDecision
                                )}
                              </div>
                            </div>
                          )
                        )}

                        {directorApprovals.length ===
                          0 && (
                          <div className="text-slate-400">
                            No Director Review
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-5 align-top">
                      <div className="space-y-3">
                        {directorComments.map(
                          (
                            approval,
                            idx
                          ) => (
                            <div
                              key={idx}
                              className="rounded-xl border border-[#DFDACB] bg-[#FAF8F3] p-4"
                            >
                              <div className="font-semibold text-slate-900">
                                {
                                  approval.partnerEmail
                                }
                              </div>

                              <div className="mt-2 whitespace-pre-wrap break-words">
                                {
                                  approval.comment
                                }
                              </div>
                            </div>
                          )
                        )}

                        {directorComments.length ===
                          0 && (
                          <div className="text-slate-400">
                            No Director Comments
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-5 align-top">
                      <div className="space-y-3">
                        {partnerApprovals.map(
                          (
                            approval,
                            idx
                          ) => (
                            <div
                              key={idx}
                              className="rounded-xl border border-slate-200 bg-white p-4"
                            >
                              <div className="mb-2 font-semibold text-slate-900">
                                {
                                  approval.partnerEmail
                                }
                              </div>

                              <div>
                                <span className="font-medium">
                                  Email:
                                </span>{" "}
                                {formatDecision(
                                  approval.emailDecision
                                )}
                              </div>

                              <div className="mt-1">
                                <span className="font-medium">
                                  OneDrive:
                                </span>{" "}
                                {formatDecision(
                                  approval.oneDriveDecision
                                )}
                              </div>
                            </div>
                          )
                        )}

                        {partnerApprovals.length ===
                          0 && (
                          <div className="text-slate-400">
                            No Partner Review
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-5 align-top">
                      <div className="space-y-3">
                        {partnerComments.map(
                          (
                            approval,
                            idx
                          ) => (
                            <div
                              key={idx}
                              className="rounded-xl border border-slate-200 bg-white p-4"
                            >
                              <div className="font-semibold text-slate-900">
                                {
                                  approval.partnerEmail
                                }
                              </div>

                              <div className="mt-2 whitespace-pre-wrap break-words">
                                {
                                  approval.comment
                                }
                              </div>
                            </div>
                          )
                        )}

                        {partnerComments.length ===
                          0 && (
                          <div className="text-slate-400">
                            No Partner Comments
                          </div>
                        )}
                      </div>
                    </td>
                                        <td className="px-6 py-5 text-slate-600 align-top">
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        {employee.finalGuruComment?.trim()
                          ? employee.finalGuruComment
                          : "No Final Guru Comment"}
                      </div>
                    </td>

                    <td className="px-6 py-5 align-top">
                      <select
                        defaultValue={
                          employee.statusByIT
                        }
                        className="min-w-[200px] rounded-xl border border-[#DFDACB] bg-white px-4 py-3 text-base font-medium text-[#1B2A41] shadow-sm"
                      >
                        <option value="PENDING">
                          Pending
                        </option>

                        <option value="STARTED_DOWNLOAD">
                          Started Download
                        </option>

                        <option value="COMPLETED">
                          Completed
                        </option>

                        <option value="HOLD">
                          Hold
                        </option>
                      </select>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={saveStatuses}
        className="mt-6 rounded-2xl bg-[#1B2A41] px-8 py-3 text-white shadow-sm hover:opacity-90"
      >
        Save Status Changes
      </button>

      {message && (
        <p className="mt-4 font-medium text-slate-700">
          {message}
        </p>
      )}
    </>
  );
}
                  