import { NextResponse } from "next/server";
import { getDemoBusinessId } from "@/lib/db-data";
import { getCurrentSubscription, planByName } from "@/lib/subscription-data";
import { subscriptionData, type SubscriptionInput } from "@/lib/subscription-validation";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    return NextResponse.json({ data: await getCurrentSubscription() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Subscription could not be loaded." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const body = (await request.json()) as SubscriptionInput;
  const parsed = subscriptionData(body);
  if (parsed.errors) return NextResponse.json({ error: parsed.errors.join(" ") }, { status: 400 });

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.subscription.findFirst({ where: { businessId }, orderBy: { renewalDate: "desc" } });
      const currentStatus = !existing || existing.status === "trial" ? "trial" : "active";
      if (existing) {
        await tx.subscription.update({
          where: { id: existing.id },
          data: {
            packagePlan: parsed.data.packagePlan,
            trialPackage: currentStatus === "trial" ? parsed.data.packagePlan : existing.trialPackage,
            amount: parsed.data.amount,
            renewalDate: parsed.data.renewalDate,
            status: currentStatus,
          },
        });
      } else {
        await tx.subscription.create({
          data: {
            businessId,
            packagePlan: parsed.data.packagePlan,
            trialPackage: parsed.data.packagePlan,
            amount: parsed.data.amount,
            renewalDate: parsed.data.renewalDate,
            startDate: new Date(),
            status: "trial",
          },
        });
      }

      await tx.business.update({
        where: { id: businessId },
        data: { packagePlan: parsed.data.packagePlan, trialPackage: parsed.data.packagePlan, status: "active", subscriptionStatus: currentStatus },
      });

      await tx.auditLog.create({
        data: {
          businessId,
          action: "Subscription package changed",
          entity: "Subscription",
          details: `Changed to ${parsed.data.packagePlan} at ${parsed.data.amount}`,
        },
      });
    });

    return NextResponse.json({ data: await getCurrentSubscription(), message: `Package changed to ${planByName(parsed.data.packagePlan).name}.` });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Subscription could not be updated." }, { status: 400 });
  }
}
