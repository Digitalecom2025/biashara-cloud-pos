import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { adminTokenFromRequest, verifySuperAdminToken } from "@/lib/super-admin-auth";
import { prisma } from "@/lib/prisma";

function numberValue(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!verifySuperAdminToken(adminTokenFromRequest(request))) {
    return NextResponse.json({ error: "Super Admin login required." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { days?: unknown };
  const days = numberValue(body.days, 7);
  if (![7, 14].includes(days)) {
    return NextResponse.json({ error: "Trial extension must be 7 or 14 days." }, { status: 400 });
  }

  const business = await prisma.business.findUnique({
    where: { id },
    include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!business) return NextResponse.json({ error: "Business not found." }, { status: 404 });

  const now = new Date();
  const subscription = business.subscriptions[0];
  const baseDate = subscription?.trialEndsAt ?? business.trialEndsAt ?? now;
  const trialEndsAt = new Date(Math.max(baseDate.getTime(), now.getTime()) + days * 24 * 60 * 60 * 1000);
  const packagePlan = business.selectedPlan || subscription?.packagePlan || business.packagePlan || "Trial";

  await prisma.$transaction(async (tx) => {
    await tx.business.update({
      where: { id },
      data: {
        status: "active",
        approvalStatus: business.approvalStatus === "pending_approval" ? "approved" : business.approvalStatus,
        onboardingStatus: "trial_active",
        trialStartedAt: business.trialStartedAt ?? now,
        trialEndsAt,
        subscriptionStartedAt: business.subscriptionStartedAt ?? now,
        subscriptionEndsAt: trialEndsAt,
        subscriptionStatus: "trial",
        packagePlan,
        selectedPlan: packagePlan,
        trialPackage: packagePlan,
      },
    });

    if (subscription) {
      await tx.subscription.update({
        where: { id: subscription.id },
        data: { status: "trial", packagePlan, trialPackage: packagePlan, trialEndsAt, renewalDate: trialEndsAt, amount: 0 },
      });
    } else {
      await tx.subscription.create({
        data: { businessId: id, status: "trial", packagePlan, trialPackage: packagePlan, startDate: now, trialEndsAt, renewalDate: trialEndsAt, amount: 0 },
      });
    }

    await tx.auditLog.create({
      data: {
        id: `audit_extend_${randomUUID()}`,
        businessId: id,
        action: `Trial extended by ${days} days`,
        entity: "Business",
        entityId: id,
        details: `Super Admin extended trial to ${trialEndsAt.toISOString()}.`,
      },
    });
  });

  return NextResponse.json({
    success: true,
    message: `Trial extended by ${days} days.`,
    business: { id, trialEndsAt: trialEndsAt.toISOString(), subscriptionStatus: "trial" },
  });
}
