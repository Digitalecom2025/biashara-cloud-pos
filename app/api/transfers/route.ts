import { NextResponse } from "next/server";
import { getDemoBusinessId, getTransfersForPage } from "@/lib/db-data";
import { transferData, type TransferInput } from "@/lib/inventory-validation";
import { prisma } from "@/lib/prisma";

function transferReference() {
  return `TRF-${Date.now().toString().slice(-6)}`;
}

export async function GET() {
  const transfers = await getTransfersForPage();
  return NextResponse.json({ data: transfers });
}

export async function POST(request: Request) {
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const body = (await request.json()) as TransferInput;
  const parsed = transferData(body);
  if (parsed.errors) return NextResponse.json({ error: parsed.errors.join(" ") }, { status: 400 });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: parsed.data.productId, businessId, status: { notIn: ["inactive", "Inactive"] } },
      });
      if (!product) throw new Error("Product not found.");
      if (parsed.data.quantity > product.stock) throw new Error(`${product.name} has only ${product.stock} in stock.`);

      const reference = transferReference();
      const reason = `Transfer from ${parsed.data.from} to ${parsed.data.to}.${parsed.data.notes ? ` Notes: ${parsed.data.notes}` : ""}`;
      const branch = await tx.branch.findFirst({ where: { businessId } });

      const out = await tx.stockMovement.create({
        data: {
          businessId,
          branchId: branch?.id,
          productId: product.id,
          type: "transfer_out",
          quantity: -parsed.data.quantity,
          reason,
          reference,
          createdBy: parsed.data.requestedBy,
        },
      });
      await tx.stockMovement.create({
        data: {
          businessId,
          branchId: branch?.id,
          productId: product.id,
          type: "transfer_in",
          quantity: parsed.data.quantity,
          reason,
          reference,
          createdBy: parsed.data.requestedBy,
        },
      });
      await tx.auditLog.create({
        data: {
          businessId,
          action: "Stock transfer completed",
          entity: "StockMovement",
          entityId: out.id,
          details: `${reference} ${product.name} ${parsed.data.quantity} from ${parsed.data.from} to ${parsed.data.to}`,
        },
      });

      return {
        id: reference,
        product: product.name,
        quantity: parsed.data.quantity,
        from: parsed.data.from,
        to: parsed.data.to,
        requestedBy: parsed.data.requestedBy,
        approvedBy: "System approved",
        date: out.createdAt.toISOString(),
        status: "Completed",
      };
    });

    return NextResponse.json({ data: result, message: "Transfer saved." }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save transfer." }, { status: 400 });
  }
}
