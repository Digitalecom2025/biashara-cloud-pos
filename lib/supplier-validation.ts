export type SupplierInput = {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  category?: unknown;
  balance?: unknown;
  status?: unknown;
};

type SupplierValidationResult =
  | { errors: string[]; data?: never }
  | {
      errors?: never;
      data: {
        name: string;
        phone: string;
        email: string | null;
        category: string;
        balance: number;
        status: string;
      };
    };

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

export function supplierData(input: SupplierInput): SupplierValidationResult {
  const balance = numberValue(input.balance ?? 0);
  const errors: string[] = [];

  if (!text(input.name)) errors.push("Supplier name is required.");
  if (!text(input.phone)) errors.push("Phone is required.");
  if (!text(input.category)) errors.push("Category is required.");
  if (!Number.isFinite(balance) || balance < 0) errors.push("Opening balance cannot be negative.");

  if (errors.length > 0) return { errors };

  const requestedStatus = text(input.status).toLowerCase();
  const status = requestedStatus === "inactive" ? "inactive" : balance > 0 ? "Owes" : "Clear";

  return {
    data: {
      name: text(input.name),
      phone: text(input.phone),
      email: optionalText(input.email),
      category: text(input.category),
      balance,
      status,
    },
  };
}
