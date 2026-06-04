export type PaymentTypeInput = {
  name?: unknown;
  code?: unknown;
  description?: unknown;
  status?: unknown;
};

type PaymentTypeValidationResult =
  | { errors: string[]; data?: never }
  | {
      errors?: never;
      data: {
        name: string;
        code: string;
        description: string;
        status: "Active" | "Inactive";
      };
    };

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeCode(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function paymentTypeData(input: PaymentTypeInput): PaymentTypeValidationResult {
  const name = text(input.name);
  const code = normalizeCode(text(input.code) || name);
  const status = text(input.status).toLowerCase() === "inactive" ? "Inactive" : "Active";
  const errors: string[] = [];

  if (!name) errors.push("Payment type name is required.");
  if (!code) errors.push("Payment type code is required.");

  if (errors.length > 0) return { errors };

  return {
    data: {
      name,
      code,
      description: text(input.description),
      status,
    },
  };
}
