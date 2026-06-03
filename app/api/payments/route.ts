import { NextResponse } from "next/server";
import { getDemoBusinessId } from "@/lib/db-data";
import { paymentData, type PaymentInput } from "@/lib/payment-validation";
import { prisma } from "@/lib/prisma";

function mapPayment(payment: {
  id: string;
  amount: unknown;
  paymentMethod: string;
  reference: string | null;
  status: string;
  createdAt: Date;
}) {
  return {
    id: payment.id,
    amount: Number(payment.amount),
    paymentMethod: payment.paymentMethod,
    reference: payment.reference ?? "",
    status: payment.status,
    createdAt: payment.createdAt.toISOString(),
  };
}

export async function GET(request: Request) {
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");
  const payments = await prisma.payment.findMany({
    where: { businessId, customerId: customerId || undefined },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ data: payments.map(mapPayment) });
}

export async function POST(request: Request) {
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const body = (await request.json()) as PaymentInput;
  const parsed = paymentData(body);
  if (parsed.errors) return NextResponse.json({ error: parsed.errors.join(" ") }, { status: 400 });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findFirst({
        where: { id: parsed.data.customerId, businessId, status: { notIn: ["inactive", "Inactive"] } },
      });
      if (!customer) throw new Error("Customer not found.");

      const currentBalance = Number(customer.debtBalance);
      if (currentBalance <= 0 && !parsed.data.allowOverpay) throw new Error("This customer has no outstanding balance.");
      if (parsed.data.amount > currentBalance && !parsed.data.allowOverpay) throw new Error("Payment amount exceeds the customer balance.");

      const newBalance = Math.max(0, currentBalance - parsed.data.amount);
      const nextStatus = newBalance === 0 ? "Clear" : customer.status === "Overdue" ? "Overdue" : "Owes";
      const referenceParts = [parsed.data.reference, parsed.data.note ? `Note: ${parsed.data.note}` : null].filter(Boolean);

      const payment = await tx.payment.create({
        data: {
          businessId,
          customerId: customer.id,
          amount: parsed.data.amount,
          paymentMethod: parsed.data.paymentMethod,
          reference: referenceParts.join(" | ") || null,
          status: "Completed",
        },
      });

      const updatedCustomer = await tx.customer.update({
        where: { id: customer.id },
        data: { debtBalance: newBalance, status: nextStatus },
      });

      return {
        payment: mapPayment(payment),
        customer: {
          id: updatedCustomer.id,
          debtBalance: Number(updatedCustomer.debtBalance),
          status: updatedCustomer.status,
        },
      };
    });

    return NextResponse.json({ data: result, message: "Payment recorded." }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to record payment." }, { status: 400 });
  }
}
