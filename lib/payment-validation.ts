export type PaymentInput = {
  customerId?: unknown;
  amount?: unknown;
  paymentMethod?: unknown;
  reference?: unknown;
  note?: unknown;
  allowOverpay?: unknown;
};

type PaymentValidationResult =
  | { errors: string[]; data?: never }
  | {
      errors?: never;
      data: {
        customerId: string;
        amount: number;
        paymentMethod: string;
        reference: string | null;
        note: string | null;
        allowOverpay: boolean;
      };
    };

const paymentMethods = new Set(["Cash", "M-Pesa", "Bank"]);

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

export function paymentData(input: PaymentInput): PaymentValidationResult {
  const amount = numberValue(input.amount);
  const paymentMethod = text(input.paymentMethod);
  const errors: string[] = [];

  if (!text(input.customerId)) errors.push("Customer is required.");
  if (!Number.isFinite(amount)) errors.push("Amount is required.");
  if (Number.isFinite(amount) && amount <= 0) errors.push("Amount must be greater than 0.");
  if (!paymentMethods.has(paymentMethod)) errors.push("Payment method is required.");

  if (errors.length > 0) return { errors };

  return {
    data: {
      customerId: text(input.customerId),
      amount,
      paymentMethod,
      reference: optionalText(input.reference),
      note: optionalText(input.note),
      allowOverpay: input.allowOverpay === true,
    },
  };
}
