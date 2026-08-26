"use client";

import { useState } from "react";

type Task = {
  id: string;
  slNo: number;
  stage: string;
  taskName: string;
  status: string;
  assignedTo?: string | null;
  azureTeam?: string | null;
  seqriteTeam?: string | null;
};

type Employee = {
  id: string;
  employeeName: string;
  tasks: Task[];
};

type Props = {
  employee: Employee;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  updateTaskField: (
  employeeId: string,
  taskId: string,
  field:
    | "status"
    | "assignedTo"
    | "azureTeam"
    | "seqriteTeam",
  value: string
) => void;
};

const OWNERS = [
  "Janaki Raman S",
  "Arun R",
  "Santhosh Kumar M",
  "Jaganathan R",
  "HR Coordinator",
];

const AZURE_TEAMS = [
  "AUDIT",
  "CLT",
  "CAS",
  "TAX",
  "HR",
  "OAS",
  "DT",
  "GMO",
  "IDT",
];

const AZURE_TEAM_OPTIONS = [
  "AUDIT",
  "CLT",
  "CAS",
  "TAX",
  "HR",
  "OAS",
  "DT",
  "GMO",
  "IDT",
  "OTHER",
];


export default function OnboardingCompactView({
  employee,
  expanded,
  onToggle,
  onDelete,
  updateTaskField,
}: Props) {
  const preBoarding =
    employee.tasks.filter(
      (task) =>
        task.stage ===
        "Pre-Boarding"
    );

  const onboard =
    employee.tasks.filter(
      (task) =>
        task.stage ===
        "Onboard"
    );
    const progress = Math.round(
  (employee.tasks.reduce(
    (total, task) => {
      if (task.status === "Complete") {
        return total + 1;
      }

      if (task.status === "In Progress") {
        return total + 0.5;
      }

      return total;
    },
    0
  ) /
    employee.tasks.length) *
    100
);
const completedTasks =
  employee.tasks.filter(
    (task) =>
      task.status === "Complete"
  ).length;

    const [editingAzureTask, setEditingAzureTask] =
  useState<string | null>(null);

const [customAzureTeam, setCustomAzureTeam] =
  useState("");

  const [editingSeqriteTask, setEditingSeqriteTask] =
  useState<string | null>(null);

const [customSeqriteTeam, setCustomSeqriteTeam] =
  useState("");

  return (
    <div className="overflow-hidden rounded-2xl border bg-white">

      <div className="flex items-center justify-between px-4 py-3">

        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500 text-xl font-bold text-white">
            {employee.employeeName.charAt(0)}
          </div>

          <div>
  <h3 className="text-xl font-semibold">
    {employee.employeeName}
  </h3>

 <div className="mt-2 h-2 w-72 overflow-hidden rounded-full bg-slate-200">
  <div
    className={`h-full ${
  progress < 30
    ? "bg-red-500"
    : progress < 70
    ? "bg-yellow-500"
    : "bg-green-500"
}`}
    style={{
      width: `${progress}%`,
    }}
  />
</div>

<p className="mt-1 text-xs text-slate-500">
  {completedTasks}/{employee.tasks.length} Tasks Completed
</p>
</div>

        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={onToggle}
            className="rounded-lg border px-3 py-2"
          >
            {expanded
              ? "Collapse"
              : "Expand"}
          </button>

          <button
            onClick={onDelete}
            className="rounded-lg bg-red-600 px-3 py-2 text-white"
          >
            Delete
          </button>

        </div>

      </div>

      {expanded && (
        <div className="border-t px-6 py-6">

          <div>

            <div className="mb-4 flex items-center gap-4">

              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                Pre-Boarding
              </h4>

              <div className="h-px flex-1 bg-slate-200" />

            </div>

            <div className="space-y-3">

              {preBoarding.map(
                (task) => (

                  <div
                    key={task.id}
                    className="grid grid-cols-[60px_1fr_220px_340px] items-center gap-4 border-b pb-3"
                  >

                    <div className="font-mono text-slate-500">
                      {String(
                        task.slNo
                      ).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    <div className="font-medium">
                      {task.taskName}
                    </div>

                    <select
                      value={
                        task.assignedTo ??
                        ""
                      }
                      onChange={(e) =>
                        updateTaskField(
                          employee.id,
                          task.id,
                          "assignedTo",
                          e.target.value
                        )
                      }
                      className="rounded-lg border p-2"
                    >
                      <option value="">
                        Select Owner
                      </option>

                      {OWNERS.map(
                        (owner) => (
                          <option
                            key={owner}
                            value={owner}
                          >
                            {owner}
                          </option>
                        )
                      )}
                    </select>

                    <div className="flex overflow-hidden rounded-lg border">

                      <button
                        onClick={() =>
                          updateTaskField(
                            employee.id,
                            task.id,
                            "status",
                            "Not Started"
                          )
                        }
                        className={`flex-1 px-3 py-2 text-sm ${
  task.status === "Not Started"
    ? "bg-slate-500 text-white"
    : "bg-white"
}`}
                      >
                        Not Started
                      </button>

                      <button
                        onClick={() =>
                          updateTaskField(
                            employee.id,
                            task.id,
                            "status",
                            "In Progress"
                          )
                        }
                        className={`flex-1 border-l px-3 py-2 text-sm ${
  task.status === "In Progress"
    ? "bg-yellow-500 text-white"
    : "bg-white"
}`}
                      >
                        In Progress
                      </button>

                      <button
                        onClick={() =>
                          updateTaskField(
                            employee.id,
                            task.id,
                            "status",
                            "Complete"
                          )
                        }
                        className={`flex-1 border-l px-3 py-2 text-sm ${
  task.status === "Complete"
    ? "bg-green-600 text-white"
    : "bg-white"
}`}
                      >
                        Complete
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

          <div className="mt-10">

            <div className="mb-4 flex items-center gap-4">

              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                Onboard
              </h4>

              <div className="h-px flex-1 bg-slate-200" />

            </div>

            <div className="space-y-3">

              {onboard.map(
                (task) => (

                  <div
                    key={task.id}
                    className="grid grid-cols-[60px_1fr_220px_340px] items-center gap-4 border-b pb-3"
                  >

                    <div className="font-mono text-slate-500">
                      {String(
                        task.slNo
                      ).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3">
  <span className="font-medium">
    {task.taskName}
  </span>

  {task.taskName === "Azure Policy Apply" && (
  editingAzureTask === task.id ? (
    <input
      type="text"
      value={customAzureTeam}
      onChange={(e) =>
        setCustomAzureTeam(e.target.value)
      }
      onKeyDown={(e) => {
  if (
    e.key === "Enter" &&
    customAzureTeam.trim()
  ) {

    console.log(
      "Saving:",
      customAzureTeam
    );

    updateTaskField(
      employee.id,
      task.id,
      "azureTeam",
      customAzureTeam.trim()
    );

    setEditingAzureTask(null);
  }
}}
      onBlur={() => {
        if (customAzureTeam.trim()) {
          updateTaskField(
            employee.id,
            task.id,
            "azureTeam",
            customAzureTeam.trim()
          );
        }

        setEditingAzureTask(null);
      }}
      placeholder="Enter Team"
      className="w-48 rounded-lg border p-2"
      autoFocus
    />
  ) : (
    <select
      value={task.azureTeam ?? ""}
      onChange={(e) => {
        if (e.target.value === "OTHER") {
          setEditingAzureTask(task.id);
          setCustomAzureTeam("");
          return;
        }

        updateTaskField(
          employee.id,
          task.id,
          "azureTeam",
          e.target.value
        );
      }}
      className="w-48 rounded-lg border p-2"
    >
      <option value="">
        Team
      </option>
      {task.azureTeam &&
 !AZURE_TEAM_OPTIONS.includes(task.azureTeam) && (
  <option value={task.azureTeam}>
    {task.azureTeam}
  </option>
)}

      {AZURE_TEAM_OPTIONS.map((team) => (
        <option
          key={team}
          value={team}
        >
          {team}
        </option>
      ))}
    </select>
  )
)}
{task.taskName ===
  "Seqrite Antivirus Installation" &&
(
  editingSeqriteTask === task.id ? (
    <input
      type="text"
      value={customSeqriteTeam}
      onChange={(e) =>
        setCustomSeqriteTeam(
          e.target.value
        )
      }
      onKeyDown={(e) => {
        if (
          e.key === "Enter" &&
          customSeqriteTeam.trim()
        ) {
          updateTaskField(
            employee.id,
            task.id,
            "seqriteTeam",
            customSeqriteTeam.trim()
          );

          setEditingSeqriteTask(
            null
          );
        }
      }}
      onBlur={() => {
        if (
          customSeqriteTeam.trim()
        ) {
          updateTaskField(
            employee.id,
            task.id,
            "seqriteTeam",
            customSeqriteTeam.trim()
          );
        }

        setEditingSeqriteTask(
          null
        );
      }}
      placeholder="Team"
      className="w-48 rounded-lg border p-2"
      autoFocus
    />
  ) : (
    <select
      value={
        task.seqriteTeam ?? ""
      }
      onChange={(e) => {
        if (
          e.target.value ===
          "OTHER"
        ) {
          setEditingSeqriteTask(
            task.id
          );
          setCustomSeqriteTeam(
            ""
          );
          return;
        }

        updateTaskField(
          employee.id,
          task.id,
          "seqriteTeam",
          e.target.value
        );
      }}
      className="w-48 rounded-lg border p-2"
    >
      <option value="">
        Team
      </option>

      {task.seqriteTeam &&
        !AZURE_TEAM_OPTIONS.includes(
          task.seqriteTeam
        ) && (
          <option
            value={
              task.seqriteTeam
            }
          >
            {task.seqriteTeam}
          </option>
        )}

      {AZURE_TEAM_OPTIONS.map(
        (team) => (
          <option
            key={team}
            value={team}
          >
            {team}
          </option>
        )
      )}
    </select>
  )
)}
</div>

                    <select
                      value={
                        task.assignedTo ??
                        ""
                      }
                      onChange={(e) =>
                        updateTaskField(
                          employee.id,
                          task.id,
                          "assignedTo",
                          e.target.value
                        )
                      }
                      className="rounded-lg border p-2"
                    >
                      <option value="">
                        Select Owner
                      </option>

                      {OWNERS.map(
                        (owner) => (
                          <option
                            key={owner}
                            value={owner}
                          >
                            {owner}
                          </option>
                        )
                      )}
                    </select>

                    <div className="flex overflow-hidden rounded-lg border">

                      <button
                        onClick={() =>
                          updateTaskField(
                            employee.id,
                            task.id,
                            "status",
                            "Not Started"
                          )
                        }
                        className={`flex-1 px-3 py-2 text-sm ${
  task.status === "Not Started"
    ? "bg-slate-500 text-white"
    : "bg-white"
}`}
                      >
                        Not Started
                      </button>

                      <button
                        onClick={() =>
                          updateTaskField(
                            employee.id,
                            task.id,
                            "status",
                            "In Progress"
                          )
                        }
                        className={`flex-1 border-l px-3 py-2 text-sm ${
  task.status === "In Progress"
    ? "bg-yellow-500 text-white"
    : "bg-white"
}`}
                      >
                        In Progress
                      </button>

                      <button
                        onClick={() =>
                          updateTaskField(
                            employee.id,
                            task.id,
                            "status",
                            "Complete"
                          )
                        }
                        className={`flex-1 border-l px-3 py-2 text-sm ${
  task.status === "Complete"
    ? "bg-green-600 text-white"
    : "bg-white"
}`}
                      >
                        Complete
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}