export type SubscriptionAccessStatus = "active" | "trial" | "expired" | "suspended";

export function getTrialDaysRemaining(trialEndsAt?: string | Date | null) {
  if (!trialEndsAt) return 0;
  const end = typeof trialEndsAt === "string" ? new Date(trialEndsAt) : trialEndsAt;
  if (Number.isNaN(end.getTime())) return 0;
  const diff = end.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

export function isTrialExpired(trialEndsAt?: string | Date | null) {
  if (!trialEndsAt) return false;
  const end = typeof trialEndsAt === "string" ? new Date(trialEndsAt) : trialEndsAt;
  if (Number.isNaN(end.getTime())) return false;
  return Date.now() > end.getTime();
}

export function getSubscriptionAccessStatus(subscription: { status?: string | null; trialEndsAt?: string | Date | null }) {
  const status = subscription.status?.toLowerCase();
  if (status === "active") return "active" satisfies SubscriptionAccessStatus;
  if (status === "suspended") return "suspended" satisfies SubscriptionAccessStatus;
  if (status === "expired") return "expired" satisfies SubscriptionAccessStatus;
  if (status === "trial") return isTrialExpired(subscription.trialEndsAt) ? "expired" : "trial";
  return "active" satisfies SubscriptionAccessStatus;
}

export function formatTrialEndDate(value?: string | Date | null) {
  if (!value) return "Not set";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}
