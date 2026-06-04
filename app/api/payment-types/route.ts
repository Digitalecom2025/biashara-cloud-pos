import { NextResponse } from "next/server";
import { getDemoBusinessId } from "@/lib/db-data";
import { getPaymentTypesForPage } from "@/lib/finance-data";
import { paymentTypeData, type PaymentTypeInput } from "@/lib/payment-type-validation";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const paymentTypes = await getPaymentTypesForPage();
  return NextResponse.json({ data: paymentTypes });
}

export async function POST(request: Request) {
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const body = (await request.json()) as PaymentTypeInput;
  const parsed = paymentTypeData(body);
  if (parsed.errors) return NextResponse.json({ error: parsed.errors.join(" ") }, { status: 400 });

  const key = `paymentType.${parsed.data.code}`;
  const existing = await prisma.setting.findUnique({ where: { businessId_key: { businessId, key } } });
  if (existing) return NextResponse.json({ error: "A payment type with this code already exists." }, { status: 409 });

  await prisma.setting.create({
    data: {
      businessId,
      key,
      value: JSON.stringify({ ...parsed.data, id: parsed.data.code }),
    },
  });

  return NextResponse.json({ data: await getPaymentTypesForPage(), message: "Payment type created." }, { status: 201 });
}
