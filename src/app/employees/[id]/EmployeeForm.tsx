"use client";

import { useState } from "react";

type EmployeeFormProps = {
  employeeId: string;
};

export default function EmployeeForm({
  employeeId,
}: EmployeeFormProps) {
  const [guruCommentEmail, setGuruCommentEmail] =
    useState("DELETE");

  const [guruCommentOneDrive, setGuruCommentOneDrive] =
    useState("RETAIN");

  const [partnerCommentEmail, setPartnerCommentEmail] =
    useState("");

  const [partnerCommentOneDrive, setPartnerCommentOneDrive] =
    useState("");

  const [statusByIT, setStatusByIT] =
    useState("PENDING");

  const [message, setMessage] = useState("");

  const handleSave = async () => {
    const response = await fetch(
      `/api/employees/${employeeId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guruCommentEmail,
          guruCommentOneDrive,
          partnerCommentEmail,
          partnerCommentOneDrive,
          statusByIT,
        }),
      }
    );

    if (response.ok) {
      setMessage("Saved Successfully ✅");
    } else {
      setMessage("Failed To Save ❌");
    }
  };

  return (
    <div className="mt-6 border rounded p-6">
      <h2 className="text-2xl font-bold mb-4">
        Edit Employee
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block mb-1">
            Guru Email Decision
          </label>

          <select
            value={guruCommentEmail}
            onChange={(e) =>
              setGuruCommentEmail(e.target.value)
            }
            className="border p-2 rounded w-full"
          >
            <option>DELETE</option>
            <option>RETAIN</option>
            <option>HOLD</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">
            Guru OneDrive Decision
          </label>

          <select
            value={guruCommentOneDrive}
            onChange={(e) =>
              setGuruCommentOneDrive(e.target.value)
            }
            className="border p-2 rounded w-full"
          >
            <option>DELETE</option>
            <option>RETAIN</option>
            <option>HOLD</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">
            Partner Email Comment
          </label>

          <textarea
            value={partnerCommentEmail}
            onChange={(e) =>
              setPartnerCommentEmail(e.target.value)
            }
            rows={3}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block mb-1">
            Partner OneDrive Comment
          </label>

          <textarea
            value={partnerCommentOneDrive}
            onChange={(e) =>
              setPartnerCommentOneDrive(e.target.value)
            }
            rows={3}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block mb-1">
            Status By IT
          </label>

          <select
            value={statusByIT}
            onChange={(e) =>
              setStatusByIT(e.target.value)
            }
            className="border p-2 rounded w-full"
          >
            <option>PENDING</option>
            <option>STARTED_DOWNLOAD</option>
            <option>DELETED</option>
            <option>HOLD</option>
            <option>COMPLETED</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Changes
        </button>

        {message && (
          <p className="font-semibold">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}