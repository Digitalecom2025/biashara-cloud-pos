import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getTrialDaysRemaining, getSubscriptionAccessStatus } from "@/lib/trial";

const rolePermissions: Record<string, string[]> = {
  "business owner": ["all"],
  owner: ["all"],
  admin: ["all"],
  cashier: ["dashboard", "sales", "customers", "sync-center", "reports"],
  "branch manager": ["dashboard", "sales", "products", "stock", "customers", "debtors", "branches", "reports", "sync-center"],
  "stock clerk": ["products", "warehouse", "stock-adjustments", "transfer", "purchases", "suppliers", "reports", "sync-center"],
  accountant: ["finance", "reports", "party-reports", "payment-types", "tax-settings", "debtors", "customers"],
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: unknown; password?: unknown };
  const email = text(body.email).toLowerCase();
  const password = text(body.password);

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      business: {
        include: {
          subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
      branch: true,
    },
  });

  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const subscription = user.business?.subscriptions[0] ?? null;
  const userStatus = user.status.toLowerCase();
  const businessStatus = user.business?.status.toLowerCase();
  const subscriptionRawStatus = subscription?.status.toLowerCase();

  if (userStatus === "pending_approval" || businessStatus === "pending_approval" || subscriptionRawStatus === "pending_approval") {
    return NextResponse.json({ error: "Your account is pending approval. We will notify you once your 14-day trial is activated." }, { status: 403 });
  }

  if (userStatus === "suspended" || businessStatus === "suspended" || subscriptionRawStatus === "suspended") {
    return NextResponse.json({ error: "Your account has been suspended. Please contact support." }, { status: 403 });
  }

  const subscriptionStatus = subscription ? getSubscriptionAccessStatus(subscription) : "active";
  const normalizedRole = user.role.toLowerCase();
  const permissions = rolePermissions[normalizedRole] ?? rolePermissions["business owner"];

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return NextResponse.json({
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        branchName: user.branch?.name ?? "Main Branch",
      },
      business: user.business
        ? {
            id: user.business.id,
            name: user.business.name,
            phone: user.business.phone,
            email: user.business.email,
            industryMode: user.business.industryMode,
            packagePlan: user.business.packagePlan,
            selectedPlan: user.business.selectedPlan,
            status: user.business.status,
          }
        : null,
      subscription: subscription
        ? {
            id: subscription.id,
            status: subscription.status,
            accessStatus: subscriptionStatus,
            packagePlan: subscription.packagePlan,
            renewalDate: subscription.renewalDate.toISOString(),
            trialEndsAt: subscription.trialEndsAt?.toISOString() ?? null,
            amount: Number(subscription.amount),
          }
        : null,
      role: user.role,
      permissions,
      trialDaysRemaining: getTrialDaysRemaining(subscription?.trialEndsAt),
    },
  });
}
