import { prisma } from "@/lib/prisma";
import { getTrialDaysRemaining, isTrialExpired } from "@/lib/trial";

export type AdminBusinessRow = {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  businessType: string;
  packageSelected: string;
  subscriptionStatus: string;
  approvalStatus: string;
  usersCount: number | null;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
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
};

export async function getAdminBusinesses() {
  const businesses = await prisma.business.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
      users: { select: { id: true } },
    },
  });

  const requests = await prisma.demoRequest.findMany({
    orderBy: { createdAt: "desc" },
    select: { businessName: true, usersCount: true },
  });

  const rows: AdminBusinessRow[] = businesses.map((business) => {
    const subscription = business.subscriptions[0];
    const trialEndsAt = subscription?.trialEndsAt ?? business.trialEndsAt;
    const daysRemaining = getTrialDaysRemaining(trialEndsAt);
    const expiredTrial = subscription?.status === "trial" && isTrialExpired(trialEndsAt);

    return {
      id: business.id,
      name: business.name,
      contactPerson: business.contactPerson ?? "Not set",
      phone: business.phone,
      email: business.email,
      businessType: business.industryMode,
      packageSelected: business.selectedPlan ?? subscription?.packagePlan ?? business.packagePlan,
      subscriptionStatus: expiredTrial ? "expired" : subscription?.status ?? business.status,
      approvalStatus: business.approvalStatus,
      usersCount: requests.find((request) => request.businessName === business.name)?.usersCount ?? business.users.length,
      trialStartedAt: business.trialStartedAt?.toISOString() ?? subscription?.startDate?.toISOString() ?? null,
      trialEndsAt: trialEndsAt?.toISOString() ?? null,
      daysRemaining,
      createdAt: business.createdAt.toISOString(),
    };
  });

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const summary: AdminSummary = {
    totalBusinesses: rows.length,
    pendingApprovals: rows.filter((row) => row.subscriptionStatus === "pending_approval" || row.approvalStatus === "pending_approval").length,
    trialBusinesses: rows.filter((row) => row.subscriptionStatus === "trial").length,
    activeTrials: rows.filter((row) => row.subscriptionStatus === "trial").length,
    activePaidAccounts: rows.filter((row) => row.subscriptionStatus === "active").length,
    activeSubscriptions: rows.filter((row) => row.subscriptionStatus === "active").length,
    expiredTrials: rows.filter((row) => row.subscriptionStatus === "expired").length,
    suspendedAccounts: rows.filter((row) => row.subscriptionStatus === "suspended").length,
    selectedPackages: rows.filter((row) => row.packageSelected && row.packageSelected !== "Trial" && row.packageSelected !== "Not sure yet").length,
    recentSignups: rows.filter((row) => new Date(row.createdAt).getTime() >= sevenDaysAgo).length,
  };

  return { summary, rows };
}
