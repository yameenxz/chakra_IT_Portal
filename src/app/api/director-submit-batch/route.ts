import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";

export async function POST() {
  const guard = await requireRole("GURU", "ADMIN");
  if (!guard.ok) return guard.response;

  try {
    const pendingDirectorEmployees =
      await prisma.employee.findMany({
        where: {
          workflowStage: "PENDING_DIRECTOR",
        },
      });

    if (pendingDirectorEmployees.length === 0) {
      return NextResponse.json({
        success: false,
        error:
          "No employees pending Guru approval.",
      });
    }

    const incompleteEmployees =
      pendingDirectorEmployees.filter(
        (employee) =>
          !employee.guruCommentEmail ||
          !employee.guruCommentOneDrive
      );

    if (incompleteEmployees.length > 0) {
      return NextResponse.json({
        success: false,
        error:
          "Please complete Guru decisions for all employees before submitting the batch.",
      });
    }

    // ---------------------------------------------------------------------
    // VALIDATE EVERYTHING FIRST.
    //
    // The original checked `employee.team` and reviewer availability INSIDE
    // the mutation loop and returned early on failure. By then, earlier
    // employees in the batch had already been moved to PENDING_PARTNERS and
    // had PartnerApproval rows created. The caller saw `success: false` and a
    // message implying nothing happened, while the database held a partially
    // submitted batch — with no way to tell from the response how far it got.
    //
    // Validation now completes for the whole batch before anything is written.
    // ---------------------------------------------------------------------

    const teams = [
      ...new Set(
        pendingDirectorEmployees
          .map((employee) => employee.team)
          .filter((team): team is string => Boolean(team))
      ),
    ];

    const missingTeam = pendingDirectorEmployees.filter(
      (employee) => !employee.team
    );

    if (missingTeam.length > 0) {
      return NextResponse.json({
        success: false,
        error: `No team assigned: ${missingTeam
          .map((e) => e.name)
          .join(", ")}`,
      });
    }

    // One query for all teams instead of one per employee. The original ran
    // a findMany per employee plus a findFirst per reviewer — roughly 800
    // round trips for a 200-employee batch, which is also how a timeout
    // mid-loop became likely in the first place.
    const reviewers = await prisma.user.findMany({
      where: {
        team: { in: teams },
        isActive: true,
        role: { in: ["DIRECTOR", "PARTNER"] },
      },
      select: { email: true, role: true, team: true },
    });

    const reviewersByTeam = new Map<
      string,
      typeof reviewers
    >();

    for (const reviewer of reviewers) {
      if (!reviewer.team) continue;
      const list = reviewersByTeam.get(reviewer.team) ?? [];
      list.push(reviewer);
      reviewersByTeam.set(reviewer.team, list);
    }

    const teamsWithoutReviewers = teams.filter(
      (team) => (reviewersByTeam.get(team) ?? []).length === 0
    );

    if (teamsWithoutReviewers.length > 0) {
      return NextResponse.json({
        success: false,
        error: `No reviewers found for team(s): ${teamsWithoutReviewers.join(
          ", "
        )}`,
      });
    }

    // Existing approvals, fetched once rather than per reviewer.
    const existingApprovals =
      await prisma.partnerApproval.findMany({
        where: {
          employeeId: {
            in: pendingDirectorEmployees.map((e) => e.id),
          },
        },
        select: { employeeId: true, partnerEmail: true },
      });

    const alreadyAssigned = new Set(
      existingApprovals.map(
        (a) => `${a.employeeId}::${a.partnerEmail}`
      )
    );

    // ---------------------------------------------------------------------
    // MUTATE ATOMICALLY.
    //
    // Either the whole batch is submitted or none of it is. Without this, a
    // failure partway leaves some employees in PENDING_PARTNERS and others in
    // PENDING_DIRECTOR, which is not a state the UI represents.
    // ---------------------------------------------------------------------

    const now = new Date();

    const approvalsToCreate: Prisma.PartnerApprovalCreateManyInput[] = [];

    const auditToCreate: Prisma.AuditLogCreateManyInput[] = [];

    for (const employee of pendingDirectorEmployees) {
      const teamReviewers =
        reviewersByTeam.get(employee.team as string) ?? [];

      for (const reviewer of teamReviewers) {
        const key = `${employee.id}::${reviewer.email}`;
        if (alreadyAssigned.has(key)) continue;

        approvalsToCreate.push({
          employeeId: employee.id,
          partnerEmail: reviewer.email,
          reviewerRole: reviewer.role,
          status: "PENDING",
          assignedAt: now,
        });

        auditToCreate.push({
          employeeId: employee.id,
          action: "Assigned To Reviewer",
          details: `${employee.name} assigned to ${reviewer.email} (${reviewer.role}) (${employee.team})`,
          performedBy: guard.email,
        });
      }
    }

    await prisma.$transaction([
      prisma.employee.updateMany({
        where: {
          id: {
            in: pendingDirectorEmployees.map((e) => e.id),
          },
          // Re-assert the stage inside the transaction so a concurrent
          // submission can't advance the same employees twice.
          workflowStage: "PENDING_DIRECTOR",
        },
        data: {
          workflowStage: "PENDING_PARTNERS",
          partnerAssignedAt: now,
          partnerReminderSent: false,
        },
      }),
      prisma.partnerApproval.createMany({
        data: approvalsToCreate,
      }),
      prisma.auditLog.createMany({
        data: auditToCreate,
      }),
    ]);

    return NextResponse.json({
      success: true,
      count:
        pendingDirectorEmployees.length,
      assignments: approvalsToCreate.length,
      message:
        "Employees successfully assigned to Directors and Partners.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to submit batch",
      },
      {
        status: 500,
      }
    );
  }
}
