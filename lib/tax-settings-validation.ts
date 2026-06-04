export type TaxSettingsInput = {
  vatEnabled?: unknown;
  vatRate?: unknown;
  mode?: unknown;
  invoicePrefix?: unknown;
  etimsStatus?: unknown;
  businessPin?: unknown;
};

type TaxSettingsValidationResult =
  | { errors: string[]; data?: never }
  | {
      errors?: never;
      data: {
        vatEnabled: boolean;
        vatRate: number;
        mode: "inclusive" | "exclusive";
        invoicePrefix: string;
        etimsStatus: string;
        businessPin: string;
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

export function taxSettingsData(input: TaxSettingsInput): TaxSettingsValidationResult {
  const vatEnabled = input.vatEnabled === true || input.vatEnabled === "true";
  const vatRate = numberValue(input.vatRate ?? 0);
  const mode = text(input.mode).toLowerCase() === "exclusive" ? "exclusive" : "inclusive";
  const errors: string[] = [];

  if (!Number.isFinite(vatRate) || vatRate < 0 || vatRate > 100) errors.push("VAT rate must be between 0 and 100.");
  if (vatEnabled && !mode) errors.push("Tax mode is required when VAT is enabled.");

  if (errors.length > 0) return { errors };

  return {
    data: {
      vatEnabled,
      vatRate,
      mode,
      invoicePrefix: text(input.invoicePrefix) || "TAX-INV-",
      etimsStatus: text(input.etimsStatus) || "Not connected",
      businessPin: text(input.businessPin),
    },
  };
}
