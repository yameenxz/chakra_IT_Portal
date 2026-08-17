"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const { data: session } = useSession();

  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password"
  ) {
    return null;
  }

  const role =
    (session?.user as {
      role?: string;
    })?.role || "";

  const name =
    session?.user?.name || "User";

  const isPortalHome =
    pathname === "/" ||
    pathname === "/home";

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

        <div className="flex items-center gap-8">
          <div className="text-right">
            <div className="text-sm text-white">
              {name}
            </div>

            <div className="text-xs text-slate-400">
              {role}
            </div>
          </div>

          <nav className="flex gap-8 text-sm font-medium text-slate-300">
            <button
              onClick={() =>
                router.push("/home")
              }
              className="transition hover:text-violet-300"
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

            <button
              onClick={() =>
                signOut({
                  callbackUrl: "/login",
                })
              }
              className="text-red-300 transition hover:text-red-200"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}