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
  const business = await prisma.business.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!business) return NextResponse.json({ error: "Business not found." }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.business.update({
      where: { id },
      data: {
        status: "suspended",
        approvalStatus: "suspended",
        onboardingStatus: "suspended",
        subscriptionStatus: "suspended",
      },
    });

    await tx.subscription.updateMany({
      where: { businessId: id },
      data: { status: "suspended" },
    });

    await tx.user.updateMany({
      where: { businessId: id },
      data: { status: "suspended" },
    });

    await tx.demoRequest.updateMany({
      where: { businessName: business.name },
      data: { status: "suspended" },
    });

    await tx.auditLog.create({
      data: {
        id: `audit_suspend_${randomUUID()}`,
        businessId: id,
        action: "Business suspended by Super Admin",
        entity: "Business",
        entityId: id,
        details: `Business suspended at ${now.toISOString()}.`,
      },
    });
  });

  return NextResponse.json({
    data: { businessId: id, status: "suspended" },
    message: "Business suspended. The user cannot access Biashara POS.",
  });
}
