import { NextResponse } from "next/server";
import { getDemoBusinessId } from "@/lib/db-data";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const purchase = await prisma.purchase.findFirst({
    where: { id, businessId },
    include: { supplier: true, items: { include: { product: true } } },
  });

  if (!purchase) return NextResponse.json({ error: "Purchase not found." }, { status: 404 });

  return NextResponse.json({
    data: {
      id: purchase.id,
      invoice: purchase.invoiceNumber,
      supplier: purchase.supplier.name,
      supplierId: purchase.supplierId,
      date: purchase.purchaseDate.toISOString(),
      notes: purchase.notes ?? "",
      totalAmount: Number(purchase.total),
      paidAmount: Number(purchase.paid),
      balanceDue: Number(purchase.due),
      paymentMethod: purchase.paymentMethod,
      status: purchase.status,
      items: purchase.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        product: item.product.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
      })),
    },
  });
}
