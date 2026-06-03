export type PurchaseInput = {
  supplierId?: unknown;
  invoiceNumber?: unknown;
  purchaseDate?: unknown;
  paymentMethod?: unknown;
  paidAmount?: unknown;
  notes?: unknown;
  allowOverpay?: unknown;
  items?: unknown;
};

export type PurchaseItemInput = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

type PurchaseValidationResult =
  | { errors: string[]; data?: never }
  | {
      errors?: never;
      data: {
        supplierId: string;
        invoiceNumber: string;
        purchaseDate: Date;
        paymentMethod: "Cash" | "M-Pesa" | "Bank" | "Credit";
        paidAmount: number;
        notes: string | null;
        allowOverpay: boolean;
        items: PurchaseItemInput[];
      };
    };

const paymentMethods = new Set(["Cash", "M-Pesa", "Bank", "Credit"]);

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

function isItem(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function purchaseData(input: PurchaseInput): PurchaseValidationResult {
  const errors: string[] = [];
  const supplierId = text(input.supplierId);
  const invoiceNumber = text(input.invoiceNumber);
  const paymentMethod = text(input.paymentMethod);
  const paidAmount = numberValue(input.paidAmount ?? 0);
  const rawItems = Array.isArray(input.items) ? input.items : [];
  const purchaseDate = text(input.purchaseDate) ? new Date(text(input.purchaseDate)) : new Date();

  if (!supplierId) errors.push("Supplier is required.");
  if (!invoiceNumber) errors.push("Purchase invoice number is required.");
  if (Number.isNaN(purchaseDate.getTime())) errors.push("Purchase date is invalid.");
  if (!paymentMethods.has(paymentMethod)) errors.push("Payment method is required.");
  if (!Number.isFinite(paidAmount) || paidAmount < 0) errors.push("Paid amount cannot be negative.");
  if (rawItems.length === 0) errors.push("At least one product item is required.");

  const items: PurchaseItemInput[] = rawItems.flatMap((item) => {
    if (!isItem(item)) return [];
    const productId = text(item.productId);
    const quantity = numberValue(item.quantity);
    const unitPrice = numberValue(item.unitPrice);
    if (!productId || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice <= 0) return [];
    return [{ productId, quantity: Math.trunc(quantity), unitPrice }];
  });

  if (rawItems.length > 0 && items.length !== rawItems.length) errors.push("Every purchase item needs a product, quantity and purchase price.");
  if (errors.length > 0) return { errors };

  return {
    data: {
      supplierId,
      invoiceNumber,
      purchaseDate,
      paymentMethod: paymentMethod as "Cash" | "M-Pesa" | "Bank" | "Credit",
      paidAmount,
      notes: optionalText(input.notes),
      allowOverpay: input.allowOverpay === true,
      items,
    },
  };
}
