import { NextResponse } from "next/server";
import { getDemoBusinessId, mapSupplierForPage } from "@/lib/db-data";
import { prisma } from "@/lib/prisma";
import { supplierData } from "@/lib/supplier-validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const parsed = supplierData(await request.json());
  if (parsed.errors) return NextResponse.json({ error: parsed.errors.join(" ") }, { status: 400 });

  const existing = await prisma.supplier.findFirst({ where: { id, businessId } });
  if (!existing) return NextResponse.json({ error: "Supplier not found." }, { status: 404 });

  try {
    const supplier = await prisma.supplier.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ data: mapSupplierForPage(supplier), message: "Supplier updated." });
  } catch {
    return NextResponse.json({ error: "Failed to update supplier." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const existing = await prisma.supplier.findFirst({ where: { id, businessId } });
  if (!existing) return NextResponse.json({ error: "Supplier not found." }, { status: 404 });

  try {
    const supplier = await prisma.supplier.update({
      where: { id },
      data: { status: "inactive" },
    });
    return NextResponse.json({ data: mapSupplierForPage(supplier), message: "Supplier deactivated." });
  } catch {
    return NextResponse.json({ error: "Failed to deactivate supplier." }, { status: 500 });
  }
}
