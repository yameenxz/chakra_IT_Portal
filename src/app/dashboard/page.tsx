export default function DashboardPage() {
  return (
    <main className="min-h-screen p-10">
      <h1 className="text-4xl font-bold mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">
          <h2 className="font-semibold">Total Employees</h2>
          <p className="text-2xl">0</p>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="font-semibold">Pending IT Review</h2>
          <p className="text-2xl">0</p>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="font-semibold">Awaiting Approval</h2>
          <p className="text-2xl">0</p>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="font-semibold">Delete Approved</h2>
          <p className="text-2xl">0</p>
        </div>
      </div>
    </main>
  );
}