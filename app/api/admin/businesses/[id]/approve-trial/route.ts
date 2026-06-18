import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { adminTokenFromRequest, verifySuperAdminToken } from "@/lib/super-admin-auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!verifySuperAdminToken(adminTokenFromRequest(request))) {
    return NextResponse.json({ error: "Super Admin login required." }, { status: 401 });
  }

  const { id } = await context.params;
  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const business = await prisma.business.findUnique({
    where: { id },
    include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!business) return NextResponse.json({ error: "Business not found." }, { status: 404 });

  const packagePlan = business.selectedPlan || business.packagePlan || "Trial";
  const subscription = business.subscriptions[0];

  await prisma.$transaction(async (tx) => {
    await tx.business.update({
      where: { id },
      data: {
        status: "active",
        approvalStatus: "approved",
        approvedAt: now,
        approvedBy: "Super Admin",
        onboardingStatus: "trial_active",
        trialStartedAt: now,
        trialEndsAt,
        subscriptionStartedAt: now,
        subscriptionEndsAt: trialEndsAt,
        subscriptionStatus: "trial",
        packagePlan,
        selectedPlan: packagePlan,
      },
    });

    if (subscription) {
      await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "trial",
          packagePlan,
          startDate: now,
          trialEndsAt,
          renewalDate: trialEndsAt,
          amount: 0,
        },
      });
    } else {
      await tx.subscription.create({
        data: {
          businessId: id,
          packagePlan,
          status: "trial",
          startDate: now,
          trialEndsAt,
          renewalDate: trialEndsAt,
          amount: 0,
        },
      });
    }

    await tx.user.updateMany({
      where: { businessId: id, role: { in: ["OWNER", "ADMIN", "Business Owner"] } },
      data: { status: "active", approvedAt: now },
    });

    await tx.demoRequest.updateMany({
      where: { businessName: business.name },
      data: { status: "trial_approved" },
    });

    await tx.auditLog.create({
      data: {
        id: `audit_approve_${randomUUID()}`,
        businessId: id,
        action: "Trial approved by Super Admin",
        entity: "Business",
        entityId: id,
        details: `14-day trial approved. Package: ${packagePlan}. Trial ends ${trialEndsAt.toISOString()}.`,
      },
    });
  });

  return NextResponse.json({
    data: { businessId: id, status: "active", subscriptionStatus: "trial", trialEndsAt: trialEndsAt.toISOString() },
    message: "Trial approved. The user can now login and use Biashara POS for 14 days.",
  });
}
