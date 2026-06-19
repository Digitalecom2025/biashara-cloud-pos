import { bankRecords as mockBankRecords, incomeRecords as mockIncomeRecords, mpesaRecords as mockMpesaRecords, paymentTypes as mockPaymentTypes, tillSummaries as mockTillSummaries } from "@/lib/finance-mock-data";
import type { ExpenseRecord, LedgerRecord, PaymentType, TillSummary } from "@/lib/finance-mock-data";
import { getBusinessContext, getDemoBusinessId } from "@/lib/db-data";
import { prisma } from "@/lib/prisma";

export type FinanceSummary = {
  totalIncome: number;
  totalExpenses: number;
  cashBalance: number;
  mpesaBalance: number;
  bankBalance: number;
  creditDebtTotal: number;
  profitEstimate: number;
};

export type FinanceData = {
  summary: FinanceSummary;
  tillSummaries: TillSummary[];
  mpesaRecords: LedgerRecord[];
  bankRecords: LedgerRecord[];
  expenses: ExpenseRecord[];
  incomeRecords: LedgerRecord[];
};

export type StoredPaymentType = PaymentType & {
  code: string;
};

export type TaxSettings = {
  vatEnabled: boolean;
  vatRate: number;
  mode: "inclusive" | "exclusive";
  invoicePrefix: string;
  etimsStatus: string;
  businessPin: string;
};

export const defaultPaymentTypes: StoredPaymentType[] = [
  { id: "cash", code: "cash", name: "Cash", description: "Till drawer and counter cash payments", transactions: 0, totalCollected: 0, status: "Active" },
  { id: "mpesa", code: "mpesa", name: "M-Pesa", description: "Mobile money paybill and till payments", transactions: 0, totalCollected: 0, status: "Active" },
  { id: "bank", code: "bank", name: "Bank", description: "Bank deposits and direct transfers", transactions: 0, totalCollected: 0, status: "Active" },
  { id: "card", code: "card", name: "Card", description: "Debit and credit card terminal receipts", transactions: 0, totalCollected: 0, status: "Inactive" },
  { id: "credit", code: "credit", name: "Credit / Debt", description: "Customer balances payable after sale", transactions: 0, totalCollected: 0, status: "Active" },
];

const expenseInactiveStatuses = ["Cancelled", "cancelled", "inactive", "Inactive"];

function moneyNumber(value: unknown) {
  return Number(value ?? 0);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function normalizePaymentCode(value: string) {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]+/g, "");
  if (normalized.includes("mpesa")) return "mpesa";
  if (normalized.includes("bank")) return "bank";
  if (normalized.includes("card")) return "card";
  if (normalized.includes("credit") || normalized.includes("debt")) return "credit";
  if (normalized.includes("cash")) return "cash";
  return normalized || "other";
}

export function mapExpenseForPage(expense: {
  id: string;
  category: string;
  description: string;
  amount: unknown;
  paymentMethod: string;
  recordedBy: string;
  status: string;
  createdAt: Date;
  branch?: { name: string } | null;
  branchId?: string | null;
}): ExpenseRecord {
  return {
    id: expense.id,
    category: expense.category,
    description: expense.description,
    amount: moneyNumber(expense.amount),
    paymentMethod: expense.paymentMethod,
    branchId: expense.branchId ?? undefined,
    branch: expense.branch?.name ?? "All branches",
    recordedBy: expense.recordedBy,
    date: formatDate(expense.createdAt),
    status: expense.status as ExpenseRecord["status"],
  };
}

