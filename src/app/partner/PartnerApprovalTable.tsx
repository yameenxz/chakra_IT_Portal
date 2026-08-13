"use client";

import { useState } from "react";

type Approval = {
  id: string;
  employeeId: string;
  partnerEmail: string;

  employeeName: string;
  employeeEmail: string;
  team: string;

  directorEmailDecision: string;
  directorOneDriveDecision: string;

  waitingDays: number;
  overdue: boolean;
  status: string;

  emailDecision?: string | null;
  oneDriveDecision?: string | null;
  comment?: string | null;
};

function formatDecision(
  value: string | null | undefined
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

export default function PartnerApprovalTable({
  employees,
  partnerName,
}: {
  employees: Approval[];
  partnerName: string;
}) {
  const [message, setMessage] =
    useState("");

  const handleSaveAll = async () => {
    try {
      const rows =
        document.querySelectorAll(
          "tbody tr[data-id]"
        );

      const requests =
        Array.from(rows).map(
          async (row) => {
            const employeeId =
              row.getAttribute(
                "data-employee"
              );

            const partnerEmail =
              row.getAttribute(
                "data-partner"
              );

            const selects =
              row.querySelectorAll(
                "select"
              );

            const textarea =
              row.querySelector(
                "textarea"
              );

            const emailDecision =
              selects[0]?.value;

            const oneDriveDecision =
              selects[1]?.value;

            const comment =
              textarea?.value ?? "";

            if (
              !emailDecision ||
              !oneDriveDecision
            ) {
              throw new Error(
                "Please complete all rows before saving."
              );
            }

            return fetch(
              "/api/partner-approvals",
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  employeeId,
                  partnerEmail,
                  emailDecision,
                  oneDriveDecision,
                  comment,
                }),
              }
            );
          }
        );

      await Promise.all(requests);

      setMessage(
        "Partner decisions saved successfully."
      );

      location.reload();
    } catch (error: any) {
      alert(
        error.message ??
          "Failed to save partner decisions."
      );
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-violet-100">
              <th className="px-4 py-4 text-left">
                Employee
              </th>

              <th className="px-4 py-4 text-left">
                Email ID
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

              <th className="px-4 py-4 text-left">
                {partnerName} Email Decision
              </th>

              <th className="px-4 py-4 text-left">
                {partnerName} OneDrive Decision
              </th>

              <th className="px-4 py-4 text-left">
                Comment
              </th>
            </tr>
          </thead>

          <tbody>
            {employees.map(
              (
                approval,
                index
              ) => (
                <tr
                  key={approval.id}
                  data-id={approval.id}
                  data-employee={
                    approval.employeeId
                  }
                  data-partner={
                    approval.partnerEmail
                  }
                  className={
                    index % 2 === 0
                      ? "bg-white"
                      : "bg-slate-50"
                  }
                >
                  <td className="px-4 py-4 font-medium">
                    {
                      approval.employeeName
                    }
                  </td>

                  <td className="px-4 py-4">
                    {
                      approval.employeeEmail
                    }
                  </td>

                  <td className="px-4 py-4">
                    {approval.team}
                  </td>

                  <td className="px-4 py-4">
                    {formatDecision(
                      approval.directorEmailDecision
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {formatDecision(
                      approval.directorOneDriveDecision
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <select
                      defaultValue={
                        approval.emailDecision ??
                        ""
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2"
                    >
                      <option value="">
                        Select
                      </option>

                      <option value="BACKUP_AND_DELETE">
                        Backup & Delete
                      </option>

                      <option value="DELETE">
                        Delete
                      </option>

                      <option value="HOLD">
                        Hold
                      </option>
                    </select>
                  </td>

                  <td className="px-4 py-4">
                    <select
                      defaultValue={
                        approval.oneDriveDecision ??
                        ""
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2"
                    >
                      <option value="">
                        Select
                      </option>

                      <option value="BACKUP_AND_DELETE">
                        Backup & Delete
                      </option>

                      <option value="DELETE">
                        Delete
                      </option>

                      <option value="HOLD">
                        Hold
                      </option>
                    </select>
                  </td>

                  <td className="px-4 py-4">
                    <textarea
                      defaultValue={
                        approval.comment ??
                        ""
                      }
                      rows={2}
                      placeholder="Partner comments..."
                      className="w-full rounded-xl border border-slate-200 px-3 py-2"
                    />
                  </td>
                </tr>
              )
            )}

            {employees.length ===
              0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No pending partner approvals.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <button
          onClick={handleSaveAll}
          className="rounded-2xl bg-violet-500 px-8 py-3 text-white shadow-sm hover:bg-violet-600"
        >
          Save Partner Decisions
        </button>
      </div>

      {message && (
        <p className="mt-4">
          {message}
        </p>
      )}
    </>
  );
}