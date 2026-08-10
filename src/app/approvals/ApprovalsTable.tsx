"use client";

import { useState } from "react";

type Employee = {
  id: string;
  name: string;
  workflowStage: string;
  guruCommentEmail?: string | null;
  guruCommentOneDrive?: string | null;
};

export default function ApprovalsTable({
  employees,
}: {
  employees: Employee[];
}) {
  const [message, setMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const handleSaveAll = async () => {
    try {
      const rows =
        document.querySelectorAll(
          "tbody tr"
        );

      const requests =
        Array.from(rows).map(
          async (row) => {
            const id =
              row.getAttribute(
                "data-id"
              );

            const selects =
              row.querySelectorAll(
                "select"
              );

            return fetch(
              `/api/employees/${id}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  guruCommentEmail:
                    selects[0]?.value,
                  guruCommentOneDrive:
                    selects[1]?.value,
                }),
              }
            );
          }
        );

      await Promise.all(requests);

      setMessage(
        "Director decisions saved."
      );

      location.reload();
    } catch {
      setMessage(
        "Failed to save decisions."
      );
    }
  };

  const handleSubmitBatch =
    async () => {
      try {
        setSubmitting(true);

        const response =
          await fetch(
            "/api/director-submit-batch",
            {
              method: "POST",
            }
          );

        const result =
          await response.json();

        if (!result.success) {
          alert(
            result.error
          );

          return;
        }

        location.reload();
      } catch {
        setMessage(
          "Failed to submit batch."
        );
      } finally {
        setSubmitting(false);
      }
    };

  const allCompleted =
    employees.length > 0 &&
    employees.every(
      (employee) =>
        employee.guruCommentEmail &&
        employee.guruCommentOneDrive
    );

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-violet-100">
              <th className="px-6 py-5 text-left">
                Employee
              </th>

              <th className="px-6 py-5 text-left">
                Email Decision
              </th>

              <th className="px-6 py-5 text-left">
                OneDrive Decision
              </th>
            </tr>
          </thead>

          <tbody>
            {employees.map(
              (
                employee,
                index
              ) => (
                <tr
                  key={
                    employee.id
                  }
                  data-id={
                    employee.id
                  }
                  className={
                    index % 2 === 0
                      ? "bg-white hover:bg-violet-50"
                      : "bg-slate-50 hover:bg-violet-50"
                  }
                >
                  <td className="px-6 py-5 font-medium">
                    {
                      employee.name
                    }
                  </td>

                  <td className="px-6 py-5">
                    <select
                      defaultValue={
                        employee.guruCommentEmail ??
                        ""
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3"
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
                        employee.guruCommentOneDrive ??
                        ""
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3"
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
                </tr>
              )
            )}

            {employees.length ===
              0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No employees awaiting director approval.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={
            handleSaveAll
          }
          className="rounded-2xl bg-violet-500 px-8 py-3 text-white shadow-sm hover:bg-violet-600"
        >
          Save Director Decisions
        </button>

        {allCompleted && (
          <button
            onClick={
              handleSubmitBatch
            }
            disabled={
              submitting
            }
            className="rounded-2xl bg-green-600 px-8 py-3 text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
          >
            {submitting
              ? "Submitting..."
              : "Submit Batch To Partners"}
          </button>
        )}
      </div>

      {!allCompleted && (
        <p className="mt-4 text-amber-600">
          Complete all director decisions and save them before submitting the batch.
        </p>
      )}

      {message && (
        <p className="mt-4">
          {message}
        </p>
      )}
    </>
  );
}