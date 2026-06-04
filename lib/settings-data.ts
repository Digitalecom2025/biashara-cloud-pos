import { getDemoBusinessId } from "@/lib/db-data";
import { prisma } from "@/lib/prisma";
import { defaultSettings, industryModes } from "@/lib/settings-options";

export type SettingsData = {
  business: {
    name: string;
    phone: string;
    email: string;
    location: string;
    industryMode: string;
    packagePlan: string;
  };
  settings: {
    businessLogoUrl: string;
    receiptTitle: string;
    receiptFooterNote: string;
    showBusinessPhone: boolean;
    showCashierName: boolean;
    showCustomerBalance: boolean;
    receiptPaperSize: string;
    defaultCurrency: string;
    defaultPaymentMethod: string;
    lowStockAlertThreshold: number;
    timezone: string;
    dateFormat: string;
    enableTax: boolean;
    enableRewards: boolean;
    enableSmsReminders: boolean;
  };
};

export { defaultSettings, industryModes };

const settingKeys = Object.keys(defaultSettings);

function normalizeIndustryMode(value: string) {
  return industryModes.find((mode) => mode.toLowerCase() === value.toLowerCase()) ?? "Retail";
}

function bool(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  return value === "true";
}

export async function getCurrentBusiness() {
  const businessId = await getDemoBusinessId();
  if (!businessId) throw new Error("Demo business has not been seeded.");
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) throw new Error("Demo business not found.");
  return business;
}

export async function getSettingsForPage(): Promise<SettingsData> {
  const business = await getCurrentBusiness();
  const records = await prisma.setting.findMany({ where: { businessId: business.id, key: { in: settingKeys } } });
  const values = new Map(records.map((setting) => [setting.key, setting.value]));

  return {
    business: {
      name: business.name,
      phone: business.phone,
      email: business.email,
      location: business.location,
      industryMode: normalizeIndustryMode(business.industryMode),
      packagePlan: business.packagePlan,
    },
    settings: {
      businessLogoUrl: values.get("businessLogoUrl") ?? defaultSettings.businessLogoUrl,
      receiptTitle: values.get("receiptTitle") ?? business.name,
      receiptFooterNote: values.get("receiptFooterNote") ?? values.get("receiptFooter") ?? defaultSettings.receiptFooterNote,
      showBusinessPhone: bool(values.get("showBusinessPhone"), defaultSettings.showBusinessPhone),
      showCashierName: bool(values.get("showCashierName"), defaultSettings.showCashierName),
      showCustomerBalance: bool(values.get("showCustomerBalance"), defaultSettings.showCustomerBalance),
      receiptPaperSize: values.get("receiptPaperSize") ?? defaultSettings.receiptPaperSize,
      defaultCurrency: values.get("defaultCurrency") ?? values.get("currency") ?? defaultSettings.defaultCurrency,
      defaultPaymentMethod: values.get("defaultPaymentMethod") ?? defaultSettings.defaultPaymentMethod,
      lowStockAlertThreshold: Number(values.get("lowStockAlertThreshold") ?? defaultSettings.lowStockAlertThreshold),
      timezone: values.get("timezone") ?? defaultSettings.timezone,
      dateFormat: values.get("dateFormat") ?? defaultSettings.dateFormat,
      enableTax: bool(values.get("enableTax"), defaultSettings.enableTax),
      enableRewards: bool(values.get("enableRewards"), defaultSettings.enableRewards),
      enableSmsReminders: bool(values.get("enableSmsReminders"), defaultSettings.enableSmsReminders),
    },
  };
}
