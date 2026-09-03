"use client";

type Task = {
  id: string;
  slNo: number;
  stage: string;
  taskName: string;
  status: string;
  assignedTo?: string | null;
};

type Employee = {
  id: string;
  employeeName: string;
  team?: string | null;
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
    field: "status" | "assignedTo",
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

export default function OffboardingCompactView({
  employee,
  expanded,
  onToggle,
  onDelete,
  updateTaskField,
}: Props) {
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

  return (
    <div className="overflow-hidden rounded-2xl border border-[#DFDACB] bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F1E6BE] text-xl font-bold text-[#1B2A41]">
            {employee.employeeName.charAt(0)}
          </div>

          <div>
  <h3 className="text-xl font-semibold">
    {employee.employeeName}
  </h3>

  {employee.team && (
    <p className="text-sm font-medium text-slate-500">
      Team: {employee.team}
    </p>
  )}

  <div className="mt-2 h-2 w-72 overflow-hidden rounded-full bg-[#E8E2D5]">
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
              {completedTasks}/
              {employee.tasks.length} Tasks
              Completed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
  onClick={() =>
    window.open(
      `/api/offboarding-tracking/export/${employee.id}`,
      "_blank"
    )
  }
  className="rounded-lg bg-[#1B2A41] px-3 py-2 text-white"
>
  Export Excel
</button>

          <button
            onClick={onToggle}
            className="rounded-lg bg-[#F1E6BE] px-3 py-2 text-[#1B2A41]"
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
          <div className="mb-4 flex items-center gap-4">
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
              Offboarding Tasks
            </h4>

            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="space-y-3">
            {employee.tasks.map(
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
                    {
                      task.taskName
                    }
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
                        task.status ===
                        "Not Started"
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
                        task.status ===
                        "In Progress"
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
                        task.status ===
                        "Complete"
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
      )}
    </div>
  );
}