import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Next.js 16 renamed the `middleware` file convention to `proxy`.
 * Delete src/middleware.ts when adding this — do not keep both.
 *
 * Deny by default: every path requires a session except the exclusions in
 * `config.matcher`. The previous allow-list matcher left /admin, /licenses,
 * /approvals, /change-laptop, /onboarding and /offboarding-tracking fully
 * public, and matched only exact paths, so /offboarding/123 fell through.
 *
 * Pages redirect to /login. API routes return 401 JSON instead — a fetch
 * client follows a redirect and receives login-page HTML where it expected
 * data, which surfaces as a confusing parse error rather than "not signed in".
 *
 * This is a second line of defence only. It proves a session exists; it says
 * nothing about role. Every API route handler still gates itself with
 * requireRole() from src/lib/auth-guard.ts.
 */
export default async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (token) return NextResponse.next();

  const { pathname, search } = req.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Unauthenticated" },
      { status: 401 }
    );
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  // Send them back where they were headed once signed in.
  url.searchParams.set("callbackUrl", `${pathname}${search}`);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Everything except:
     *   login        — the sign-in page itself
     *   api/auth     — NextAuth's own endpoints (callback, csrf, session)
     *   _next/static — build output
     *   _next/image  — image optimiser
     *   favicon.ico  — browser chrome
     *
     * No exclusion for signup / forgot-password / reset-password: those
     * routes are removed under Entra SSO. Add them back only if you keep
     * credentials auth.
     */
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
