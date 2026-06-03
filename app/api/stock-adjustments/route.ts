import { NextResponse } from "next/server";
import { getDemoBusinessId, getStockAdjustmentsForPage } from "@/lib/db-data";
import { stockAdjustmentData, type StockAdjustmentInput } from "@/lib/inventory-validation";
import { prisma } from "@/lib/prisma";

function adjustmentReference() {
  return `ADJ-${Date.now().toString().slice(-6)}`;
}

export async function GET() {
  const adjustments = await getStockAdjustmentsForPage();
  return NextResponse.json({ data: adjustments });
}

export async function POST(request: Request) {
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const body = (await request.json()) as StockAdjustmentInput;
  const parsed = stockAdjustmentData(body);
  if (parsed.errors) return NextResponse.json({ error: parsed.errors.join(" ") }, { status: 400 });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: parsed.data.productId, businessId, status: { notIn: ["inactive", "Inactive"] } },
      });
      if (!product) throw new Error("Product not found.");

      let movementQuantity = parsed.data.quantity;
      let nextStock = product.stock;
      let movementType = "adjustment";
      if (parsed.data.type === "Add") {
        nextStock = product.stock + parsed.data.quantity;
      } else if (parsed.data.type === "Reduce") {
        movementQuantity = -parsed.data.quantity;
        nextStock = product.stock - parsed.data.quantity;
      } else if (parsed.data.type === "Damage") {
        movementType = "damage";
        movementQuantity = -parsed.data.quantity;
        nextStock = product.stock - parsed.data.quantity;
      } else {
        movementType = "correction";
        movementQuantity = parsed.data.quantity - product.stock;
        nextStock = parsed.data.quantity;
      }

      if (nextStock < 0) throw new Error(`${product.name} has only ${product.stock} in stock.`);

      const reference = adjustmentReference();
      const reason = parsed.data.notes ? `${parsed.data.reason}. Notes: ${parsed.data.notes}` : parsed.data.reason;
      const branch = await tx.branch.findFirst({ where: { businessId, name: parsed.data.warehouse } }) ?? await tx.branch.findFirst({ where: { businessId } });

      await tx.product.update({ where: { id: product.id }, data: { stock: nextStock, warehouse: parsed.data.warehouse } });
      const movement = await tx.stockMovement.create({
        data: {
          businessId,
          branchId: branch?.id,
          productId: product.id,
          type: movementType,
          quantity: movementQuantity,
          reason,
          reference,
          createdBy: parsed.data.adjustedBy,
        },
      });
      await tx.auditLog.create({
        data: {
          businessId,
          action: "Stock adjustment completed",
          entity: "StockMovement",
          entityId: movement.id,
          details: `${reference} ${parsed.data.type} ${parsed.data.quantity} ${product.name} by ${parsed.data.adjustedBy}`,
        },
      });

      return {
        id: reference,
        product: product.name,
        type: parsed.data.type,
        quantity: parsed.data.quantity,
        reason,
        warehouse: parsed.data.warehouse,
        adjustedBy: parsed.data.adjustedBy,
        date: movement.createdAt.toISOString(),
        status: "Approved",
        stock: nextStock,
      };
    });

    return NextResponse.json({ data: result, message: "Stock adjustment saved." }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save stock adjustment." }, { status: 400 });
  }
}
