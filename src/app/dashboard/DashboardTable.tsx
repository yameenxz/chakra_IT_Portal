"use client";

import { useState } from "react";

type Employee = {
  id: string;
  name: string;
  emailId: string;
  guruCommentEmail: string | null;
  guruCommentOneDrive: string | null;
  statusByIT: string;

  partnerApprovals?: {
    partnerEmail: string;
    comment: string | null;
    emailDecision: string | null;
    oneDriveDecision: string | null;
  }[];
};

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
              row.querySelector(
                "select"
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
    } catch {
      setMessage("Failed");
    }
  };

  return (
    <>
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-violet-100">
              <th className="px-6 py-5 text-left font-semibold text-slate-700">
                Employee
              </th>

              <th className="px-6 py-5 text-left font-semibold text-slate-700">
                Email
              </th>

              <th className="px-6 py-5 text-left font-semibold text-slate-700">
                Director Email Decision
              </th>

              <th className="px-6 py-5 text-left font-semibold text-slate-700">
                Director OneDrive Decision
              </th>

              <th className="px-6 py-5 text-left font-semibold text-slate-700">
                Partner Comments
              </th>

              <th className="px-6 py-5 text-left font-semibold text-slate-700">
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
                const comments =
                  employee.partnerApprovals?.filter(
                    (approval) =>
                      approval.comment &&
                      approval.comment.trim() !== ""
                  ) ?? [];

                return (
                  <tr
                    key={employee.id}
                    data-id={employee.id}
                    className={
                      index % 2 === 0
                        ? "bg-white hover:bg-violet-50"
                        : "bg-slate-50 hover:bg-violet-50"
                    }
                  >
                    <td className="px-6 py-5 font-medium text-slate-800">
                      {employee.name}
                    </td>

                    <td className="px-6 py-5 text-slate-600">
                      {employee.emailId}
                    </td>

                    <td className="px-6 py-5 text-slate-600">
                      {employee.guruCommentEmail ??
                        "No Decision"}
                    </td>

                    <td className="px-6 py-5 text-slate-600">
                      {employee.guruCommentOneDrive ??
                        "No Decision"}
                    </td>

                    <td className="px-6 py-5 text-slate-600">
                      {comments.length > 0 ? (
                        <div className="space-y-2">
                          {comments.map(
                            (
                              approval,
                              idx
                            ) => (
                              <div
                                key={idx}
                              >
                                <span className="font-medium">
                                  {
                                    approval.partnerEmail
                                  }
                                </span>
                                :{" "}
                                {
                                  approval.comment
                                }
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        "No Comments"
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <select
                        defaultValue={
                          employee.statusByIT
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
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
        className="mt-6 rounded-2xl bg-violet-500 px-8 py-3 text-white shadow-sm hover:bg-violet-600"
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