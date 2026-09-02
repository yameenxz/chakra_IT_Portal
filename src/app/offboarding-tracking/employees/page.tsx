"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import OffboardingCompactView from "@/components/OffboardingCompactView";

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
  tasks: Task[];
};

export default function OffboardingEmployeesPage() {
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

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (
      status !== "loading" &&
      role !== "IT" &&
      role !== "ADMIN"
    ) {
      router.replace("/home");
    }
  }, [role, status, router]);

  async function loadEmployees() {
    try {
      const response = await fetch(
        "/api/offboarding-tracking"
      );

      const data =
        await response.json();

      setEmployees(data);
    } catch (error) {
      console.error(error);
    }
  }

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
          "/api/offboarding-tracking",
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
    const confirmed =
      window.confirm(
        "Delete employee?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await fetch(
        `/api/offboarding-tracking/${id}`,
        {
          method: "DELETE",
        }
      );

      await loadEmployees();
    } catch (error) {
      console.error(error);
    }
  }

  async function autoSaveEmployee(
    employee: Employee
  ) {
    try {
      await fetch(
        `/api/offboarding-tracking/${employee.id}`,
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
      | "assignedTo",
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
      await autoSaveEmployee(
        updatedEmployee
      );

      await loadEmployees();
    } catch (error) {
      console.error(error);
    }
  }

  if (
    status === "loading" ||
    (role !== "IT" &&
      role !== "ADMIN")
  ) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#F4F2EC] px-8 py-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1B2A41]">
            Employee Offboarding Tracking
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Manage offboarding activities,
            task ownership,
            deprovisioning progress
            and asset recovery tracking.
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
              placeholder="Press Enter after each employee name"
              rows={2}
              className="flex-1 resize-none rounded-lg border border-[#DFDACB] px-3 py-2"
            />

            <button
              onClick={
                addEmployees
              }
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
          {employees.map(
            (employee) => (
              <OffboardingCompactView
                key={
                  employee.id
                }
                employee={
                  employee
                }
                expanded={
                  expandedEmployee ===
                  employee.id
                }
                onToggle={() =>
                  setExpandedEmployee(
                    expandedEmployee ===
                      employee.id
                      ? null
                      : employee.id
                  )
                }
                onDelete={() =>
                  deleteEmployee(
                    employee.id
                  )
                }
                updateTaskField={
                  updateTaskField
                }
              />
            )
          )}
        </div>

      </div>
    </main>
  );
}