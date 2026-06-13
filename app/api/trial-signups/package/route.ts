import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const packageAmounts: Record<string, number> = {
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

function normalizePackage(value: string) {
  if (value === "Custom / Enterprise") return "Custom";
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
  const renewalDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const amount = packageAmounts[packagePlan];
  const auditId = `audit_package_${randomUUID()}`;

  try {
    const business = await prisma.business.findUnique({ where: { id: businessId }, select: { id: true, name: true } });
    if (!business) return NextResponse.json({ error: "Trial business was not found." }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.findFirst({ where: { businessId }, orderBy: { createdAt: "desc" }, select: { id: true } });

      if (subscription) {
        await tx.$executeRaw`
          UPDATE "Subscription"
          SET "packagePlan" = ${packagePlan}, "status" = ${"active"}, "renewalDate" = ${renewalDate}, "amount" = ${amount}, "updatedAt" = ${now}
          WHERE "id" = ${subscription.id}
        `;
      } else {
        await tx.$executeRaw`
          INSERT INTO "Subscription"
            ("id", "businessId", "packagePlan", "status", "startDate", "renewalDate", "trialEndsAt", "amount", "createdAt", "updatedAt")
          VALUES
            (${`sub_${randomUUID()}`}, ${businessId}, ${packagePlan}, ${"active"}, ${now}, ${renewalDate}, ${null}, ${amount}, ${now}, ${now})
        `;
      }

      await tx.$executeRaw`
        UPDATE "Business"
        SET "packagePlan" = ${packagePlan}, "selectedPlan" = ${packagePlan}, "status" = ${"active"}, "onboardingStatus" = ${"package_selected"}, "updatedAt" = ${now}
        WHERE "id" = ${businessId}
      `;

      await tx.$executeRaw`
        INSERT INTO "AuditLog"
          ("id", "businessId", "userId", "action", "entity", "entityId", "details", "createdAt")
        VALUES
          (${auditId}, ${businessId}, ${null}, ${"Trial package selected"}, ${"Subscription"}, ${businessId}, ${`Package selected: ${packagePlan}. Payment confirmation will be handled manually.`}, ${now})
      `;
    });

    return NextResponse.json({
      data: {
        businessId,
        packagePlan,
        status: "active",
        amount,
        renewalDate: renewalDate.toISOString(),
      },
      message: "Package selected. Payment confirmation will be handled manually for now.",
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Package could not be selected." }, { status: 400 });
  }
}
