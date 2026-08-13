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
  const [rows, setRows] = useState<
    Record<string, unknown>[]
  >([]);

  const [message, setMessage] =
    useState("");

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = (e) => {
      const data =
        e.target?.result;

      const workbook = XLSX.read(
        data,
        {
          type: "binary",
        }
      );

      const sheetName =
        workbook.SheetNames[0];

      const worksheet =
        workbook.Sheets[sheetName];

      const jsonData =
        XLSX.utils.sheet_to_json(
          worksheet,
          {
            defval: "",
          }
        );

      setRows(
        jsonData as Record<
          string,
          unknown
        >[]
      );
    };

    reader.readAsBinaryString(
      file
    );
  };

  const updateTeam = (
    index: number,
    team: string
  ) => {
    const updatedRows = [...rows];

    updatedRows[index] = {
      ...updatedRows[index],
      Team: team,
      team,
    };

    setRows(updatedRows);
  };

  const saveEmployees =
    async () => {
      const employees =
        rows.map((row) => {
          const normalized =
            Object.fromEntries(
              Object.entries(
                row
              ).map(
                ([
                  key,
                  value,
                ]) => [
                  key
                    .trim()
                    .toLowerCase(),
                  value,
                ]
              )
            );

          return {
            slNo: Number(
              normalized[
                "slno"
              ] ??
                normalized[
                  "sl no"
                ] ??
                0
            ),

            name: String(
              normalized[
                "name"
              ] ?? ""
            ).trim(),

            emailId: String(
              normalized[
                "email id"
              ] ??
                normalized[
                  "email"
                ] ??
                normalized[
                  "emailid"
                ] ??
                ""
            ).trim(),

            team: String(
              normalized[
                "team"
              ] ?? ""
            ).trim(),
          };
        });

      const missingTeams =
        employees.filter(
          (employee) =>
            !employee.team
        );

      if (
        missingTeams.length > 0
      ) {
        setMessage(
          "Please select a team for all employees."
        );
        return;
      }

      const response =
        await fetch(
          "/api/employees",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              employees
            ),
          }
        );

      if (response.ok) {
        setMessage(
          "Employees saved successfully. Redirecting to Employees..."
        );

        setTimeout(() => {
          window.location.href =
            "/employees";
        }, 1000);
      } else {
        setMessage(
          "Failed to save employees."
        );
      }
    };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Upload Employees
          </h1>

          <p className="mt-2 text-slate-300">
            Import employee
            records from an
            Excel file.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-2xl">
          <label className="mb-4 block text-sm font-medium text-slate-700">
            Select Excel File
          </label>

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={
              handleFileUpload
            }
            className="block w-full rounded-xl border border-slate-200 bg-slate-50 p-4"
          />
        </div>

        {rows.length > 0 && (
          <>
            <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-2xl">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-100">
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
                  {rows.map(
                    (
                      row,
                      index
                    ) => (
                      <tr
                        key={
                          index
                        }
                        className={
                          index %
                            2 ===
                          0
                            ? "bg-white hover:bg-slate-50"
                            : "bg-slate-50 hover:bg-slate-100"
                        }
                      >
                        <td className="px-6 py-5">
                          {String(
                            row[
                              "Slno"
                            ] ??
                              row[
                                "slno"
                              ] ??
                              ""
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <input
                            value={String(
                              row[
                                "Name "
                              ] ??
                                row[
                                  "Name"
                                ] ??
                                row[
                                  "name"
                                ] ??
                                ""
                            ).trim()}
                            readOnly
                            className="w-full rounded-xl border border-slate-200 px-4 py-3"
                          />
                        </td>

                        <td className="px-6 py-5">
                          <input
                            value={String(
                              row[
                                "Email ID"
                              ] ??
                                row[
                                  "Email ID "
                                ] ??
                                row[
                                  "Email"
                                ] ??
                                row[
                                  "email"
                                ] ??
                                row[
                                  "email id"
                                ] ??
                                ""
                            ).trim()}
                            readOnly
                            className="w-full rounded-xl border border-slate-200 px-4 py-3"
                          />
                        </td>

                        <td className="px-6 py-5">
                          <select
                            value={String(
                              row[
                                "Team"
                              ] ??
                                row[
                                  "team"
                                ] ??
                                ""
                            ).trim()}
                            onChange={(
                              e
                            ) =>
                              updateTeam(
                                index,
                                e
                                  .target
                                  .value
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 px-4 py-3"
                          >
                            <option value="">
                              Select
                              Team
                            </option>

                            {teams.map(
                              (
                                team
                              ) => (
                                <option
                                  key={
                                    team
                                  }
                                  value={
                                    team
                                  }
                                >
                                  {
                                    team
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <button
              onClick={
                saveEmployees
              }
              className="mt-6 rounded-2xl bg-violet-600 px-8 py-3 font-medium text-white shadow-lg transition hover:bg-violet-700"
            >
              Save Employees
            </button>

            {message && (
              <p className="mt-4 font-medium text-white">
                {message}
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}