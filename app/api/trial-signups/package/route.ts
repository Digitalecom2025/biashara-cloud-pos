import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const packageAmounts: Record<string, number> = {
  Lite: 700,
  Growth: 1500,
  Business: 3000,
  Enterprise: 0,
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePackage(value: string) {
  if (value === "Custom / Enterprise" || value === "Custom" || value === "Premium") return "Enterprise";
  return value;
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { businessId?: unknown; packagePlan?: unknown };
  const businessId = text(body.businessId);
  const packagePlan = normalizePackage(text(body.packagePlan));
  const validPlans = Object.keys(packageAmounts);

  if (!businessId) return NextResponse.json({ error: "Business ID is required." }, { status: 400 });
  if (!packagePlan || !validPlans.includes(packagePlan)) return NextResponse.json({ error: "Package plan is required." }, { status: 400 });

  const now = new Date();
  const amount = packageAmounts[packagePlan];
  const auditId = `audit_package_${randomUUID()}`;

  try {
    const business = await prisma.business.findUnique({ where: { id: businessId }, select: { id: true, name: true } });
    if (!business) return NextResponse.json({ error: "Trial business was not found." }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.findFirst({ where: { businessId }, orderBy: { createdAt: "desc" }, select: { id: true } });

      if (subscription) {
        await tx.subscription.update({
          where: { id: subscription.id },
          data: { packagePlan, trialPackage: packagePlan, status: "trial", amount, updatedAt: now },
        });
      } else {
        await tx.subscription.create({
          data: { id: `sub_${randomUUID()}`, businessId, packagePlan, trialPackage: packagePlan, status: "trial", startDate: now, amount },
        });
      }

      await tx.business.update({
        where: { id: businessId },
        data: { packagePlan, selectedPlan: packagePlan, trialPackage: packagePlan, status: "active", onboardingStatus: "trial_active", subscriptionStatus: "trial", updatedAt: now },
      });

      await tx.$executeRaw`
        INSERT INTO "AuditLog"
          ("id", "businessId", "userId", "action", "entity", "entityId", "details", "createdAt")
        VALUES
          (${auditId}, ${businessId}, ${null}, ${"Trial package changed"}, ${"Subscription"}, ${businessId}, ${`Trial package changed to: ${packagePlan}. Trial dates were not reset.`}, ${now})
      `;
    });

    return NextResponse.json({
      data: {
        businessId,
        packagePlan,
        status: "trial",
        amount,
      },
      message: packagePlan === "Enterprise" ? "Enterprise interest saved. Our team will contact you for setup." : "Trial package updated. Your trial date has not been reset.",
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Package could not be selected." }, { status: 400 });
  }
}
