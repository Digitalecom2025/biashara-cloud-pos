import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type TrialSignupInput = {
  fullName?: unknown;
  businessName?: unknown;
  phone?: unknown;
  email?: unknown;
  businessType?: unknown;
  usersCount?: unknown;
  preferredPackage?: unknown;
  message?: unknown;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function slugify(value: string) {
  const base = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  return `${base || "trial-business"}-${Date.now().toString().slice(-6)}`;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as TrialSignupInput;
  const fullName = text(body.fullName);
  const businessName = text(body.businessName);
  const phone = text(body.phone);
  const email = text(body.email);
  const businessType = text(body.businessType);
  const preferredPackage = text(body.preferredPackage) || "Not sure yet";
  const message = text(body.message);
  const usersCountText = text(body.usersCount);
  const usersCount = usersCountText ? Number(usersCountText) : null;
  const errors: string[] = [];

  if (!fullName) errors.push("Full name is required.");
  if (!businessName) errors.push("Business name is required.");
  if (!phone) errors.push("Phone number is required.");
  if (!businessType) errors.push("Business type is required.");
  if (email && !validEmail(email)) errors.push("Enter a valid email address.");
  if (usersCountText && (!Number.isFinite(usersCount) || Number(usersCount) < 0)) errors.push("Number of users/cashiers must be 0 or greater.");

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  }

  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const businessId = `biz_trial_${randomUUID()}`;
  const branchId = `branch_trial_${randomUUID()}`;
  const userId = `user_trial_${randomUUID()}`;
  const subscriptionId = `sub_trial_${randomUUID()}`;
  const requestId = `trial_req_${randomUUID()}`;
  const auditId = `audit_trial_${randomUUID()}`;
  const ownerEmail = email || `trial-${Date.now()}@leadsstacks.local`;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        INSERT INTO "Business"
          ("id", "name", "slug", "phone", "email", "location", "industryMode", "packagePlan", "status", "trialStartedAt", "trialEndsAt", "selectedPlan", "onboardingStatus", "signupSource", "contactPerson", "createdAt", "updatedAt")
        VALUES
          (${businessId}, ${businessName}, ${slugify(businessName)}, ${phone}, ${ownerEmail}, ${"Trial signup"}, ${businessType}, ${"Trial"}, ${"trial"}, ${now}, ${trialEndsAt}, ${preferredPackage}, ${"trial_created"}, ${"public_signup"}, ${fullName}, ${now}, ${now})
      `;

      await tx.$executeRaw`
        INSERT INTO "Branch"
          ("id", "businessId", "name", "location", "phone", "managerName", "status", "createdAt", "updatedAt")
        VALUES
          (${branchId}, ${businessId}, ${"Main Branch"}, ${"Trial location"}, ${phone}, ${fullName}, ${"Active"}, ${now}, ${now})
      `;

      await tx.$executeRaw`
        INSERT INTO "User"
          ("id", "businessId", "branchId", "name", "email", "phone", "role", "status", "lastLoginAt", "createdAt", "updatedAt")
        VALUES
          (${userId}, ${businessId}, ${branchId}, ${fullName}, ${ownerEmail}, ${phone}, ${"Business Owner"}, ${"Active"}, ${null}, ${now}, ${now})
      `;

      await tx.$executeRaw`
        INSERT INTO "Subscription"
          ("id", "businessId", "packagePlan", "status", "startDate", "renewalDate", "trialEndsAt", "amount", "createdAt", "updatedAt")
        VALUES
          (${subscriptionId}, ${businessId}, ${"Trial"}, ${"trial"}, ${now}, ${trialEndsAt}, ${trialEndsAt}, ${0}, ${now}, ${now})
      `;

      await tx.$executeRaw`
        INSERT INTO "Setting"
          ("id", "businessId", "key", "value", "createdAt", "updatedAt")
        VALUES
          (${`setting_currency_${randomUUID()}`}, ${businessId}, ${"defaultCurrency"}, ${"KES"}, ${now}, ${now}),
          (${`setting_receipt_${randomUUID()}`}, ${businessId}, ${"receiptFooterNote"}, ${"Thank you for shopping with us."}, ${now}, ${now}),
          (${`setting_industry_${randomUUID()}`}, ${businessId}, ${"industryMode"}, ${businessType}, ${now}, ${now})
      `;

      await tx.$executeRaw`
        INSERT INTO "AuditLog"
          ("id", "businessId", "userId", "action", "entity", "entityId", "details", "createdAt")
        VALUES
          (${auditId}, ${businessId}, ${userId}, ${"Trial account created"}, ${"Business"}, ${businessId}, ${`Trial signup for ${businessName} by ${fullName}. Preferred package: ${preferredPackage}.`}, ${now})
      `;

      await tx.$executeRaw`
        INSERT INTO "DemoRequest"
          ("id", "fullName", "businessName", "phone", "email", "businessType", "usersCount", "preferredPackage", "message", "status", "createdAt", "updatedAt")
        VALUES
          (${requestId}, ${fullName}, ${businessName}, ${phone}, ${email || null}, ${businessType}, ${usersCount}, ${preferredPackage}, ${message || null}, ${"trial_created"}, ${now}, ${now})
      `;
    });

    return NextResponse.json({
      data: {
        businessId,
        subscriptionId,
        trialEndsAt: trialEndsAt.toISOString(),
        selectedPlan: preferredPackage,
      },
      message: "Your trial account has been created. We will help you activate account access during onboarding.",
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Trial signup could not be created." }, { status: 400 });
  }
}
