import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";

/**
 * Authorisation helper for API route handlers.
 *
 * This is the STAGE 2/3 version: it works against the existing `User.role`
 * column and needs no schema change.
 *
 * The per-module version (requireModule, UserModuleRole) lives in
 * patch/stage4/auth-guard.ts and requires the migration in
 * prisma/schema-additions.prisma. Do not swap it in until that migration has
 * run — every handler here imports requireRole.
 *
 * Middleware/proxy can only prove that SOMEONE is signed in. It cannot prove
 * WHICH role they hold, and it does not run for every path unless the matcher
 * is exhaustive. So every route handler that touches data gates itself.
 *
 *   export async function GET() {
 *     const guard = await requireRole("ADMIN", "IT", "GURU");
 *     if (!guard.ok) return guard.response;
 *     // guard.email and guard.role are safe to use
 *   }
 */

export type Role =
  | "EMPLOYEE"
  | "ADMIN"
  | "IT"
  | "IT_HEAD"
  | "GURU"
  | "DIRECTOR"
  | "PARTNER";

/** Every role that is not a plain employee. */
export const STAFF_ROLES: Role[] = [
  "ADMIN",
  "IT",
  "IT_HEAD",
  "GURU",
  "DIRECTOR",
  "PARTNER",
];

type SessionUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: Role;
};

type GuardOk = {
  ok: true;
  role: Role;
  email: string;
  user: SessionUser;
};

type GuardFail = {
  ok: false;
  response: NextResponse;
};

export type GuardResult = GuardOk | GuardFail;

/**
 * Require a signed-in user holding one of `allowed`.
 *
 * 401 when there is no session at all, 403 when there is a session but the
 * role is wrong. The distinction matters for debugging and for anything that
 * later reads access logs.
 */
export async function requireRole(
  ...allowed: Role[]
): Promise<GuardResult> {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;

  if (!user?.email) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Unauthenticated" },
        { status: 401 }
      ),
    };
  }

  const role = user.role;

  if (!role || (allowed.length > 0 && !allowed.includes(role))) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  return { ok: true, role, email: user.email, user };
}

/** Require any signed-in user, regardless of role. */
export async function requireAuth(): Promise<GuardResult> {
  return requireRole(
    "EMPLOYEE",
    "ADMIN",
    "IT",
    "IT_HEAD",
    "GURU",
    "DIRECTOR",
    "PARTNER"
  );
}

/** Require any staff role (i.e. not a plain EMPLOYEE). */
export async function requireStaff(): Promise<GuardResult> {
  return requireRole(...STAFF_ROLES);
}
