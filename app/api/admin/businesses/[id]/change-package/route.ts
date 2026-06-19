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
  const packagePlan = normalizePackagePlan(text(body.packagePlan) || "Trial");
  if (!Object.hasOwn(packageAmounts, packagePlan)) {
    return NextResponse.json({ error: "Unsupported package plan." }, { status: 400 });
  }

  const business = await prisma.business.findUnique({
    where: { id },
    include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!business) return NextResponse.json({ error: "Business not found." }, { status: 404 });

  const subscription = business.subscriptions[0];
  const amount = subscription?.status === "active" ? packageAmounts[packagePlan] ?? 0 : Number(subscription?.amount ?? 0);

  await prisma.$transaction(async (tx) => {
    await tx.business.update({
      where: { id },
      data: { packagePlan, selectedPlan: packagePlan },
    });

    if (subscription) {
      await tx.subscription.update({
        where: { id: subscription.id },
        data: { packagePlan, amount },
      });
    }

    await tx.auditLog.create({
      data: {
        id: `audit_change_package_${randomUUID()}`,
        businessId: id,
        action: "Package changed by Super Admin",
        entity: "Business",
        entityId: id,
        details: `Package changed to ${packagePlan}.`,
      },
    });
  });

  return NextResponse.json({
    success: true,
    message: `Package changed to ${packagePlan}.`,
    business: { id, packagePlan, amount },
  });
}
