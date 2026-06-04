import { NextResponse } from "next/server";
import { getDemoBusinessId, getRecentSalesForPage } from "@/lib/db-data";
import { saleData, type SaleInput } from "@/lib/sale-validation";
import { prisma } from "@/lib/prisma";

type SaleResponseClient = {
  sale: {
    findUnique: typeof prisma.sale.findUnique;
  };
};

function invoiceNumber() {
  const stamp = Date.now().toString().slice(-8);
  return `INV-${stamp}`;
}

async function formatSaleResponse(saleId: string, tx: SaleResponseClient) {
  const saleWithDetails = await tx.sale.findUnique({
    where: { id: saleId },
    include: {
      customer: true,
      cashier: true,
      branch: true,
      items: { include: { product: true } },
    },
  });
  if (!saleWithDetails) throw new Error("Sale could not be loaded after saving.");

  return {
    id: saleWithDetails.id,
    invoice: saleWithDetails.invoiceNumber,
    customer: saleWithDetails.customer?.name ?? "Walk-in Customer",
    payment: saleWithDetails.paymentMethod,
    total: Number(saleWithDetails.total),
    paid: Number(saleWithDetails.paid),
    due: Number(saleWithDetails.due),
    cashier: saleWithDetails.cashier.name,
    branch: saleWithDetails.branch.name,
    date: saleWithDetails.createdAt.toISOString(),
    status: Number(saleWithDetails.due) === 0 ? "Paid" : Number(saleWithDetails.paid) > 0 ? "Partial" : "Due",
    items: saleWithDetails.items.map((item) => ({
      id: item.productId,
      name: item.product.name,
      code: item.product.code,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      total: Number(item.total),
    })),
  };
}

export async function GET() {
  const sales = await getRecentSalesForPage();
  return NextResponse.json({ data: sales });
}

export async function POST(request: Request) {
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const body = (await request.json()) as SaleInput;
  const parsed = saleData(body);
  if (parsed.errors) return NextResponse.json({ error: parsed.errors.join(" ") }, { status: 400 });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const offlineSyncId = parsed.data.offlineSyncId;
      if (offlineSyncId) {
        const existing = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "Sale" WHERE "offlineSyncId" = ${offlineSyncId} LIMIT 1`;
        if (existing[0]?.id) {
          return formatSaleResponse(existing[0].id, tx);
        }
      }

      const branch = await tx.branch.findFirst({ where: { businessId, name: "Nairobi CBD Store" } }) ?? await tx.branch.findFirst({ where: { businessId } });
      if (!branch) throw new Error("No branch found for this business.");

      const cashier = await tx.user.findFirst({ where: { businessId, role: "Cashier" } }) ?? await tx.user.findFirst({ where: { businessId } });
      if (!cashier) throw new Error("No cashier user found for this business.");

      const customer = parsed.data.customerId
        ? await tx.customer.findFirst({ where: { id: parsed.data.customerId, businessId, status: { notIn: ["inactive", "Inactive"] } } })
        : null;
      if (parsed.data.customerId && !customer) throw new Error("Selected customer was not found.");

      const isCredit = parsed.data.paymentMethod === "Credit / Debt";
      if (isCredit && (!customer || customer.name.toLowerCase().includes("walk-in"))) {
        throw new Error("A named customer is required for Credit / Debt sales.");
      }

      const productIds = parsed.data.items.map((item) => item.productId);
      const products = await tx.product.findMany({ where: { businessId, id: { in: productIds }, status: { notIn: ["inactive", "Inactive"] } } });
      if (products.length !== productIds.length) throw new Error("One or more products are unavailable.");

      for (const item of parsed.data.items) {
        const product = products.find((entry) => entry.id === item.productId);
        if (!product) throw new Error("Product not found.");
        if (product.stock < item.quantity) throw new Error(`${product.name} has only ${product.stock} in stock.`);
      }

      const subtotal = parsed.data.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      const tax = 0;
      const discount = Math.min(parsed.data.discount, subtotal);
      const total = Math.max(0, subtotal + tax - discount);
      const paid = isCredit ? 0 : total;
      const due = total - paid;
      const status = due === 0 ? "paid" : paid > 0 ? "partial" : "unpaid";
      const invoice = invoiceNumber();

      const sale = await tx.sale.create({
        data: {
          businessId,
          branchId: branch.id,
          cashierId: cashier.id,
          customerId: customer?.id,
          invoiceNumber: invoice,
          subtotal,
          tax,
          discount,
          total,
          paid,
          due,
          paymentMethod: parsed.data.paymentMethod,
          status,
          saleType: isCredit ? "credit" : "normal",
        },
      });

      await tx.saleItem.createMany({
        data: parsed.data.items.map((item) => ({
          saleId: sale.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),
      });

      for (const item of parsed.data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            businessId,
            branchId: branch.id,
            productId: item.productId,
            type: "sale",
            quantity: -item.quantity,
            reason: "POS sale",
            reference: invoice,
            createdBy: cashier.name,
          },
        });
      }

      if (paid > 0) {
        await tx.payment.create({
          data: {
            businessId,
            saleId: sale.id,
            customerId: customer?.id,
            amount: paid,
            paymentMethod: parsed.data.paymentMethod,
            reference: invoice,
            status: "Completed",
          },
        });
      }

      if (customer) {
        await tx.customer.update({
          where: { id: customer.id },
          data: {
            totalPurchases: { increment: total },
            debtBalance: due > 0 ? { increment: due } : undefined,
            status: due > 0 ? "Owes" : undefined,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          businessId,
          userId: cashier.id,
          action: "Sale completed",
          entity: "Sale",
          entityId: sale.id,
          details: `${invoice} total ${total} paid by ${parsed.data.paymentMethod} cashier ${cashier.name}`,
        },
      });

      if (offlineSyncId) {
        await tx.$executeRaw`
          UPDATE "Sale"
          SET "offlineSyncId" = ${offlineSyncId},
              "deviceId" = ${parsed.data.deviceId},
              "syncedFromOffline" = ${true},
              "syncedAt" = ${new Date()}
          WHERE "id" = ${sale.id}
        `;
      }

      return formatSaleResponse(sale.id, tx);
    });

    return NextResponse.json({ data: result, message: "Sale completed." }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to complete sale." }, { status: 400 });
  }
}
