import { packagePlans, planByName } from "@/lib/subscription-plans";

export type SubscriptionInput = {
  packagePlan?: unknown;
  renewalDate?: unknown;
  amount?: unknown;
};

type SubscriptionValidationResult =
  | { errors: string[]; data?: never }
  | {
      errors?: never;
      data: {
        packagePlan: string;
        amount: number;
        renewalDate: Date;
      };
    };

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return Number.NaN;
}

export function subscriptionData(input: SubscriptionInput): SubscriptionValidationResult {
  const packagePlan = text(input.packagePlan);
  const plan = planByName(packagePlan);
  const amount = Number.isFinite(numberValue(input.amount)) ? numberValue(input.amount) : plan.price ?? 0;
  const renewalDate = text(input.renewalDate) ? new Date(text(input.renewalDate)) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const errors: string[] = [];

  if (!packagePlan || !packagePlans.some((item) => item.name === packagePlan)) errors.push("Package plan is required.");
  if (!Number.isFinite(amount) || amount < 0) errors.push("Amount must be 0 or greater.");
  if (Number.isNaN(renewalDate.getTime())) errors.push("Renewal date must be valid.");

  if (errors.length > 0) return { errors };
  return { data: { packagePlan, amount, renewalDate } };
}
