"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  email: string;
  role: string;
  name: string;
};

const USERS: User[] = [
  {
    name: "IT Intern",
    email: "it.intern@gurujana.com",
    role: "IT",
  },
  {
    name: "Director",
    email: "director@test.com",
    role: "DIRECTOR",
  },
  {
    name: "Partner One",
    email: "partner1@test.com",
    role: "PARTNER",
  },
  {
    name: "Partner Two",
    email: "partner2@test.com",
    role: "PARTNER",
  },
  {
    name: "Partner Three",
    email: "partner3@test.com",
    role: "PARTNER",
  },
  {
    name: "Partner Four",
    email: "partner4@test.com",
    role: "PARTNER",
  },
];

export default function Navbar() {
  const router = useRouter();

  const [mounted, setMounted] =
    useState(false);

  const [currentEmail, setCurrentEmail] =
    useState("");

  const [role, setRole] =
    useState("");

  useEffect(() => {
    setMounted(true);

    const email =
      localStorage.getItem("email");

    const savedRole =
      localStorage.getItem("role");

    if (email) {
      setCurrentEmail(email);
    }

    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  const switchUser = (
    email: string
  ) => {
    const selectedUser =
      USERS.find(
        (user) =>
          user.email === email
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

  return (
    <header className="bg-gradient-to-r from-sky-100 via-violet-100 to-pink-100 border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            IT Service Portal
          </h1>

          <p className="text-xs text-slate-500">
            Internal Operations
            Platform
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <label className="text-xs text-slate-500 mb-1">
              Logged In User
            </label>

            <select
              value={
                currentEmail
              }
              onChange={(e) =>
                switchUser(
                  e.target.value
                )
              }
              className="rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="">
                Select User
              </option>

              {USERS.map(
                (user) => (
                  <option
                    key={
                      user.email
                    }
                    value={
                      user.email
                    }
                  >
                    {user.name} (
                    {user.role})
                  </option>
                )
              )}
            </select>
          </div>

          <nav className="flex gap-8 text-sm font-medium text-slate-700">
            <button
              onClick={() =>
                router.push("/")
              }
              className="hover:text-violet-600"
            >
              Home
            </button>

            {(role === "IT" ||
              role ===
                "ADMIN") && (
              <>
                <button
                  onClick={() =>
                    router.push(
                      "/dashboard"
                    )
                  }
                  className="hover:text-violet-600"
                >
                  Dashboard
                </button>

                <button
                  onClick={() =>
                    router.push(
                      "/employees"
                    )
                  }
                  className="hover:text-violet-600"
                >
                  Employees
                </button>

                <button
                  onClick={() =>
                    router.push(
                      "/upload"
                    )
                  }
                  className="hover:text-violet-600"
                >
                  Upload
                </button>

                <button
                  onClick={() =>
                    router.push(
                      "/reports"
                    )
                  }
                  className="hover:text-violet-600"
                >
                  Reports
                </button>
              </>
            )}

            {(role ===
              "DIRECTOR" ||
              role ===
                "ADMIN") && (
              <button
                onClick={() =>
                  router.push(
                    "/director"
                  )
                }
                className="hover:text-violet-600"
              >
                Director Queue
              </button>
            )}

            {(role ===
              "PARTNER" ||
              role ===
                "ADMIN") && (
              <button
                onClick={() =>
                  router.push(
                    "/partner"
                  )
                }
                className="hover:text-violet-600"
              >
                Partner Queue
              </button>
            )}

            <button
              onClick={() =>
                router.push(
                  "/history"
                )
              }
              className="hover:text-violet-600"
            >
              History
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}