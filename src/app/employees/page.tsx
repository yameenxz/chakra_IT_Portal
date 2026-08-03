import { prisma } from "@/lib/prisma";

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    orderBy: {
      slNo: "asc",
    },
  });

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-4xl font-bold mb-6">
        Employees
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Sl No</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email ID</th>
              <th className="border p-2">Team</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="border p-2">
                  {employee.slNo}
                </td>

                <td className="border p-2">
                  {employee.name}
                </td>

                <td className="border p-2">
                  {employee.emailId}
                </td>

                <td className="border p-2">
                  {employee.team ?? "-"}
                </td>

                <td className="border p-2">
                  {employee.statusByIT}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <p>
          Total Employees: {employees.length}
        </p>
      </div>
    </main>
  );
}