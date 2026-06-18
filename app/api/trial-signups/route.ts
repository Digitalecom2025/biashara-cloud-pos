import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

type TrialSignupInput = {
  fullName?: unknown;
  businessName?: unknown;
  phone?: unknown;
  email?: unknown;
  businessType?: unknown;
  usersCount?: unknown;
  preferredPackage?: unknown;
  password?: unknown;
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
  const password = text(body.password);
  const message = text(body.message);
  const usersCountText = text(body.usersCount);
  const usersCount = usersCountText ? Number(usersCountText) : null;
  const errors: string[] = [];

  if (!fullName) errors.push("Full name is required.");
  if (!businessName) errors.push("Business name is required.");
  if (!phone) errors.push("Phone number is required.");
  if (!email) errors.push("Email is required.");
  if (!businessType) errors.push("Business type is required.");
  if (email && !validEmail(email)) errors.push("Enter a valid email address.");
  if (!password) errors.push("Password is required.");
  if (password && password.length < 6) errors.push("Password must be at least 6 characters.");
  if (usersCountText && (!Number.isFinite(usersCount) || Number(usersCount) < 0)) errors.push("Number of users/cashiers must be 0 or greater.");

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  }

  const now = new Date();
  const businessId = `biz_trial_${randomUUID()}`;
  const branchId = `branch_trial_${randomUUID()}`;
  const userId = `user_trial_${randomUUID()}`;
  const subscriptionId = `sub_trial_${randomUUID()}`;
  const requestId = `trial_req_${randomUUID()}`;
  const auditId = `audit_trial_${randomUUID()}`;
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists. Please sign in instead." }, { status: 409 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        INSERT INTO "Business"
          ("id", "name", "slug", "phone", "email", "location", "industryMode", "packagePlan", "status", "approvalStatus", "trialStartedAt", "trialEndsAt", "subscriptionStartedAt", "subscriptionEndsAt", "subscriptionStatus", "selectedPlan", "onboardingStatus", "signupSource", "contactPerson", "createdAt", "updatedAt")
        VALUES
          (${businessId}, ${businessName}, ${slugify(businessName)}, ${phone}, ${email}, ${"Trial signup"}, ${businessType}, ${preferredPackage || "Trial"}, ${"pending_approval"}, ${"pending_approval"}, ${null}, ${null}, ${null}, ${null}, ${"pending_approval"}, ${preferredPackage}, ${"pending_approval"}, ${"website_signup"}, ${fullName}, ${now}, ${now})
      `;

      await tx.$executeRaw`
        INSERT INTO "Branch"
          ("id", "businessId", "name", "location", "phone", "managerName", "status", "createdAt", "updatedAt")
        VALUES
          (${branchId}, ${businessId}, ${"Main Branch"}, ${"Trial location"}, ${phone}, ${fullName}, ${"Active"}, ${now}, ${now})
      `;

      await tx.$executeRaw`
        INSERT INTO "User"
          ("id", "businessId", "branchId", "name", "email", "phone", "passwordHash", "role", "status", "lastLoginAt", "createdAt", "updatedAt")
        VALUES
          (${userId}, ${businessId}, ${branchId}, ${fullName}, ${email}, ${phone}, ${passwordHash}, ${"OWNER"}, ${"pending_approval"}, ${null}, ${now}, ${now})
      `;

      await tx.$executeRaw`
        INSERT INTO "Subscription"
          ("id", "businessId", "packagePlan", "status", "startDate", "renewalDate", "trialEndsAt", "amount", "createdAt", "updatedAt")
        VALUES
          (${subscriptionId}, ${businessId}, ${preferredPackage || "Trial"}, ${"pending_approval"}, ${now}, ${now}, ${null}, ${0}, ${now}, ${now})
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
          (${auditId}, ${businessId}, ${userId}, ${"Trial request submitted"}, ${"Business"}, ${businessId}, ${`Pending approval signup for ${businessName} by ${fullName}. Preferred package: ${preferredPackage}.`}, ${now})
      `;

      await tx.$executeRaw`
        INSERT INTO "DemoRequest"
          ("id", "fullName", "businessName", "phone", "email", "businessType", "usersCount", "preferredPackage", "message", "status", "createdAt", "updatedAt")
        VALUES
          (${requestId}, ${fullName}, ${businessName}, ${phone}, ${email || null}, ${businessType}, ${usersCount}, ${preferredPackage}, ${message || null}, ${"pending_approval"}, ${now}, ${now})
      `;
    });

    return NextResponse.json({
      data: {
        businessId,
        userId,
        subscriptionId,
        trialEndsAt: null,
        selectedPlan: preferredPackage,
        redirectTo: "/login",
      },
      message: "Your trial request has been received. Our team will review and approve your account before your 14-day trial starts.",
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Trial signup could not be created." }, { status: 400 });
  }
}
