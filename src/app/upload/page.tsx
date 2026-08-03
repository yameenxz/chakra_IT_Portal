"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

const teams = [
  "CLT",
  "CAS",
  "AUDIT",
  "IDT",
  "OAS",
  "HR",
  "DT",
  "GMO",
];

export default function UploadPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [message, setMessage] = useState("");

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;

      const workbook = XLSX.read(data, {
        type: "binary",
      });

      const sheetName = workbook.SheetNames[0];

      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
      });

      setRows(jsonData as Record<string, unknown>[]);
    };

    reader.readAsBinaryString(file);
  };

  const saveEmployees = async () => {
    const employees = rows.map((row) => ({
      slNo: Number(row["Slno"] ?? 0),

      name: String(
        row["Name "] ?? row["Name"] ?? ""
      ).trim(),

      emailId: String(
        row["Email ID"] ?? ""
      ).trim(),

      team: String(
        row["Team"] ?? ""
      ).trim() || null,
    }));

    const response = await fetch(
      "/api/employees",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(employees),
      }
    );

    if (response.ok) {
      setMessage(
        "Employees saved successfully!"
      );
    } else {
      setMessage(
        "Failed to save employees."
      );
    }
  };

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-4xl font-bold mb-6">
        Upload Employee Excel File
      </h1>

      <div className="rounded border p-6 max-w-xl">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="mb-4 block"
        />
      </div>

      {rows.length > 0 && (
        <>
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">
              Imported Employees
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">
                      Sl No
                    </th>
                    <th className="border p-2">
                      Name
                    </th>
                    <th className="border p-2">
                      Email ID
                    </th>
                    <th className="border p-2">
                      Team
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index}>
                      <td className="border p-2">
                        {String(
                          row["Slno"] ?? ""
                        )}
                      </td>

                      <td className="border p-2">
                        <input
                          defaultValue={String(
                            row["Name "] ??
                              row["Name"] ??
                              ""
                          ).trim()}
                          className="w-full border rounded px-2 py-1"
                        />
                      </td>

                      <td className="border p-2">
                        <input
                          defaultValue={String(
                            row["Email ID"] ??
                              ""
                          ).trim()}
                          className="w-full border rounded px-2 py-1"
                        />
                      </td>

                      <td className="border p-2">
                        <select
                          defaultValue={String(
                            row["Team"] ??
                              ""
                          ).trim()}
                          className="w-full border rounded px-2 py-1"
                        >
                          <option value="">
                            Select Team
                          </option>

                          {teams.map((team) => (
                            <option
                              key={team}
                              value={team}
                            >
                              {team}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={saveEmployees}
            className="mt-6 rounded bg-blue-600 px-4 py-2 text-white"
          >
            Save Employees
          </button>

          {message && (
            <p className="mt-4 font-semibold">
              {message}
            </p>
          )}
        </>
      )}
    </main>
  );
}