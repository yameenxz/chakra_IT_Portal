import { prisma } from "@/lib/prisma";
import EmployeeForm from "./EmployeeForm";

export default async function EmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const employee = await prisma.employee.findUnique({
    where: {
      id,
    },
  });

  if (!employee) {
    return (
      <main className="p-10">
        <h1>Employee not found</h1>
      </main>
    );
  }

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">
        Employee Details
      </h1>

      <div className="space-y-4 border rounded p-6">
        <p>
          <strong>Name:</strong> {employee.name}
        </p>

        <p>
          <strong>Email:</strong> {employee.emailId}
        </p>

        <p>
          <strong>Team:</strong> {employee.team ?? "-"}
        </p>

        <p>
          <strong>Status:</strong> {employee.statusByIT}
        </p>
      </div>

      <EmployeeForm employeeId={id} />
    </main>
  );
}