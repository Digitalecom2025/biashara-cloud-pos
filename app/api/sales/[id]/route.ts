import { NextResponse } from "next/server";
import { getDemoBusinessId } from "@/lib/db-data";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const sale = await prisma.sale.findFirst({
    where: { id, businessId },
    include: {
      customer: true,
      cashier: true,
      branch: true,
      items: { include: { product: true } },
      payments: true,
    },
  });

  if (!sale) return NextResponse.json({ error: "Sale not found." }, { status: 404 });

  return NextResponse.json({
    data: {
      id: sale.id,
      invoice: sale.invoiceNumber,
      customer: sale.customer?.name ?? "Walk-in Customer",
      payment: sale.paymentMethod,
      total: Number(sale.total),
      paid: Number(sale.paid),
      due: Number(sale.due),
      cashier: sale.cashier.name,
      branch: sale.branch.name,
      date: sale.createdAt.toISOString(),
      status: Number(sale.due) === 0 ? "Paid" : Number(sale.paid) > 0 ? "Partial" : "Due",
      items: sale.items.map((item) => ({
        id: item.productId,
        name: item.product.name,
        code: item.product.code,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
      })),
      payments: sale.payments.map((payment) => ({
        id: payment.id,
        amount: Number(payment.amount),
        paymentMethod: payment.paymentMethod,
        reference: payment.reference,
        status: payment.status,
      })),
    },
  });
}
