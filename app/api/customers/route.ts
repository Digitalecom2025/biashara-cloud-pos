import { NextResponse } from "next/server";
import { getCustomersForPage, getDemoBusinessId, mapCustomerForPage } from "@/lib/db-data";
import { customerData, type CustomerInput } from "@/lib/customer-validation";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const customers = await getCustomersForPage();
  return NextResponse.json({ data: customers });
}

export async function POST(request: Request) {
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const body = (await request.json()) as CustomerInput;
  const parsed = customerData(body);
  if (parsed.errors) return NextResponse.json({ error: parsed.errors.join(" ") }, { status: 400 });

  try {
    const customer = await prisma.customer.create({
      data: {
        businessId,
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email,
        customerType: parsed.data.customerType,
        debtBalance: parsed.data.debtBalance,
        totalPurchases: 0,
        status: parsed.data.status,
      },
    });
    return NextResponse.json({ data: mapCustomerForPage(customer), message: "Customer created." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create customer." }, { status: 500 });
  }
}
