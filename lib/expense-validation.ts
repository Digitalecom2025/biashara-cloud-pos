export type ExpenseInput = {
  category?: unknown;
  description?: unknown;
  amount?: unknown;
  paymentMethod?: unknown;
  branchId?: unknown;
  recordedBy?: unknown;
  date?: unknown;
  status?: unknown;
};

type ExpenseValidationResult =
  | { errors: string[]; data?: never }
  | {
      errors?: never;
      data: {
        category: string;
        description: string;
        amount: number;
        paymentMethod: string;
        branchId: string | null;
        recordedBy: string;
        date: Date;
        status: string;
      };
    };

const categories = new Set([
  "Stock Purchase",
  "Rent",
  "Staff Wages",
  "Transport",
  "Packaging",
  "Electricity",
  "Marketing",
  "Repairs",
  "Other",
]);

const paymentMethods = new Set(["Cash", "M-Pesa", "Bank", "Card"]);
const statuses = new Set(["Approved", "Pending", "Rejected", "Cancelled"]);

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: unknown) {
  const clean = text(value);
  return clean ? clean : null;
}

function numberValue(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return Number.NaN;
}

function dateValue(value: unknown) {
  const raw = text(value);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function expenseData(input: ExpenseInput): ExpenseValidationResult {
  const category = text(input.category);
  const description = text(input.description);
  const amount = numberValue(input.amount);
  const paymentMethod = text(input.paymentMethod);
  const date = dateValue(input.date);
  const status = statuses.has(text(input.status)) ? text(input.status) : "Approved";
  const errors: string[] = [];

  if (!category || !categories.has(category)) errors.push("Expense category is required.");
  if (!description) errors.push("Description is required.");
  if (!Number.isFinite(amount) || amount <= 0) errors.push("Amount must be greater than 0.");
  if (!paymentMethods.has(paymentMethod)) errors.push("Payment method is required.");
  if (!date) errors.push("Date is required.");

  if (errors.length > 0) return { errors };

  return {
    data: {
      category,
      description,
      amount,
      paymentMethod,
      branchId: optionalText(input.branchId),
      recordedBy: text(input.recordedBy) || "System",
      date: date ?? new Date(),
      status,
    },
  };
}
