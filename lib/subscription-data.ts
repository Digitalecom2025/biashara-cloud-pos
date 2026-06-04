import { subscriptionPayments } from "@/lib/growth-mock-data";
import { getDemoBusinessId } from "@/lib/db-data";
import { prisma } from "@/lib/prisma";
import { packagePlans, planByName, type PlanConfig, type PlanName } from "@/lib/subscription-plans";

export type UsageData = {
  label: string;
  used: number;
  limit: string;
  percent: number;
};

export type CurrentSubscriptionData = {
  id: string | null;
  businessName: string;
  packagePlan: PlanName;
  status: string;
  startDate: string;
  renewalDate: string;
  amount: number;
  daysRemaining: number;
  plan: PlanConfig;
  usage: UsageData[];
  paymentHistory: typeof subscriptionPayments;
};

export { packagePlans, planByName };

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(value);
}

function daysRemaining(renewalDate: Date) {
  const today = new Date();
  const day = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((renewalDate.getTime() - today.getTime()) / day));
}

function percent(used: number, limit: number | null) {
  if (!limit) return 35;
  return Math.min(100, Math.round((used / limit) * 100));
}

export async function getSubscriptionUsage() {
  const businessId = await getDemoBusinessId();
  if (!businessId) return { users: 0, branches: 0, products: 0, reports: 0 };
  const [users, branches, products] = await Promise.all([
    prisma.user.count({ where: { businessId, status: { notIn: ["inactive", "Inactive"] } } }),
    prisma.branch.count({ where: { businessId, status: { notIn: ["inactive", "Inactive"] } } }),
    prisma.product.count({ where: { businessId, status: { notIn: ["inactive", "Inactive"] } } }),
  ]);
  return { users, branches, products, reports: 48 };
}

export async function getCurrentSubscription(): Promise<CurrentSubscriptionData> {
  const businessId = await getDemoBusinessId();
  if (!businessId) throw new Error("Demo business has not been seeded.");
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { subscriptions: { orderBy: { renewalDate: "desc" }, take: 1 } },
  });
  if (!business) throw new Error("Demo business not found.");

  const existing = business.subscriptions[0];
  const plan = planByName(existing?.packagePlan ?? business.packagePlan);
  const usageCounts = await getSubscriptionUsage();
  const startDate = existing?.startDate ?? business.createdAt;
  const renewalDate = existing?.renewalDate ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return {
    id: existing?.id ?? null,
    businessName: business.name,
    packagePlan: plan.name,
    status: existing?.status ?? business.status,
    startDate: formatDate(startDate),
    renewalDate: formatDate(renewalDate),
    amount: Number(existing?.amount ?? plan.price ?? 0),
    daysRemaining: daysRemaining(renewalDate),
    plan,
    usage: [
      { label: "Users", used: usageCounts.users, limit: plan.userLimit ? String(plan.userLimit) : "Custom", percent: percent(usageCounts.users, plan.userLimit) },
      { label: "Branches", used: usageCounts.branches, limit: plan.branchLimit ? String(plan.branchLimit) : "Custom", percent: percent(usageCounts.branches, plan.branchLimit) },
      { label: "Products", used: usageCounts.products, limit: plan.productLimit ? plan.productLimit.toLocaleString() : "Custom", percent: percent(usageCounts.products, plan.productLimit) },
      { label: "Reports", used: usageCounts.reports, limit: plan.reportLimit ? String(plan.reportLimit) : "Unlimited", percent: percent(usageCounts.reports, plan.reportLimit) },
    ],
    paymentHistory: subscriptionPayments,
  };
}
