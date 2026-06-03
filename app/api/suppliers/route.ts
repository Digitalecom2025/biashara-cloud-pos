import { NextResponse } from "next/server";
import { getDemoBusinessId, getSuppliersForPage, mapSupplierForPage } from "@/lib/db-data";
import { prisma } from "@/lib/prisma";
import { supplierData, type SupplierInput } from "@/lib/supplier-validation";

export async function GET() {
  const suppliers = await getSuppliersForPage();
  return NextResponse.json({ data: suppliers });
}

export async function POST(request: Request) {
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const body = (await request.json()) as SupplierInput;
  const parsed = supplierData(body);
  if (parsed.errors) return NextResponse.json({ error: parsed.errors.join(" ") }, { status: 400 });

  try {
    const supplier = await prisma.supplier.create({
      data: {
        businessId,
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email,
        category: parsed.data.category,
        balance: parsed.data.balance,
        totalPurchases: 0,
        status: parsed.data.status,
      },
    });
    return NextResponse.json({ data: mapSupplierForPage(supplier), message: "Supplier created." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create supplier." }, { status: 500 });
  }
}
