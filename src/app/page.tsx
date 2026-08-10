"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const [role, setRole] = useState("IT");

  useEffect(() => {
    const savedRole =
      localStorage.getItem("role");

    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-semibold text-slate-800">
            {role === "DIRECTOR"
              ? "Director Portal"
              : role === "PARTNER"
              ? "Partner Portal"
              : role === "ADMIN"
              ? "Admin Portal"
              : "IT Service Portal"}
          </h1>

          <p className="text-slate-500 mt-2">
            Role-based access portal.
          </p>
        </div>

        {role === "IT" && (
          <>
            <h2 className="text-xl font-semibold text-slate-800 mb-6">
              IT Quick Actions
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <button
                onClick={() =>
                  router.push("/employees")
                }
                className="bg-blue-100 rounded-2xl p-8 text-left"
              >
                <h3 className="text-xl font-semibold">
                  Employees
                </h3>

                <p className="mt-2">
                  Manage employee records.
                </p>
              </button>

              <button
                onClick={() =>
                  router.push("/dashboard")
                }
                className="bg-green-100 rounded-2xl p-8 text-left"
              >
                <h3 className="text-xl font-semibold">
                  Dashboard
                </h3>

                <p className="mt-2">
                  Process IT requests.
                </p>
              </button>

              <button
                onClick={() =>
                  router.push("/upload")
                }
                className="bg-pink-100 rounded-2xl p-8 text-left"
              >
                <h3 className="text-xl font-semibold">
                  Upload
                </h3>

                <p className="mt-2">
                  Import employee files.
                </p>
              </button>

              <button
                onClick={() =>
                  router.push("/reports")
                }
                className="bg-cyan-100 rounded-2xl p-8 text-left"
              >
                <h3 className="text-xl font-semibold">
                  Reports
                </h3>

                <p className="mt-2">
                  View reporting data.
                </p>
              </button>

              <button
                onClick={() =>
                  router.push("/history")
                }
                className="bg-amber-100 rounded-2xl p-8 text-left"
              >
                <h3 className="text-xl font-semibold">
                  History
                </h3>

                <p className="mt-2">
                  Audit trail and logs.
                </p>
              </button>
            </div>
          </>
        )}

        {role === "DIRECTOR" && (
          <>
            <h2 className="text-xl font-semibold text-slate-800 mb-6">
              Director Workspace
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() =>
                  router.push("/director")
                }
                className="bg-green-100 rounded-2xl p-8 text-left"
              >
                <h3 className="text-xl font-semibold">
                  Director Queue
                </h3>

                <p className="mt-2">
                  Review pending approvals.
                </p>
              </button>

              <button
                onClick={() =>
                  router.push("/history")
                }
                className="bg-amber-100 rounded-2xl p-8 text-left"
              >
                <h3 className="text-xl font-semibold">
                  Approval History
                </h3>

                <p className="mt-2">
                  Review previous actions.
                </p>
              </button>
            </div>
          </>
        )}

        {role === "PARTNER" && (
          <>
            <h2 className="text-xl font-semibold text-slate-800 mb-6">
              Partner Workspace
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() =>
                  router.push("/partner")
                }
                className="bg-purple-100 rounded-2xl p-8 text-left"
              >
                <h3 className="text-xl font-semibold">
                  Partner Queue
                </h3>

                <p className="mt-2">
                  Review partner approvals.
                </p>
              </button>

              <button
                onClick={() =>
                  router.push("/history")
                }
                className="bg-amber-100 rounded-2xl p-8 text-left"
              >
                <h3 className="text-xl font-semibold">
                  History
                </h3>

                <p className="mt-2">
                  Review previous actions.
                </p>
              </button>
            </div>
          </>
        )}

        {role === "ADMIN" && (
          <>
            <h2 className="text-xl font-semibold text-slate-800 mb-6">
              Admin Workspace
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <button
                onClick={() =>
                  router.push("/employees")
                }
                className="bg-blue-100 rounded-2xl p-8 text-left"
              >
                Employees
              </button>

              <button
                onClick={() =>
                  router.push("/dashboard")
                }
                className="bg-green-100 rounded-2xl p-8 text-left"
              >
                Dashboard
              </button>

              <button
                onClick={() =>
                  router.push("/upload")
                }
                className="bg-pink-100 rounded-2xl p-8 text-left"
              >
                Upload
              </button>

              <button
                onClick={() =>
                  router.push("/director")
                }
                className="bg-purple-100 rounded-2xl p-8 text-left"
              >
                Director Queue
              </button>

              <button
                onClick={() =>
                  router.push("/partner")
                }
                className="bg-indigo-100 rounded-2xl p-8 text-left"
              >
                Partner Queue
              </button>

              <button
                onClick={() =>
                  router.push("/reports")
                }
                className="bg-cyan-100 rounded-2xl p-8 text-left"
              >
                Reports
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}