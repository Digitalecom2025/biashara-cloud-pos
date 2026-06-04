export type SaleInput = {
  customerId?: unknown;
  paymentMethod?: unknown;
  discount?: unknown;
  items?: unknown;
  localId?: unknown;
  offlineSyncId?: unknown;
  deviceId?: unknown;
  localInvoiceNumber?: unknown;
};

export type SaleItemInput = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

type SaleValidationResult =
  | { errors: string[]; data?: never }
  | {
      errors?: never;
      data: {
        customerId: string | null;
        paymentMethod: "Cash" | "M-Pesa" | "Bank" | "Credit / Debt";
        discount: number;
        items: SaleItemInput[];
        offlineSyncId: string | null;
        deviceId: string | null;
        localInvoiceNumber: string | null;
      };
    };

const paymentMethods = new Set(["Cash", "M-Pesa", "Bank", "Credit / Debt"]);

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return Number.NaN;
}

function isItem(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function saleData(input: SaleInput): SaleValidationResult {
  const errors: string[] = [];
  const paymentMethod = text(input.paymentMethod);
  const discount = numberValue(input.discount ?? 0);
  const rawItems = Array.isArray(input.items) ? input.items : [];

  if (!paymentMethods.has(paymentMethod)) errors.push("Payment method is required.");
  if (!Number.isFinite(discount) || discount < 0) errors.push("Discount cannot be negative.");
  if (rawItems.length === 0) errors.push("Cart cannot be empty.");

  const items: SaleItemInput[] = rawItems.flatMap((item) => {
    if (!isItem(item)) return [];
    const productId = text(item.productId);
    const quantity = numberValue(item.quantity);
    const unitPrice = numberValue(item.unitPrice);
    if (!productId || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) return [];
    return [{ productId, quantity: Math.trunc(quantity), unitPrice }];
  });

  if (rawItems.length > 0 && items.length !== rawItems.length) errors.push("Every cart item must have a product, quantity and price.");
  if (errors.length > 0) return { errors };

  return {
    data: {
      customerId: text(input.customerId) || null,
      paymentMethod: paymentMethod as "Cash" | "M-Pesa" | "Bank" | "Credit / Debt",
      discount,
      items,
      offlineSyncId: text(input.offlineSyncId) || text(input.localId) || null,
      deviceId: text(input.deviceId) || null,
      localInvoiceNumber: text(input.localInvoiceNumber) || null,
    },
  };
}
