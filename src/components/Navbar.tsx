"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  email: string;
  role: string;
  name: string;
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [users, setUsers] = useState<User[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [role, setRole] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("email") || "";
    const savedRole = localStorage.getItem("role") || "";

    setCurrentEmail(email);
    setRole(savedRole);

    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
      })
      .catch(console.error)
      .finally(() => {
        setMounted(true);
      });
  }, []);

  const switchUser = (email: string) => {
    const selectedUser = users.find(
      (user) => user.email === email
    );

    if (!selectedUser) return;

    localStorage.setItem(
      "email",
      selectedUser.email
    );

    localStorage.setItem(
      "role",
      selectedUser.role
    );

    window.location.href = "/";
  };

  if (!mounted) {
    return null;
  }

  const isPortalHome = pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b border-violet-900/40 bg-gradient-to-r from-slate-900 via-violet-950 to-slate-900 shadow-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
        <div>
          <h1 className="text-xl font-bold text-white">
            IT Service Portal
          </h1>

          <p className="text-xs text-slate-400">
            Internal Operations Platform
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-slate-400">
              Logged In User
            </label>

            <select
              value={currentEmail}
              onChange={(e) =>
                switchUser(e.target.value)
              }
              className="rounded-xl border border-violet-800/30 bg-slate-800/80 px-4 py-2 text-white shadow-sm outline-none backdrop-blur-sm"
            >
              <option value="">
                Select User
              </option>

              {users.map((user) => (
                <option
                  key={user.email}
                  value={user.email}
                >
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>

          <nav className="flex gap-8 text-sm font-medium text-slate-300">
            <button
              onClick={() => router.push("/")}
              className="text-violet-300 transition hover:text-violet-200"
            >
              Home
            </button>

            {!isPortalHome && (
              <>
                {(role === "IT" ||
                  role === "ADMIN") && (
                  <>
                    <button
                      onClick={() =>
                        router.push("/dashboard")
                      }
                      className="transition hover:text-violet-300"
                    >
                      Dashboard
                    </button>

                    <button
                      onClick={() =>
                        router.push("/employees")
                      }
                      className="transition hover:text-violet-300"
                    >
                      Employees
                    </button>

                    <button
                      onClick={() =>
                        router.push("/upload")
                      }
                      className="transition hover:text-violet-300"
                    >
                      Upload
                    </button>

                    <button
                      onClick={() =>
                        router.push("/reports")
                      }
                      className="transition hover:text-violet-300"
                    >
                      Reports
                    </button>
                  </>
                )}

                {(role === "GURU" ||
                  role === "ADMIN") && (
                  <>
                    <button
                      onClick={() =>
                        router.push("/employees")
                      }
                      className="transition hover:text-violet-300"
                    >
                      Employees
                    </button>

                    <button
                      onClick={() =>
                        router.push("/director")
                      }
                      className="transition hover:text-violet-300"
                    >
                      Guru Queue
                    </button>

                    <button
                      onClick={() =>
                        router.push("/reports")
                      }
                      className="transition hover:text-violet-300"
                    >
                      Reports
                    </button>
                  </>
                )}

                {(role === "DIRECTOR" ||
                  role === "PARTNER" ||
                  role === "ADMIN") && (
                  <button
                    onClick={() =>
                      router.push("/partner")
                    }
                    className="transition hover:text-violet-300"
                  >
                    Review Queue
                  </button>
                )}

                <button
                  onClick={() =>
                    router.push("/history")
                  }
                  className="transition hover:text-violet-300"
                >
                  History
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}