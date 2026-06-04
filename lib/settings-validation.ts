import type { SettingsData } from "@/lib/settings-data";
import { defaultSettings, industryModes } from "@/lib/settings-options";
import { normalizeIndustryMode } from "@/lib/industryops";

export type SettingsInput = Partial<SettingsData["business"]> & Partial<SettingsData["settings"]>;

type SettingsValidationResult =
  | { errors: string[]; data?: never }
  | {
      errors?: never;
      data: SettingsData;
    };

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function bool(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function numberValue(value: unknown, fallback: number) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function validEmail(value: string) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validPhone(value: string) {
  return !value || /^[0-9+\-\s()A-Za-z]+$/.test(value);
}

export function settingsData(input: SettingsInput): SettingsValidationResult {
  const name = text(input.name);
  const phone = text(input.phone);
  const email = text(input.email);
  const location = text(input.location);
  const rawIndustryMode = text(input.industryMode) || "Retail";
  const industryMode = normalizeIndustryMode(rawIndustryMode);
  const lowStockAlertThreshold = numberValue(input.lowStockAlertThreshold, defaultSettings.lowStockAlertThreshold);
  const defaultCurrency = text(input.defaultCurrency) || "KES";
  const errors: string[] = [];

  if (!name) errors.push("Business name is required.");
  if (!validEmail(email)) errors.push("Email should be valid.");
  if (!validPhone(phone)) errors.push("Phone should be valid.");
  if (!industryModes.includes(industryMode)) errors.push("IndustryOps mode is required.");
  if (!Number.isFinite(lowStockAlertThreshold) || lowStockAlertThreshold < 0) errors.push("Low stock threshold must be 0 or greater.");
  if (!defaultCurrency) errors.push("Currency is required.");

  if (errors.length > 0) return { errors };

  return {
    data: {
      business: {
        name,
        phone,
        email,
        location,
        industryMode,
        packagePlan: text(input.packagePlan),
      },
      settings: {
        businessLogoUrl: text(input.businessLogoUrl),
        receiptTitle: text(input.receiptTitle) || name,
        receiptFooterNote: text(input.receiptFooterNote),
        showBusinessPhone: bool(input.showBusinessPhone, defaultSettings.showBusinessPhone),
        showCashierName: bool(input.showCashierName, defaultSettings.showCashierName),
        showCustomerBalance: bool(input.showCustomerBalance, defaultSettings.showCustomerBalance),
        receiptPaperSize: text(input.receiptPaperSize) || defaultSettings.receiptPaperSize,
        defaultCurrency,
        defaultPaymentMethod: text(input.defaultPaymentMethod) || defaultSettings.defaultPaymentMethod,
        lowStockAlertThreshold,
        timezone: text(input.timezone) || defaultSettings.timezone,
        dateFormat: text(input.dateFormat) || defaultSettings.dateFormat,
        enableTax: bool(input.enableTax, defaultSettings.enableTax),
        enableRewards: bool(input.enableRewards, defaultSettings.enableRewards),
        enableSmsReminders: bool(input.enableSmsReminders, defaultSettings.enableSmsReminders),
      },
    },
  };
}
