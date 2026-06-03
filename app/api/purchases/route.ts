import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getDemoBusinessId, getPurchasesForPage } from "@/lib/db-data";
import { prisma } from "@/lib/prisma";
import { purchaseData, type PurchaseInput } from "@/lib/purchase-validation";

export async function GET() {
  const purchases = await getPurchasesForPage();
  return NextResponse.json({ data: purchases });
}

export async function POST(request: Request) {
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const body = (await request.json()) as PurchaseInput;
  const parsed = purchaseData(body);
  if (parsed.errors) return NextResponse.json({ error: parsed.errors.join(" ") }, { status: 400 });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const supplier = await tx.supplier.findFirst({
        where: { id: parsed.data.supplierId, businessId, status: { notIn: ["inactive", "Inactive"] } },
      });
      if (!supplier) throw new Error("Supplier not found.");

      const productIds = parsed.data.items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: { businessId, id: { in: productIds }, status: { notIn: ["inactive", "Inactive"] } },
      });
      if (products.length !== productIds.length) throw new Error("One or more products are unavailable.");

      const total = parsed.data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      if (parsed.data.paidAmount > total && !parsed.data.allowOverpay) throw new Error("Paid amount cannot exceed purchase total.");
      const paid = Math.min(parsed.data.paidAmount, total);
      const due = total - paid;
      const status = due === 0 ? "Paid" : paid > 0 ? "Partial" : "Unpaid";
      const branch = await tx.branch.findFirst({ where: { businessId, name: "Main Branch" } }) ?? await tx.branch.findFirst({ where: { businessId } });
      const user = await tx.user.findFirst({ where: { businessId, role: "Stock Clerk" } }) ?? await tx.user.findFirst({ where: { businessId } });

      const purchase = await tx.purchase.create({
        data: {
          businessId,
          supplierId: supplier.id,
          invoiceNumber: parsed.data.invoiceNumber,
          purchaseDate: parsed.data.purchaseDate,
          notes: parsed.data.notes,
          total,
          paid,
          due,
          paymentMethod: parsed.data.paymentMethod,
          status,
        },
      });

      await tx.purchaseItem.createMany({
        data: parsed.data.items.map((item) => ({
          purchaseId: purchase.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),
      });

      for (const item of parsed.data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            purchasePrice: item.unitPrice,
          },
        });
        await tx.stockMovement.create({
          data: {
            businessId,
            branchId: branch?.id,
            productId: item.productId,
            type: "purchase",
            quantity: item.quantity,
            reason: "Purchase stock intake",
            reference: parsed.data.invoiceNumber,
            createdBy: user?.name ?? "System",
          },
        });
      }

      if (paid > 0) {
        await tx.payment.create({
          data: {
            businessId,
            amount: paid,
            paymentMethod: parsed.data.paymentMethod,
            reference: parsed.data.invoiceNumber,
            status: "Completed",
          },
        });
      }

      const updatedSupplier = await tx.supplier.update({
        where: { id: supplier.id },
        data: {
          totalPurchases: { increment: total },
          balance: { increment: due },
          status: due > 0 ? "Owes" : undefined,
        },
      });

      await tx.auditLog.create({
        data: {
          businessId,
          userId: user?.id,
          action: "Purchase completed",
          entity: "Purchase",
          entityId: purchase.id,
          details: `${parsed.data.invoiceNumber} total ${total} paid ${paid} supplier ${updatedSupplier.name}`,
        },
      });

      return {
        id: purchase.id,
        invoice: purchase.invoiceNumber,
        supplierId: supplier.id,
        supplier: updatedSupplier.name,
        description: purchase.notes ?? "Stock purchase",
        date: purchase.purchaseDate.toISOString(),
        itemsCount: parsed.data.items.length,
        totalAmount: total,
        paidAmount: paid,
        balanceDue: due,
        paymentMethod: purchase.paymentMethod,
        status,
      };
    });

    return NextResponse.json({ data: result, message: "Purchase saved." }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A purchase with this invoice number already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save purchase." }, { status: 400 });
  }
}
