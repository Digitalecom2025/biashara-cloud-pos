import { NextResponse } from "next/server";
import { getDemoBusinessId } from "@/lib/db-data";
import { getSettingsForPage } from "@/lib/settings-data";
import { settingsData, type SettingsInput } from "@/lib/settings-validation";
import { prisma } from "@/lib/prisma";

const settingKeys = [
  "businessLogoUrl",
  "receiptTitle",
  "receiptFooterNote",
  "showBusinessPhone",
  "showCashierName",
  "showCustomerBalance",
  "receiptPaperSize",
  "defaultCurrency",
  "defaultPaymentMethod",
  "lowStockAlertThreshold",
  "timezone",
  "dateFormat",
  "enableTax",
  "enableRewards",
  "enableSmsReminders",
];

export async function GET() {
  try {
    return NextResponse.json({ data: await getSettingsForPage() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Settings could not be loaded." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const parsed = settingsData((await request.json()) as SettingsInput);
  if (parsed.errors) return NextResponse.json({ error: parsed.errors.join(" ") }, { status: 400 });

  try {
    await prisma.$transaction([
      prisma.business.update({
        where: { id: businessId },
        data: {
          name: parsed.data.business.name,
          phone: parsed.data.business.phone,
          email: parsed.data.business.email,
          location: parsed.data.business.location,
          industryMode: parsed.data.business.industryMode,
        },
      }),
      ...settingKeys.map((key) =>
        prisma.setting.upsert({
          where: { businessId_key: { businessId, key } },
          update: { value: String(parsed.data.settings[key as keyof typeof parsed.data.settings]) },
          create: { businessId, key, value: String(parsed.data.settings[key as keyof typeof parsed.data.settings]) },
        }),
      ),
      prisma.auditLog.create({
        data: {
          businessId,
          action: "Settings updated",
          entity: "Setting",
          details: `Business profile and system settings updated for ${parsed.data.business.name}`,
        },
      }),
    ]);

    return NextResponse.json({ data: await getSettingsForPage(), message: "Settings saved." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Settings could not be saved." }, { status: 400 });
  }
}