export async function getExpensesForPage() {
  const businessId = await getDemoBusinessId();
  if (!businessId) return [];

  const expenses = await prisma.expense.findMany({
    where: { businessId, status: { notIn: expenseInactiveStatuses } },
    include: { branch: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return expenses.map(mapExpenseForPage);
}

async function loadFinanceRows(businessId: string) {
  const [sales, payments, expenses] = await Promise.all([
    prisma.sale.findMany({
      where: { businessId },
      include: { branch: true, cashier: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.payment.findMany({
      where: { businessId, status: { notIn: ["Failed", "failed", "Cancelled", "cancelled"] } },
      include: { sale: { include: { branch: true, cashier: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.expense.findMany({
      where: { businessId, status: { notIn: expenseInactiveStatuses } },
      include: { branch: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return { sales, payments, expenses };
}

export async function getFinanceSummaryData(): Promise<FinanceData> {
  const context = await getBusinessContext();
  const businessId = context.businessId;
  if (!businessId) {
    return {
      summary: {
        totalIncome: context.isDemo ? mockIncomeRecords.reduce((sum, item) => sum + item.amount, 0) : 0,
        totalExpenses: 0,
        cashBalance: context.isDemo ? mockTillSummaries.reduce((sum, item) => sum + item.expectedCash, 0) : 0,
        mpesaBalance: context.isDemo ? mockMpesaRecords.reduce((sum, item) => sum + item.amount, 0) : 0,
        bankBalance: context.isDemo ? mockBankRecords.reduce((sum, item) => sum + item.amount, 0) : 0,
        creditDebtTotal: 0,
        profitEstimate: 0,
      },
      tillSummaries: context.isDemo ? mockTillSummaries : [],
      mpesaRecords: context.isDemo ? mockMpesaRecords : [],
      bankRecords: context.isDemo ? mockBankRecords : [],
      expenses: [],
      incomeRecords: context.isDemo ? mockIncomeRecords : [],
    };
  }

  const { sales, payments, expenses } = await loadFinanceRows(businessId);
  const expenseRows = expenses.map(mapExpenseForPage);
  const approvedExpenses = expenses.filter((expense) => expense.status !== "Rejected");
  const totalIncome = sales.reduce((sum, sale) => sum + moneyNumber(sale.total), 0);
  const totalExpenses = approvedExpenses.reduce((sum, expense) => sum + moneyNumber(expense.amount), 0);
  const creditDebtTotal = sales.reduce((sum, sale) => sum + moneyNumber(sale.due), 0);
  const cashBalance = payments.filter((payment) => normalizePaymentCode(payment.paymentMethod) === "cash").reduce((sum, payment) => sum + moneyNumber(payment.amount), 0);
  const mpesaBalance = payments.filter((payment) => normalizePaymentCode(payment.paymentMethod) === "mpesa").reduce((sum, payment) => sum + moneyNumber(payment.amount), 0);
  const bankBalance = payments.filter((payment) => normalizePaymentCode(payment.paymentMethod) === "bank").reduce((sum, payment) => sum + moneyNumber(payment.amount), 0);
  const cashExpenses = approvedExpenses.filter((expense) => normalizePaymentCode(expense.paymentMethod) === "cash").reduce((sum, expense) => sum + moneyNumber(expense.amount), 0);

  const paymentLedgers: LedgerRecord[] = payments.map((payment) => ({
    id: payment.id,
    reference: payment.reference ?? payment.sale?.invoiceNumber ?? "N/A",
    description: payment.sale ? `${payment.paymentMethod} sale ${payment.sale.invoiceNumber}` : `${payment.paymentMethod} collection`,
    amount: moneyNumber(payment.amount),
    branch: payment.sale?.branch.name ?? "Business account",
    recordedBy: payment.sale?.cashier.name ?? "System",
    date: formatDate(payment.createdAt),
    status: payment.status as LedgerRecord["status"],
  }));

  const incomeRecords: LedgerRecord[] = sales.map((sale) => ({
    id: sale.id,
    reference: sale.invoiceNumber,
    description: `${sale.paymentMethod} sale`,
    amount: moneyNumber(sale.total),
    branch: sale.branch.name,
    recordedBy: sale.cashier.name,
    date: formatDate(sale.createdAt),
    status: sale.due.toString() === "0" ? "Completed" : "Pending",
  }));

  const tillSummaries: TillSummary[] = cashBalance || cashExpenses ? [{
    id: "till-db-01",
    till: "Main till",
    branch: payments[0]?.sale?.branch.name ?? "Main Branch",
    cashier: payments[0]?.sale?.cashier.name ?? "Owner",
    openingFloat: 0,
    cashSales: cashBalance,
    cashExpenses,
    expectedCash: cashBalance - cashExpenses,
    status: "Open",
  }] : [];

  return {
    summary: {
      totalIncome,
      totalExpenses,
      cashBalance,
      mpesaBalance,
      bankBalance,
      creditDebtTotal,
      profitEstimate: totalIncome - totalExpenses,
    },
    tillSummaries,
    mpesaRecords: paymentLedgers.filter((record) => normalizePaymentCode(record.description) === "mpesa"),
    bankRecords: paymentLedgers.filter((record) => normalizePaymentCode(record.description) === "bank"),
    expenses: expenseRows,
    incomeRecords,
  };
}

export async function getPaymentTypesForPage() {
  const context = await getBusinessContext();
  const businessId = context.businessId;
  if (!businessId) return context.isDemo ? mockPaymentTypes.map((item) => ({ ...item, code: item.id })) : [];

  const [settings, payments, sales] = await Promise.all([
    prisma.setting.findMany({ where: { businessId, key: { startsWith: "paymentType." } } }),
    prisma.payment.findMany({ where: { businessId, status: { notIn: ["Failed", "failed", "Cancelled", "cancelled"] } } }),
    prisma.sale.findMany({ where: { businessId } }),
  ]);
  const stored = new Map<string, Partial<StoredPaymentType>>();

  for (const setting of settings) {
    try {
      const value = JSON.parse(setting.value) as Partial<StoredPaymentType>;
      if (value.code) stored.set(value.code, value);
    } catch {
      // Ignore invalid legacy setting values.
    }
  }

  const allCodes = new Set([...defaultPaymentTypes.map((item) => item.code), ...stored.keys()]);

  return Array.from(allCodes).map((code) => {
    const base = defaultPaymentTypes.find((item) => item.code === code) ?? {
      id: code,
      code,
      name: code,
      description: "",
      transactions: 0,
      totalCollected: 0,
      status: "Active" as const,
    };
    const configured = stored.get(code);
    const matchingPayments = payments.filter((payment) => normalizePaymentCode(payment.paymentMethod) === code);
    const creditSales = code === "credit" ? sales.filter((sale) => moneyNumber(sale.due) > 0) : [];

    return {
      ...base,
      ...configured,
      id: code,
      code,
      transactions: matchingPayments.length + creditSales.length,
      totalCollected: matchingPayments.reduce((sum, payment) => sum + moneyNumber(payment.amount), 0) + creditSales.reduce((sum, sale) => sum + moneyNumber(sale.due), 0),
      status: configured?.status ?? base.status,
    } satisfies StoredPaymentType;
  });
}

export const defaultTaxSettings: TaxSettings = {
  vatEnabled: true,
  vatRate: 16,
  mode: "inclusive",
  invoicePrefix: "TAX-INV-",
  etimsStatus: "Not connected",
  businessPin: "",
};

export async function getTaxSettingsForPage() {
  const businessId = await getDemoBusinessId();
  if (!businessId) return defaultTaxSettings;

  const settings = await prisma.setting.findMany({
    where: {
      businessId,
      key: {
        in: ["tax.vatEnabled", "tax.vatRate", "tax.mode", "tax.invoicePrefix", "tax.etimsStatus", "tax.businessPin"],
      },
    },
  });
  const values = new Map(settings.map((setting) => [setting.key, setting.value]));

  return {
    vatEnabled: values.get("tax.vatEnabled") === undefined ? defaultTaxSettings.vatEnabled : values.get("tax.vatEnabled") === "true",
    vatRate: Number(values.get("tax.vatRate") ?? defaultTaxSettings.vatRate),
    mode: values.get("tax.mode") === "exclusive" ? "exclusive" : "inclusive",
    invoicePrefix: values.get("tax.invoicePrefix") ?? defaultTaxSettings.invoicePrefix,
    etimsStatus: values.get("tax.etimsStatus") ?? defaultTaxSettings.etimsStatus,
    businessPin: values.get("tax.businessPin") ?? defaultTaxSettings.businessPin,
  } satisfies TaxSettings;
}
