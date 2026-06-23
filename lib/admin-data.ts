import { prisma } from "@/lib/prisma";
import { getBranchLimit, getProductLimit, getUserLimit } from "@/lib/package-access";
import { getTrialDaysRemaining, isTrialExpired } from "@/lib/trial";

export type AdminBusinessRow = {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  businessType: string;
  packageSelected: string;
  trialPackage: string;
  userLimit: string;
  branchLimit: string;
  productLimit: string;
  subscriptionStatus: string;
  approvalStatus: string;
  businessStatus: string;
  usersCount: number | null;
  message: string;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  renewalDate: string | null;
  amount: number;
  daysRemaining: number;
  createdAt: string;
};

export type AdminSummary = {
  totalBusinesses: number;
  pendingApprovals: number;
  trialBusinesses: number;
  activeTrials: number;
  activePaidAccounts: number;
  activeSubscriptions: number;
  expiredTrials: number;
  suspendedAccounts: number;
  selectedPackages: number;
  recentSignups: number;
  monthlyRecurringRevenue: number;
  enterpriseRequests: number;
};

export const packageAmounts: Record<string, number> = {
  Lite: 700,
  Growth: 1500,
  Business: 3000,
  Enterprise: 0,
  Trial: 0,
  "Not sure yet": 0,
};

export function normalizePackagePlan(plan?: string | null) {
  if (!plan) return "Trial";
  if (["Custom / Enterprise", "Custom", "Premium"].includes(plan)) return "Enterprise";
  if (plan === "Not sure yet") return "Growth";
  return plan;
}

function normalizeStatus(value?: string | null) {
  if (!value) return "pending_approval";
  if (value === "active_paid") return "active";
  return value;
}

function limitText(value: number | "Unlimited") {
  return typeof value === "number" ? value.toLocaleString() : value;
}

export async function getAdminBusinesses() {
  const businesses = await prisma.business.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
      users: { select: { id: true, status: true, role: true, name: true, email: true, phone: true } },
    },
  });

  const requests = await prisma.demoRequest.findMany({
    orderBy: { createdAt: "desc" },
    select: { businessName: true, usersCount: true, message: true, preferredPackage: true },
  });

  const rows: AdminBusinessRow[] = businesses.map((business) => {
    const subscription = business.subscriptions[0];
    const request = requests.find((item) => item.businessName === business.name);
    const trialEndsAt = subscription?.trialEndsAt ?? business.trialEndsAt;
    const daysRemaining = getTrialDaysRemaining(trialEndsAt);
    const expiredTrial = subscription?.status === "trial" && isTrialExpired(trialEndsAt);
    const packageSelected = normalizePackagePlan(business.selectedPlan ?? subscription?.packagePlan ?? request?.preferredPackage ?? business.packagePlan);
    const trialPackage = normalizePackagePlan(business.trialPackage ?? subscription?.trialPackage ?? packageSelected);
    const hasPendingApproval =
      business.status === "pending_approval" ||
      business.approvalStatus === "pending_approval" ||
      business.onboardingStatus === "pending_approval" ||
      business.subscriptionStatus === "pending_approval" ||
      subscription?.status === "pending_approval" ||
      business.users.some((user) => user.status === "pending_approval" || user.status === "pending" || user.status === "new");
    const subscriptionStatus = hasPendingApproval
      ? "pending_approval"
      : expiredTrial
      ? "expired"
      : normalizeStatus(subscription?.status ?? business.subscriptionStatus ?? business.status);
    const approvalStatus = hasPendingApproval ? "pending_approval" : business.approvalStatus;
    const amount = Number(subscription?.amount ?? packageAmounts[packageSelected] ?? 0);
    const owner = business.users.find((user) => ["OWNER", "ADMIN", "Business Owner"].includes(user.role)) ?? business.users[0];

    return {
      id: business.id,
      name: business.name,
      contactPerson: business.contactPerson ?? owner?.name ?? "Not set",
      phone: business.phone || owner?.phone || "",
      email: business.email || owner?.email || "",
      businessType: business.industryMode,
      packageSelected,
      trialPackage,
      userLimit: limitText(getUserLimit(packageSelected)),
      branchLimit: limitText(getBranchLimit(packageSelected)),
      productLimit: limitText(getProductLimit(packageSelected)),
      subscriptionStatus,
      approvalStatus,
      businessStatus: business.status,
      usersCount: request?.usersCount ?? business.users.length,
      message: request?.message ?? "",
      trialStartedAt: hasPendingApproval ? null : business.trialStartedAt?.toISOString() ?? subscription?.startDate?.toISOString() ?? null,
      trialEndsAt: trialEndsAt?.toISOString() ?? null,
      renewalDate: subscription?.renewalDate?.toISOString() ?? business.subscriptionEndsAt?.toISOString() ?? null,
      amount,
      daysRemaining,
      createdAt: business.createdAt.toISOString(),
    };
  });

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const summary: AdminSummary = {
    totalBusinesses: rows.length,
    pendingApprovals: rows.filter((row) => row.subscriptionStatus === "pending_approval" || row.approvalStatus === "pending_approval" || row.businessStatus === "pending_approval").length,
    trialBusinesses: rows.filter((row) => row.subscriptionStatus === "trial").length,
    activeTrials: rows.filter((row) => row.subscriptionStatus === "trial").length,
    activePaidAccounts: rows.filter((row) => row.subscriptionStatus === "active").length,
    activeSubscriptions: rows.filter((row) => row.subscriptionStatus === "active").length,
    expiredTrials: rows.filter((row) => row.subscriptionStatus === "expired").length,
    suspendedAccounts: rows.filter((row) => row.subscriptionStatus === "suspended").length,
    selectedPackages: rows.filter((row) => row.packageSelected && row.packageSelected !== "Trial" && row.packageSelected !== "Not sure yet").length,
    recentSignups: rows.filter((row) => new Date(row.createdAt).getTime() >= sevenDaysAgo).length,
    enterpriseRequests: rows.filter((row) => row.packageSelected === "Enterprise").length,
    monthlyRecurringRevenue: rows
      .filter((row) => row.subscriptionStatus === "active")
      .reduce((total, row) => total + (row.amount || packageAmounts[row.packageSelected] || 0), 0),
  };

  return { summary, rows };
}
