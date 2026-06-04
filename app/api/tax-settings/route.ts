import { NextResponse } from "next/server";
import { getDemoBusinessId } from "@/lib/db-data";
import { getTaxSettingsForPage } from "@/lib/finance-data";
import { prisma } from "@/lib/prisma";
import { taxSettingsData, type TaxSettingsInput } from "@/lib/tax-settings-validation";

export async function GET() {
  const settings = await getTaxSettingsForPage();
  return NextResponse.json({ data: settings });
}

export async function POST(request: Request) {
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const body = (await request.json()) as TaxSettingsInput;
  const parsed = taxSettingsData(body);
  if (parsed.errors) return NextResponse.json({ error: parsed.errors.join(" ") }, { status: 400 });

  const entries = [
    ["tax.vatEnabled", String(parsed.data.vatEnabled)],
    ["tax.vatRate", String(parsed.data.vatRate)],
    ["tax.mode", parsed.data.mode],
    ["tax.invoicePrefix", parsed.data.invoicePrefix],
    ["tax.etimsStatus", parsed.data.etimsStatus],
    ["tax.businessPin", parsed.data.businessPin],
  ];

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { businessId_key: { businessId, key } },
        update: { value },
        create: { businessId, key, value },
      }),
    ),
  );

  await prisma.auditLog.create({
    data: {
      businessId,
      action: "Tax settings updated",
      entity: "Setting",
      details: `VAT ${parsed.data.vatEnabled ? "enabled" : "disabled"} at ${parsed.data.vatRate}% using ${parsed.data.mode} pricing`,
    },
  });

  return NextResponse.json({ data: await getTaxSettingsForPage(), message: "Tax settings saved." });
}
