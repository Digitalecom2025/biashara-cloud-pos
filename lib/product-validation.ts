export type ProductInput = {
  name?: unknown;
  description?: unknown;
  code?: unknown;
  sku?: unknown;
  barcode?: unknown;
  category?: unknown;
  brand?: unknown;
  unit?: unknown;
  purchasePrice?: unknown;
  salePrice?: unknown;
  stock?: unknown;
  reorderLevel?: unknown;
  warehouse?: unknown;
  rack?: unknown;
  shelf?: unknown;
  imageUrl?: unknown;
  status?: unknown;
};

type ProductValidationResult =
  | { errors: string[]; data?: never }
  | {
      errors?: never;
      data: {
        name: string;
        description: string;
        code: string;
        sku: string | null;
        barcode: string | null;
        category: string;
        brand: string | null;
        unit: string;
        purchasePrice: number;
        salePrice: number;
        stock: number;
        reorderLevel: number;
        warehouse: string;
        rack: string | null;
        shelf: string | null;
        imageUrl: string | null;
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

export function productData(input: ProductInput): ProductValidationResult {
  const purchasePrice = numberValue(input.purchasePrice);
  const salePrice = numberValue(input.salePrice);
  const stock = numberValue(input.stock ?? 0);
  const reorderLevel = numberValue(input.reorderLevel ?? 0);
  const errors: string[] = [];

  if (!text(input.name)) errors.push("Product name is required.");
  if (!text(input.code)) errors.push("Product code is required.");
  if (!Number.isFinite(purchasePrice)) errors.push("Purchase price is required.");
  if (!Number.isFinite(salePrice)) errors.push("Sale price is required.");
  if (!Number.isFinite(stock) || stock < 0) errors.push("Stock cannot be negative.");
  if (!Number.isFinite(reorderLevel) || reorderLevel < 0) errors.push("Reorder level cannot be negative.");

  if (errors.length > 0) return { errors };

  const status = text(input.status).toLowerCase() === "inactive" ? "inactive" : "active";

  return {
    data: {
      name: text(input.name),
      description: text(input.description),
      code: text(input.code),
      sku: optionalText(input.sku),
      barcode: optionalText(input.barcode),
      category: text(input.category) || "General",
      brand: optionalText(input.brand),
      unit: text(input.unit) || "Piece",
      purchasePrice,
      salePrice,
      stock: Math.trunc(stock),
      reorderLevel: Math.trunc(reorderLevel),
      warehouse: text(input.warehouse) || "Main Warehouse",
      rack: optionalText(input.rack),
      shelf: optionalText(input.shelf),
      imageUrl: optionalText(input.imageUrl),
      status,
    },
  };
}
