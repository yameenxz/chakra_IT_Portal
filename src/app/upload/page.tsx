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

      emailId: String(row["Email ID"] ?? "").trim(),

      team:
        String(row["Team"] ?? "").trim() || null,
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
        "Employees saved successfully."
      );
    } else {
      setMessage(
        "Failed to save employees."
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-slate-800">
            Upload Employees
          </h1>

          <p className="text-slate-500 mt-2">
            Import employee records from an Excel
            file.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <label className="block text-sm font-medium text-slate-700 mb-4">
            Select Excel File
          </label>

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="block w-full rounded-xl border border-slate-200 bg-slate-50 p-4"
          />
        </div>

        {rows.length > 0 && (
          <>
            <div className="mt-10 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-violet-100">
                    <th className="px-6 py-5 text-left font-semibold text-slate-700">
                      Sl No
                    </th>

                    <th className="px-6 py-5 text-left font-semibold text-slate-700">
                      Name
                    </th>

                    <th className="px-6 py-5 text-left font-semibold text-slate-700">
                      Email
                    </th>

                    <th className="px-6 py-5 text-left font-semibold text-slate-700">
                      Team
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, index) => (
                    <tr
                      key={index}
                      className={
                        index % 2 === 0
                          ? "bg-white hover:bg-violet-50"
                          : "bg-slate-50 hover:bg-violet-50"
                      }
                    >
                      <td className="px-6 py-5">
                        {String(
                          row["Slno"] ?? ""
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <input
                          defaultValue={String(
                            row["Name "] ??
                              row["Name"] ??
                              ""
                          ).trim()}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3"
                        />
                      </td>

                      <td className="px-6 py-5">
                        <input
                          defaultValue={String(
                            row["Email ID"] ?? ""
                          ).trim()}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3"
                        />
                      </td>

                      <td className="px-6 py-5">
                        <select
                          defaultValue={String(
                            row["Team"] ?? ""
                          ).trim()}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3"
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

            <button
              onClick={saveEmployees}
              className="mt-6 rounded-2xl bg-violet-500 px-8 py-3 text-white shadow-sm hover:bg-violet-600 transition"
            >
              Save Employees
            </button>

            {message && (
              <p className="mt-4 font-medium text-slate-700">
                {message}
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}