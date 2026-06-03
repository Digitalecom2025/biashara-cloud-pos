export type StockAdjustmentInput = {
  productId?: unknown;
  type?: unknown;
  quantity?: unknown;
  reason?: unknown;
  warehouse?: unknown;
  notes?: unknown;
  adjustedBy?: unknown;
};

export type TransferInput = {
  productId?: unknown;
  quantity?: unknown;
  from?: unknown;
  to?: unknown;
  requestedBy?: unknown;
  notes?: unknown;
};

type AdjustmentValidationResult =
  | { errors: string[]; data?: never }
  | {
      errors?: never;
      data: {
        productId: string;
        type: "Add" | "Reduce" | "Damage" | "Correction";
        quantity: number;
        reason: string;
        warehouse: string;
        notes: string | null;
        adjustedBy: string;
      };
    };

type TransferValidationResult =
  | { errors: string[]; data?: never }
  | {
      errors?: never;
      data: {
        productId: string;
        quantity: number;
        from: string;
        to: string;
        requestedBy: string;
        notes: string | null;
      };
    };

const adjustmentTypes = new Set(["Add", "Reduce", "Damage", "Correction"]);

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

export function stockAdjustmentData(input: StockAdjustmentInput): AdjustmentValidationResult {
  const type = text(input.type);
  const quantity = numberValue(input.quantity);
  const errors: string[] = [];

  if (!text(input.productId)) errors.push("Product is required.");
  if (!adjustmentTypes.has(type)) errors.push("Adjustment type is required.");
  if (!Number.isFinite(quantity) || quantity <= 0) errors.push("Quantity must be greater than 0.");
  if (!text(input.reason)) errors.push("Reason is required.");
  if (!text(input.warehouse)) errors.push("Warehouse is required.");

  if (errors.length > 0) return { errors };

  return {
    data: {
      productId: text(input.productId),
      type: type as "Add" | "Reduce" | "Damage" | "Correction",
      quantity: Math.trunc(quantity),
      reason: text(input.reason),
      warehouse: text(input.warehouse),
      notes: optionalText(input.notes),
      adjustedBy: text(input.adjustedBy) || "Inventory team",
    },
  };
}

export function transferData(input: TransferInput): TransferValidationResult {
  const quantity = numberValue(input.quantity);
  const from = text(input.from);
  const to = text(input.to);
  const errors: string[] = [];

  if (!text(input.productId)) errors.push("Product is required.");
  if (!Number.isFinite(quantity) || quantity <= 0) errors.push("Quantity must be greater than 0.");
  if (!from) errors.push("From location is required.");
  if (!to) errors.push("To location is required.");
  if (from && to && from === to) errors.push("From and To locations cannot be the same.");

  if (errors.length > 0) return { errors };

  return {
    data: {
      productId: text(input.productId),
      quantity: Math.trunc(quantity),
      from,
      to,
      requestedBy: text(input.requestedBy) || "Inventory team",
      notes: optionalText(input.notes),
    },
  };
}
