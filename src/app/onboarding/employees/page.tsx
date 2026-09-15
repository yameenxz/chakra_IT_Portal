"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import OnboardingCompactView from "@/components/OnboardingCompactView";

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

export default function OnboardingPage() {
    const router = useRouter();

  const { data: session, status } =
    useSession();

  const role =
    (session?.user as {
      role?: string;
    })?.role || "";
  const [employeeNames, setEmployeeNames] =
    useState("");

  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [expandedEmployee, setExpandedEmployee] =
    useState<string | null>(null);

  const [savingTask, setSavingTask] =
    useState<string | null>(null);

  async function loadEmployees() {
    try {
      const response =
        await fetch(
          "/api/onboarding"
        );

      const data =
        await response.json();

      setEmployees(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  async function addEmployees() {
    if (!employeeNames.trim()) {
      return;
    }

    setLoading(true);

    try {
      const names = employeeNames
  .split("\n")
  .map((name) => name.trim())
  .filter(Boolean);

for (const employeeName of names) {
  await fetch(
    "/api/onboarding",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        employeeName,
      }),
    }
  );
}

      setEmployeeNames("");

      await loadEmployees();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteEmployee(
  id: string
) {
  try {
    await fetch(
      `/api/onboarding/${id}`,
      {
        method: "DELETE",
      }
    );

    await loadEmployees();
  } catch (error) {
    console.error(error);
  }
}

  function getCompletedTasks(
    tasks: Task[]
  ) {
    return tasks.filter(
      (task) =>
        task.status ===
        "Complete"
    ).length;
  }

  function getProgress(
  tasks: Task[]
) {
  const points =
    tasks.reduce(
      (total, task) => {
        if (
          task.status ===
          "Complete"
        ) {
          return total + 1;
        }

        if (
          task.status ===
          "In Progress"
        ) {
          return total + 0.5;
        }

        return total;
      },
      0
    );

  return tasks.length
    ? Math.round(
        (points /
          tasks.length) *
          100
      )
    : 0;
}

  const totalEmployees =
    employees.length;

  const completedEmployees =
    employees.filter(
      (employee) =>
        getProgress(
          employee.tasks
        ) === 100
    ).length;

  const inProgressEmployees =
    employees.filter(
      (employee) =>
        getProgress(
          employee.tasks
        ) > 0 &&
        getProgress(
          employee.tasks
        ) < 100
    ).length;

  const averageProgress =
    employees.length === 0
      ? 0
      : Math.round(
          employees.reduce(
            (
              total,
              employee
            ) =>
              total +
              getProgress(
                employee.tasks
              ),
            0
          ) /
            employees.length
        );

  async function autoSaveEmployee(
    employee: Employee
  ) {
    try {
      await fetch(
        `/api/onboarding/${employee.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            tasks:
              employee.tasks,
          }),
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function updateTaskField(
  employeeId: string,
  taskId: string,
  field:
    | "status"
    | "assignedTo"
    | "azureTeam"
    | "seqriteTeam",
  value: string
) {
  const employee =
    employees.find(
      (employee) =>
        employee.id ===
        employeeId
    );

  if (!employee) {
    return;
  }

  const updatedEmployee = {
    ...employee,

    tasks: employee.tasks.map(
      (task) =>
        task.id === taskId
          ? {
              ...task,
              [field]:value,
            }
          : task
    ),
  };

  setEmployees(
    (current) =>
      current.map(
        (employee) =>
          employee.id ===
          employeeId
            ? updatedEmployee
            : employee
      )
  );

  try {
    setSavingTask(
      `${taskId}-${field}`
    );

    await autoSaveEmployee(
      updatedEmployee
    );

    await loadEmployees();
  } finally {
    setSavingTask(
      null
    );
  }
} 
  useEffect(() => {
  if (
    status !== "loading" &&
    role !== "IT" &&
    role !== "IT_HEAD" &&
    role !== "ADMIN"
  ) {
    router.replace("/home");
  }
}, [role, status, router]);

if (
  status === "loading" ||
  (role !== "IT" &&
   role !== "IT_HEAD" &&
   role !== "ADMIN")
) {
  return null;
}

    return (
    <main className="min-h-screen bg-[#F4F2EC] px-8 py-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">

          <h1 className="text-4xl font-bold text-[#1B2A41]">
            Employee Onboarding Tracking
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Manage onboarding activities,
            owner assignments,
            Azure policy allocation
            and onboarding task tracking.
          </p>

        </div>

        

        <div className="mb-6 rounded-2xl border border-[#DFDACB] bg-white p-4 shadow-md">

          <h2 className="text-lg font-semibold">
            Add Employee
          </h2>

          <div className="flex items-center gap-4">

  <textarea
    value={employeeNames}
    onChange={(e) =>
      setEmployeeNames(
        e.target.value
      )
    }
    placeholder={
      "Press Enter after each employee name"
    }
    rows={2}
    className="flex-1 resize-none rounded-lg border border-[#DFDACB] px-3 py-2"
  />

            <button
              onClick={addEmployees}
              disabled={loading}
              className="rounded-lg bg-[#1B2A41] px-5 py-2 text-white"
            >
              {loading
                ? "Adding..."
                : "Add Employees"}
            </button>

          </div>

        </div>

        <div className="space-y-4">
  {employees.map((employee) => (
    <OnboardingCompactView
      key={employee.id}
      employee={employee}
      expanded={
        expandedEmployee === employee.id
      }
      onToggle={() =>
        setExpandedEmployee(
          expandedEmployee === employee.id
            ? null
            : employee.id
        )
      }
      onDelete={() =>
        deleteEmployee(employee.id)
      }
      updateTaskField={
        updateTaskField
      }
    />
  ))}
</div>

      </div>
    </main>
  );
}