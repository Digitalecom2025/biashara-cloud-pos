import { NextResponse } from "next/server";
import { getDemoBusinessId, mapCustomerForPage } from "@/lib/db-data";
import { customerData } from "@/lib/customer-validation";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const parsed = customerData(await request.json());
  if (parsed.errors) return NextResponse.json({ error: parsed.errors.join(" ") }, { status: 400 });

  const existing = await prisma.customer.findFirst({ where: { id, businessId } });
  if (!existing) return NextResponse.json({ error: "Customer not found." }, { status: 404 });

  try {
    const customer = await prisma.customer.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ data: mapCustomerForPage(customer), message: "Customer updated." });
  } catch {
    return NextResponse.json({ error: "Failed to update customer." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const existing = await prisma.customer.findFirst({ where: { id, businessId } });
  if (!existing) return NextResponse.json({ error: "Customer not found." }, { status: 404 });

  try {
    const customer = await prisma.customer.update({
      where: { id },
      data: { status: "inactive" },
    });
    return NextResponse.json({ data: mapCustomerForPage(customer), message: "Customer deactivated." });
  } catch {
    return NextResponse.json({ error: "Failed to deactivate customer." }, { status: 500 });
  }
}
