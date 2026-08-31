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
    session?.user?.name ||
    "User";

  const isPortalHome =
    pathname === "/" ||
    pathname === "/home";

  const isLicenseModule =
    pathname.startsWith(
      "/licenses"
    );

  const isOnboardingModule =
    pathname.startsWith(
      "/onboarding"
    );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            IT Service Portal
          </h1>
        </div>

        <div className="flex items-center gap-8">
          <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-right">
            <div className="text-sm font-medium text-white">
              {name}
            </div>

            <div className="text-xs uppercase tracking-wide text-violet-400">
              {role}
            </div>
          </div>

          <nav className="flex items-center gap-6 text-sm font-medium text-slate-300">
            <button
              onClick={() =>
                router.push("/home")
              }
              className="transition hover:text-white"
            >
              Home
            </button>

            {isOnboardingModule && (
              <>
                <button
                  onClick={() =>
                    router.push(
                      "/onboarding"
                    )
                  }
                  className="transition hover:text-white"
                >
                  Onboarding
                </button>

                <button
                  onClick={() =>
                    router.push(
                      "/onboarding/history"
                    )
                  }
                  className="transition hover:text-white"
                >
                  History
                </button>
              </>
            )}

            {!isPortalHome &&
              isLicenseModule && (
                <>
                  <button
                    onClick={() =>
                      router.push(
                        "/licenses"
                      )
                    }
                    className="transition hover:text-white"
                  >
                    License Dashboard
                  </button>

                  {(role ===
                    "IT" ||
                    role ===
                      "ADMIN") && (
                    <>
                      <button
                        onClick={() =>
                          router.push(
                            "/licenses/add"
                          )
                        }
                        className="transition hover:text-white"
                      >
                        Add License
                      </button>

                      <button
                        onClick={() =>
                          router.push(
                            "/licenses/upload"
                          )
                        }
                        className="transition hover:text-white"
                      >
                        Import Licenses
                      </button>
                    </>
                  )}

                  <button
                    onClick={() =>
                      router.push(
                        "/licenses/expiring"
                      )
                    }
                    className="transition hover:text-white"
                  >
                    Expiring Licenses
                  </button>
                </>
              )}

            {!isPortalHome &&
              !isLicenseModule &&
              !isOnboardingModule && (
                <>
                  {(role ===
                    "IT" ||
                    role ===
                      "ADMIN") && (
                    <>
                      <button
                        onClick={() =>
                          router.push(
                            "/dashboard"
                          )
                        }
                        className="transition hover:text-white"
                      >
                        Dashboard
                      </button>

                      <button
                        onClick={() =>
                          router.push(
                            "/employees"
                          )
                        }
                        className="transition hover:text-white"
                      >
                        Employees
                      </button>

                      <button
                        onClick={() =>
                          router.push(
                            "/upload"
                          )
                        }
                        className="transition hover:text-white"
                      >
                        Upload
                      </button>

                      <button
                        onClick={() =>
                          router.push(
                            "/reports"
                          )
                        }
                        className="transition hover:text-white"
                      >
                        Reports
                      </button>
                    </>
                  )}

                  {(role ===
                    "GURU" ||
                    role ===
                      "ADMIN") && (
                    <>
                      <button
                        onClick={() =>
                          router.push(
                            "/employees"
                          )
                        }
                        className="transition hover:text-white"
                      >
                        Employees
                      </button>

                      <button
                        onClick={() =>
                          router.push(
                            "/director"
                          )
                        }
                        className="transition hover:text-white"
                      >
                        Guru Queue
                      </button>

                      <button
                        onClick={() =>
                          router.push(
                            "/reports"
                          )
                        }
                        className="transition hover:text-white"
                      >
                        Reports
                      </button>
                    </>
                  )}

                  {(role ===
                    "DIRECTOR" ||
                    role ===
                      "PARTNER" ||
                    role ===
                      "ADMIN") && (
                    <button
                      onClick={() =>
                        router.push(
                          "/partner"
                        )
                      }
                      className="transition hover:text-white"
                    >
                      Review Queue
                    </button>
                  )}

                  <button
                    onClick={() =>
                      router.push(
                        "/history"
                      )
                    }
                    className="transition hover:text-white"
                  >
                    History
                  </button>
                </>
              )}

            <button
              onClick={() =>
                signOut({
                  callbackUrl:
                    "/login",
                })
              }
              className="rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}