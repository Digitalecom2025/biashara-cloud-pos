import { NextResponse } from "next/server";
import { expenseData } from "@/lib/expense-validation";
import { getDemoBusinessId } from "@/lib/db-data";
import { mapExpenseForPage } from "@/lib/finance-data";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const parsed = expenseData(await request.json());
  if (parsed.errors) return NextResponse.json({ error: parsed.errors.join(" ") }, { status: 400 });

  const existing = await prisma.expense.findFirst({ where: { id, businessId } });
  if (!existing) return NextResponse.json({ error: "Expense not found." }, { status: 404 });

  try {
    const expense = await prisma.$transaction(async (tx) => {
      if (parsed.data.branchId) {
        const branch = await tx.branch.findFirst({ where: { id: parsed.data.branchId, businessId } });
        if (!branch) throw new Error("Selected branch was not found.");
      }

      const updated = await tx.expense.update({
        where: { id },
        data: {
          branchId: parsed.data.branchId,
          category: parsed.data.category,
          description: parsed.data.description,
          amount: parsed.data.amount,
          paymentMethod: parsed.data.paymentMethod,
          recordedBy: parsed.data.recordedBy,
          status: parsed.data.status,
          createdAt: parsed.data.date,
        },
        include: { branch: true },
      });

      await tx.auditLog.create({
        data: {
          businessId,
          action: "Expense updated",
          entity: "Expense",
          entityId: updated.id,
          details: `${updated.category} expense updated to ${updated.amount} via ${updated.paymentMethod}`,
        },
      });

      return updated;
    });

    return NextResponse.json({ data: mapExpenseForPage(expense), message: "Expense updated." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update expense." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const existing = await prisma.expense.findFirst({ where: { id, businessId } });
  if (!existing) return NextResponse.json({ error: "Expense not found." }, { status: 404 });

  try {
    const expense = await prisma.$transaction(async (tx) => {
      const cancelled = await tx.expense.update({
        where: { id },
        data: { status: "Cancelled" },
        include: { branch: true },
      });

      await tx.auditLog.create({
        data: {
          businessId,
          action: "Expense cancelled",
          entity: "Expense",
          entityId: cancelled.id,
          details: `${cancelled.category} expense ${cancelled.description} was cancelled`,
        },
      });

      return cancelled;
    });

    return NextResponse.json({ data: mapExpenseForPage(expense), message: "Expense cancelled." });
  } catch {
    return NextResponse.json({ error: "Failed to cancel expense." }, { status: 500 });
  }
}
