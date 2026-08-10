"use client";

import { useState } from "react";

type Approval = {
  id: string;
  employeeId: string;
  partnerEmail: string;
  employeeName: string;
  waitingDays: number;
  overdue: boolean;
  status: string;
  emailDecision?: string | null;
  oneDriveDecision?: string | null;
  comment?: string | null;
};

export default function PartnerApprovalTable({
  employees,
}: {
  employees: Approval[];
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
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-violet-100">
              <th className="px-6 py-5 text-left">
                Employee
              </th>

              <th className="px-6 py-5 text-left">
                Partner
              </th>

              <th className="px-6 py-5 text-left">
                Email Decision
              </th>

              <th className="px-6 py-5 text-left">
                OneDrive Decision
              </th>

              <th className="px-6 py-5 text-left">
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
                  key={
                    approval.id
                  }
                  data-id={
                    approval.id
                  }
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
                  <td className="px-6 py-5 font-medium">
                    {
                      approval.employeeName
                    }
                  </td>

                  <td className="px-6 py-5">
                    {
                      approval.partnerEmail
                    }
                  </td>

                  <td className="px-6 py-5">
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

                      <option value="DELETE">
                        Delete
                      </option>

                      <option value="RETAIN">
                        Retain
                      </option>

                      <option value="HOLD">
                        Hold
                      </option>
                    </select>
                  </td>

                  <td className="px-6 py-5">
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

                      <option value="DELETE">
                        Delete
                      </option>

                      <option value="RETAIN">
                        Retain
                      </option>

                      <option value="HOLD">
                        Hold
                      </option>
                    </select>
                  </td>

                  <td className="px-6 py-5">
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
                  colSpan={5}
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
          onClick={
            handleSaveAll
          }
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