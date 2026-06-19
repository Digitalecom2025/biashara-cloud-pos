import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { adminTokenFromRequest, verifySuperAdminToken } from "@/lib/super-admin-auth";
import { prisma } from "@/lib/prisma";

const packageAmounts: Record<string, number> = {
  Trial: 0,
  Lite: 700,
  Growth: 1500,
  Business: 3000,
  Premium: 5000,
  Custom: 0,
  "Custom / Enterprise": 0,
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePlan(value: string) {
  return value === "Custom / Enterprise" ? "Custom" : value;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!verifySuperAdminToken(adminTokenFromRequest(request))) {
    return NextResponse.json({ error: "Super Admin login required." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { action?: unknown; status?: unknown; packagePlan?: unknown };
  const action = text(body.action);
  const status = text(body.status);
  const packagePlan = normalizePlan(text(body.packagePlan));
  const now = new Date();

  const business = await prisma.business.findUnique({ where: { id }, select: { id: true, name: true, trialEndsAt: true } });
  if (!business) return NextResponse.json({ error: "Business not found." }, { status: 404 });

  const currentSubscription = await prisma.subscription.findFirst({ where: { businessId: id }, orderBy: { createdAt: "desc" } });
  const currentTrialEnd = currentSubscription?.trialEndsAt ?? business.trialEndsAt ?? now;

  let nextStatus = status || currentSubscription?.status || "trial";
  let nextPlan = packagePlan || currentSubscription?.packagePlan || "Trial";
  let nextTrialEnd: Date | null = currentTrialEnd;
  let nextRenewal = currentSubscription?.renewalDate ?? currentTrialEnd;

  if (action === "mark_active") nextStatus = "active";
  if (action === "mark_suspended") nextStatus = "suspended";
  if (action === "mark_expired") nextStatus = "expired";
  if (action === "extend_7") {
    nextStatus = "trial";
    nextTrialEnd = new Date(currentTrialEnd.getTime() + 7 * 24 * 60 * 60 * 1000);
    nextRenewal = nextTrialEnd;
  }
  if (action === "extend_14") {
    nextStatus = "trial";
    nextTrialEnd = new Date(currentTrialEnd.getTime() + 14 * 24 * 60 * 60 * 1000);
    nextRenewal = nextTrialEnd;
  }
  if (action === "change_package" && packagePlan) nextPlan = packagePlan;

  const amount = packageAmounts[nextPlan] ?? 0;

  await prisma.$transaction(async (tx) => {
    if (currentSubscription) {
      await tx.subscription.update({
        where: { id: currentSubscription.id },
        data: {
          packagePlan: nextPlan,
          status: nextStatus,
          renewalDate: nextRenewal,
          trialEndsAt: nextTrialEnd,
          amount,
        },
      });
    } else {
      await tx.subscription.create({
        data: {
          businessId: id,
          packagePlan: nextPlan,
          status: nextStatus,
          startDate: now,
          renewalDate: nextRenewal,
          trialEndsAt: nextTrialEnd,
          amount,
        },
      });
    }

    await tx.business.update({
      where: { id },
      data: {
        packagePlan: nextPlan,
        selectedPlan: nextPlan,
        status: nextStatus,
        trialEndsAt: nextTrialEnd,
        updatedAt: now,
      },
    });

    await tx.auditLog.create({
      data: {
        id: `audit_admin_${randomUUID()}`,
        businessId: id,
        action: "Super Admin subscription update",
        entity: "Subscription",
        entityId: currentSubscription?.id ?? id,
        details: `Action: ${action || "manual_update"}, status: ${nextStatus}, package: ${nextPlan}.`,
      },
    });
  });

  return NextResponse.json({
    success: true,
    business: {
      id,
      status: nextStatus,
      packagePlan: nextPlan,
      trialEndsAt: nextTrialEnd?.toISOString() ?? null,
    },
    message: "Subscription updated.",
  });
}
