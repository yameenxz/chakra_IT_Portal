import { withAuth } from "next-auth/middleware";

/**
 * Next.js 16 renamed the `middleware` file convention to `proxy`.
 * Delete src/middleware.ts when adding this file — do not keep both.
 *
 * Deny by default: every path requires a session except the explicit
 * exclusions below. The previous allow-list matcher left /admin, /licenses,
 * /approvals, /change-laptop, /onboarding and /offboarding-tracking fully
 * public, and matched only exact paths (so /offboarding/123 fell through).
 *
 * This is a second line of defence only. It proves a user is signed in; it
 * says nothing about their role. Every API route handler must still gate
 * itself with requireRole() from src/lib/auth-guard.ts.
 */

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    /*
     * Everything except:
     *   login            — the sign-in page itself
     *   api/auth         — NextAuth's own endpoints (callback, csrf, session)
     *   _next/static     — build output
     *   _next/image      — image optimiser
     *   favicon.ico      — browser chrome
     *
     * Note there is deliberately no exclusion for signup, forgot-password or
     * reset-password: those routes are removed under Entra SSO.
     */
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
