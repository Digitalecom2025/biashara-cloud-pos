import { NextResponse } from "next/server";
import { getDemoBusinessId } from "@/lib/db-data";
import { defaultPaymentTypes, getPaymentTypesForPage } from "@/lib/finance-data";
import { paymentTypeData } from "@/lib/payment-type-validation";
import { prisma } from "@/lib/prisma";

async function upsertPaymentType(businessId: string, code: string, value: { name: string; description: string; status: "Active" | "Inactive" }) {
  const base = defaultPaymentTypes.find((item) => item.code === code);
  const payload = {
    id: code,
    code,
    name: value.name || base?.name || code,
    description: value.description || base?.description || "",
    status: value.status,
  };

  return prisma.setting.upsert({
    where: { businessId_key: { businessId, key: `paymentType.${code}` } },
    update: { value: JSON.stringify(payload) },
    create: { businessId, key: `paymentType.${code}`, value: JSON.stringify(payload) },
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const parsed = paymentTypeData({ ...(await request.json()), code: id });
  if (parsed.errors) return NextResponse.json({ error: parsed.errors.join(" ") }, { status: 400 });

  await upsertPaymentType(businessId, id, parsed.data);
  return NextResponse.json({ data: await getPaymentTypesForPage(), message: "Payment type updated." });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const existing = (await getPaymentTypesForPage()).find((item) => item.code === id);
  if (!existing) return NextResponse.json({ error: "Payment type not found." }, { status: 404 });

  await upsertPaymentType(businessId, id, {
    name: existing.name,
    description: existing.description,
    status: "Inactive",
  });
  return NextResponse.json({ data: await getPaymentTypesForPage(), message: "Payment type deactivated." });
}
