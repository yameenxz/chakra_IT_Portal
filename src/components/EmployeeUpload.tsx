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

export default function EmployeeUpload({
  onUploadComplete,
}: {
  onUploadComplete?: () => void;
}) {
  const [rows, setRows] = useState<
    Record<string, unknown>[]
  >([]);

  const [message, setMessage] =
    useState("");

    const [manualName, setManualName] =
  useState("");

const [manualEmail, setManualEmail] =
  useState("");

const [manualTeam, setManualTeam] =
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

  const deleteRow = (
    index: number
  ) => {
    setRows(
      rows.filter(
        (_, rowIndex) =>
          rowIndex !== index
      )
    );
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
    "Employees saved successfully."
  );

  setRows([]);

  onUploadComplete?.();
} else {
        setMessage(
          "Failed to save employees."
        );
      }
    };

    const addEmployeeManually =
  async () => {
    if (
      !manualName.trim() ||
      !manualEmail.trim() ||
      !manualTeam
    ) {
      setMessage(
        "Please complete all fields."
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
          body: JSON.stringify([
            {
              slNo: 0,
              name:
                manualName.trim(),
              emailId:
                manualEmail.trim(),
              team: manualTeam,
            },
          ]),
        }
      );

    if (response.ok) {
      setManualName("");
      setManualEmail("");
      setManualTeam("");

      setMessage(
        "Employee added successfully."
      );

      onUploadComplete?.();
    } else {
      setMessage(
        "Failed to add employee."
      );
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-[#DFDACB] bg-white p-5 shadow-md">
      <h2 className="mb-4 text-2xl font-bold text-[#1B2A41]">
        Upload Offboarding Employees
      </h2>

      <p className="mb-4 text-sm text-slate-600">
        Upload employee records,
        assign teams, and create
        both Offboarding and Email
        ID Deletion records.
      </p>

      <div className="flex items-center gap-4">
  <input
    type="file"
    accept=".xlsx,.xls"
    onChange={
      handleFileUpload
    }
    className="w-1/3 rounded-xl border border-[#DFDACB] bg-[#FAF8F3] p-3"
  />

  <div className="flex flex-1 gap-3">
    <input
      type="text"
      placeholder="Employee Name"
      value={manualName}
      onChange={(e) =>
        setManualName(
          e.target.value
        )
      }
      className="flex-1 rounded-xl border border-[#DFDACB] px-3 py-3"
    />

    <input
      type="email"
      placeholder="Email ID"
      value={manualEmail}
      onChange={(e) =>
        setManualEmail(
          e.target.value
        )
      }
      className="flex-1 rounded-xl border border-[#DFDACB] px-3 py-3"
    />

    <select
      value={manualTeam}
      onChange={(e) =>
        setManualTeam(
          e.target.value
        )
      }
      className="w-32 rounded-xl border border-[#DFDACB] px-3 py-3"
    >
      <option value="">
        Team
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

    <button
  onClick={addEmployeeManually}
  className="rounded-xl bg-[#1B2A41] px-6 py-3 text-white"
>
      Add
    </button>
  </div>
</div>

      {rows.length > 0 && (
        <>
          <div className="overflow-hidden rounded-2xl border border-[#DFDACB]">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F6F2E8]">
                  <th className="px-6 py-5 text-left">
                    Sl No
                  </th>

                  <th className="px-6 py-5 text-left">
                    Name
                  </th>

                  <th className="px-6 py-5 text-left">
                    Email
                  </th>

                  <th className="px-6 py-5 text-left">
                    Team
                  </th>

                  <th className="px-6 py-5 text-left">
                    Action
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
                      key={index}
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
                        {String(
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
                      </td>

                      <td className="px-6 py-5">
                        {String(
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
                            ""
                        ).trim()}
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
                          className="w-full rounded-xl border border-[#DFDACB] px-4 py-3"
                        >
                          <option value="">
                            Select Team
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
                                {team}
                              </option>
                            )
                          )}
                        </select>
                      </td>

                      <td className="px-6 py-5">
                        <button
                          onClick={() =>
                            deleteRow(
                              index
                            )
                          }
                          className="rounded-xl bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                        >
                          Delete
                        </button>
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
            className="mt-6 rounded-2xl bg-[#1B2A41] px-8 py-3 font-medium text-white shadow-md hover:opacity-90"
          >
            Save Employees
          </button>

          {message && (
            <p className="mt-4 font-medium text-[#1B2A41]">
              {message}
            </p>
          )}
        </>
      )}
    </div>
  );
}