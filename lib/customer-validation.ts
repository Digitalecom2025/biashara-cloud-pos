export type CustomerInput = {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  customerType?: unknown;
  debtBalance?: unknown;
  status?: unknown;
};

type CustomerValidationResult =
  | { errors: string[]; data?: never }
  | {
      errors?: never;
      data: {
        name: string;
        phone: string;
        email: string | null;
        customerType: string;
        debtBalance: number;
        status: string;
      };
    };

const customerTypes = new Set(["Walk-in", "Retail", "Wholesale", "Company", "Regular"]);

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

export function customerData(input: CustomerInput): CustomerValidationResult {
  const debtBalance = numberValue(input.debtBalance ?? 0);
  const errors: string[] = [];
  const customerType = customerTypes.has(text(input.customerType)) ? text(input.customerType) : "Retail";
  const activeStatus = text(input.status).toLowerCase() === "inactive" ? "inactive" : "active";

  if (!text(input.name)) errors.push("Customer name is required.");
  if (!text(input.phone)) errors.push("Phone number is required.");
  if (!Number.isFinite(debtBalance) || debtBalance < 0) errors.push("Opening debt balance cannot be negative.");

  if (errors.length > 0) return { errors };

  return {
    data: {
      name: text(input.name),
      phone: text(input.phone),
      email: optionalText(input.email),
      customerType,
      debtBalance,
      status: activeStatus === "inactive" ? "inactive" : debtBalance > 0 ? "Owes" : "Clear",
    },
  };
}
