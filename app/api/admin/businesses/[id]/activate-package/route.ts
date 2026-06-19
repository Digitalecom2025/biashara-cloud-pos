import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { normalizePackagePlan, packageAmounts } from "@/lib/admin-data";
import { adminTokenFromRequest, verifySuperAdminToken } from "@/lib/super-admin-auth";
import { prisma } from "@/lib/prisma";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!verifySuperAdminToken(adminTokenFromRequest(request))) {
    return NextResponse.json({ error: "Super Admin login required." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { packagePlan?: unknown };
  const packagePlan = normalizePackagePlan(text(body.packagePlan) || "Lite");
  if (!Object.hasOwn(packageAmounts, packagePlan)) {
    return NextResponse.json({ error: "Unsupported package plan." }, { status: 400 });
  }

  const business = await prisma.business.findUnique({
    where: { id },
    include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!business) return NextResponse.json({ error: "Business not found." }, { status: 404 });

  const now = new Date();
  const renewalDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const amount = packageAmounts[packagePlan] ?? 0;
  const subscription = business.subscriptions[0];

  await prisma.$transaction(async (tx) => {
    await tx.business.update({
      where: { id },
      data: {
        status: "active",
        approvalStatus: business.approvalStatus === "pending_approval" ? "approved" : business.approvalStatus,
        onboardingStatus: "active_paid",
        subscriptionStartedAt: business.subscriptionStartedAt ?? now,
        subscriptionEndsAt: renewalDate,
        subscriptionStatus: "active",
        packagePlan,
        selectedPlan: packagePlan,
      },
    });

    if (subscription) {
      await tx.subscription.update({
        where: { id: subscription.id },
        data: { status: "active", packagePlan, startDate: subscription.startDate ?? now, renewalDate, amount },
      });
    } else {
      await tx.subscription.create({
        data: { businessId: id, status: "active", packagePlan, startDate: now, renewalDate, amount },
      });
    }

    await tx.user.updateMany({
      where: { businessId: id, status: { in: ["pending_approval", "suspended"] } },
      data: { status: "active", approvedAt: now },
    });

    await tx.auditLog.create({
      data: {
        id: `audit_activate_${randomUUID()}`,
        businessId: id,
        action: "Package activated by Super Admin",
        entity: "Subscription",
        entityId: subscription?.id ?? id,
        details: `${packagePlan} package activated until ${renewalDate.toISOString()}. Amount: ${amount}.`,
      },
    });
  });

  return NextResponse.json({
    success: true,
    message: `${packagePlan} package activated.`,
    business: { id, packagePlan, subscriptionStatus: "active", renewalDate: renewalDate.toISOString(), amount },
  });
}
