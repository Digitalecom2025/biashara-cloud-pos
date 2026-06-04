import { NextResponse } from "next/server";
import { expenseData, type ExpenseInput } from "@/lib/expense-validation";
import { getDemoBusinessId } from "@/lib/db-data";
import { getExpensesForPage, mapExpenseForPage } from "@/lib/finance-data";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const expenses = await getExpensesForPage();
  return NextResponse.json({ data: expenses });
}

export async function POST(request: Request) {
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const body = (await request.json()) as ExpenseInput;
  const parsed = expenseData(body);
  if (parsed.errors) return NextResponse.json({ error: parsed.errors.join(" ") }, { status: 400 });

  try {
    const expense = await prisma.$transaction(async (tx) => {
      if (parsed.data.branchId) {
        const branch = await tx.branch.findFirst({ where: { id: parsed.data.branchId, businessId } });
        if (!branch) throw new Error("Selected branch was not found.");
      }

      const created = await tx.expense.create({
        data: {
          businessId,
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
          action: "Expense recorded",
          entity: "Expense",
          entityId: created.id,
          details: `${created.category} expense ${created.description} amount ${created.amount} via ${created.paymentMethod}`,
        },
      });

      return created;
    });

    return NextResponse.json({ data: mapExpenseForPage(expense), message: "Expense created." }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create expense." }, { status: 400 });
  }
}
