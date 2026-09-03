"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import OffboardingCompactView from "@/components/OffboardingCompactView";
import EmployeeUpload from "@/components/EmployeeUpload";

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

export default function OffboardingEmployeesPage() {
  const router = useRouter();

  const { data: session, status } =
    useSession();

  const role =
    (session?.user as {
      role?: string;
    })?.role || "";

  const [employees, setEmployees] =
    useState<Employee[]>([]);

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

  async function deleteEmployee(
    id: string
  ) {
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
                value,
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

        <EmployeeUpload
  onUploadComplete={
    loadEmployees
  }
/>

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