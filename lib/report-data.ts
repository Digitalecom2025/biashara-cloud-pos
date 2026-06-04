import { getDemoBusinessId } from "@/lib/db-data";
import { prisma } from "@/lib/prisma";

export type ReportSummary = {
  todaySales: number;
  monthlySales: number;
  grossProfitEstimate: number;
  stockValue: number;
  totalExpenses: number;
  totalDebtors: number;
  totalPurchases: number;
  cashTotal: number;
  mpesaTotal: number;
  bankTotal: number;
  cardTotal: number;
};

export type ReportTable = {
  columns: string[];
  rows: Record<string, string | number>[];
};

export type PartySummary = {
  totalCustomerBalances: number;
  totalSupplierBalances: number;
  overdueCustomers: number;
  supplierPendingPayments: number;
  totalCustomerPurchases: number;
  totalSupplierPurchases: number;
};

const inactiveStatuses = ["inactive", "Inactive", "Cancelled", "cancelled"];

function amount(value: unknown) {
  return Number(value ?? 0);
}

function formatDate(value?: Date | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(value);
}

function paymentCode(method: string) {
  const normalized = method.toLowerCase().replace(/[^a-z0-9]+/g, "");
  if (normalized.includes("mpesa")) return "mpesa";
  if (normalized.includes("bank")) return "bank";
  if (normalized.includes("card")) return "card";
  if (normalized.includes("cash")) return "cash";
  if (normalized.includes("credit") || normalized.includes("debt")) return "credit";
  return normalized;
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfMonth() {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function getReportsSummary(): Promise<ReportSummary> {
  const businessId = await getDemoBusinessId();
  if (!businessId) {
    return { todaySales: 0, monthlySales: 0, grossProfitEstimate: 0, stockValue: 0, totalExpenses: 0, totalDebtors: 0, totalPurchases: 0, cashTotal: 0, mpesaTotal: 0, bankTotal: 0, cardTotal: 0 };
  }

  const [sales, saleItems, products, expenses, customers, purchases, payments] = await Promise.all([
    prisma.sale.findMany({ where: { businessId } }),
    prisma.saleItem.findMany({ where: { sale: { businessId } }, include: { product: true } }),
    prisma.product.findMany({ where: { businessId, status: { notIn: inactiveStatuses } } }),
    prisma.expense.findMany({ where: { businessId, status: { notIn: inactiveStatuses } } }),
    prisma.customer.findMany({ where: { businessId, status: { notIn: inactiveStatuses } } }),
    prisma.purchase.findMany({ where: { businessId } }),
    prisma.payment.findMany({ where: { businessId, status: { notIn: ["Failed", "failed", "Cancelled", "cancelled"] } } }),
  ]);

  const today = startOfToday();
  const month = startOfMonth();
  const totalSales = (from: Date) => sales.filter((sale) => sale.createdAt >= from).reduce((sum, sale) => sum + amount(sale.total), 0);
  const grossProfitEstimate = saleItems.reduce((sum, item) => {
    const salesTotal = amount(item.total);
    const estimatedCost = item.quantity * amount(item.product.purchasePrice);
    return sum + salesTotal - estimatedCost;
  }, 0);

  return {
    todaySales: totalSales(today),
    monthlySales: totalSales(month),
    grossProfitEstimate,
    stockValue: products.reduce((sum, product) => sum + product.stock * amount(product.purchasePrice), 0),
    totalExpenses: expenses.filter((expense) => expense.status !== "Rejected").reduce((sum, expense) => sum + amount(expense.amount), 0),
    totalDebtors: customers.reduce((sum, customer) => sum + amount(customer.debtBalance), 0),
    totalPurchases: purchases.reduce((sum, purchase) => sum + amount(purchase.total), 0),
    cashTotal: payments.filter((payment) => paymentCode(payment.paymentMethod) === "cash").reduce((sum, payment) => sum + amount(payment.amount), 0),
    mpesaTotal: payments.filter((payment) => paymentCode(payment.paymentMethod) === "mpesa").reduce((sum, payment) => sum + amount(payment.amount), 0),
    bankTotal: payments.filter((payment) => paymentCode(payment.paymentMethod) === "bank").reduce((sum, payment) => sum + amount(payment.amount), 0),
    cardTotal: payments.filter((payment) => paymentCode(payment.paymentMethod) === "card").reduce((sum, payment) => sum + amount(payment.amount), 0),
  };
}

export async function getSalesReport(): Promise<ReportTable> {
  const businessId = await getDemoBusinessId();
  if (!businessId) return { columns: [], rows: [] };
  const sales = await prisma.sale.findMany({
    where: { businessId },
    include: { customer: true, branch: true, cashier: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return {
    columns: ["Date", "Invoice number", "Customer", "Branch", "Cashier", "Payment method", "Total", "Paid", "Due", "Status"],
    rows: sales.map((sale) => ({
      Date: formatDate(sale.createdAt),
      "Invoice number": sale.invoiceNumber,
      Customer: sale.customer?.name ?? "Walk-in Customer",
      Branch: sale.branch.name,
      Cashier: sale.cashier.name,
      "Payment method": sale.paymentMethod,
      Total: amount(sale.total),
      Paid: amount(sale.paid),
      Due: amount(sale.due),
      Status: amount(sale.due) === 0 ? "Paid" : amount(sale.paid) > 0 ? "Partial" : "Due",
    })),
  };
}

export async function getProductSalesReport(): Promise<ReportTable> {
  const businessId = await getDemoBusinessId();
  if (!businessId) return { columns: [], rows: [] };
  const items = await prisma.saleItem.findMany({
    where: { sale: { businessId } },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
  const groups = new Map<string, { product: string; quantity: number; sales: number; cost: number; stock: number }>();
  for (const item of items) {
    const current = groups.get(item.productId) ?? { product: item.product.name, quantity: 0, sales: 0, cost: 0, stock: item.product.stock };
    current.quantity += item.quantity;
    current.sales += amount(item.total);
    current.cost += item.quantity * amount(item.product.purchasePrice);
    current.stock = item.product.stock;
    groups.set(item.productId, current);
  }
  return {
    columns: ["Product", "Quantity sold", "Sales total", "Estimated cost", "Estimated profit", "Stock remaining"],
    rows: Array.from(groups.values()).map((row) => ({
      Product: row.product,
      "Quantity sold": row.quantity,
      "Sales total": row.sales,
      "Estimated cost": row.cost,
      "Estimated profit": row.sales - row.cost,
      "Stock remaining": row.stock,
    })),
  };
}

export async function getStockReport(): Promise<ReportTable> {
  const businessId = await getDemoBusinessId();
  if (!businessId) return { columns: [], rows: [] };
  const products = await prisma.product.findMany({ where: { businessId, status: { notIn: inactiveStatuses } }, orderBy: { name: "asc" } });
  return {
    columns: ["Product", "Category", "Warehouse", "Stock", "Reorder level", "Stock value", "Status"],
    rows: products.map((product) => ({
      Product: product.name,
      Category: product.category,
      Warehouse: product.warehouse,
      Stock: product.stock,
      "Reorder level": product.reorderLevel,
      "Stock value": product.stock * amount(product.purchasePrice),
      Status: product.stock <= 0 ? "Out of Stock" : product.stock <= product.reorderLevel ? "Low Stock" : "Healthy",
    })),
  };
}

export async function getPurchaseReport(): Promise<ReportTable> {
  const businessId = await getDemoBusinessId();
  if (!businessId) return { columns: [], rows: [] };
  const purchases = await prisma.purchase.findMany({ where: { businessId }, include: { supplier: true }, orderBy: { purchaseDate: "desc" }, take: 200 });
  return {
    columns: ["Invoice", "Supplier", "Total", "Paid", "Balance", "Status", "Date"],
    rows: purchases.map((purchase) => ({
      Invoice: purchase.invoiceNumber,
      Supplier: purchase.supplier.name,
      Total: amount(purchase.total),
      Paid: amount(purchase.paid),
      Balance: amount(purchase.due),
      Status: purchase.status,
      Date: formatDate(purchase.purchaseDate),
    })),
  };
}

export async function getExpenseReport(): Promise<ReportTable> {
  const businessId = await getDemoBusinessId();
  if (!businessId) return { columns: [], rows: [] };
  const expenses = await prisma.expense.findMany({ where: { businessId, status: { notIn: inactiveStatuses } }, include: { branch: true }, orderBy: { createdAt: "desc" }, take: 200 });
  return {
    columns: ["Date", "Category", "Description", "Amount", "Payment method", "Branch", "Recorded by", "Status"],
    rows: expenses.map((expense) => ({
      Date: formatDate(expense.createdAt),
      Category: expense.category,
      Description: expense.description,
      Amount: amount(expense.amount),
      "Payment method": expense.paymentMethod,
      Branch: expense.branch?.name ?? "All branches",
      "Recorded by": expense.recordedBy,
      Status: expense.status,
    })),
  };
}

export async function getPaymentMethodReport(): Promise<ReportTable> {
  const businessId = await getDemoBusinessId();
  if (!businessId) return { columns: [], rows: [] };
  const payments = await prisma.payment.findMany({ where: { businessId }, orderBy: { createdAt: "desc" } });
  const groups = new Map<string, { count: number; total: number; last?: Date }>();
  for (const payment of payments) {
    const current = groups.get(payment.paymentMethod) ?? { count: 0, total: 0, last: payment.createdAt };
    current.count += 1;
    current.total += amount(payment.amount);
    if (!current.last || payment.createdAt > current.last) current.last = payment.createdAt;
    groups.set(payment.paymentMethod, current);
  }
  return {
    columns: ["Payment method", "Transaction count", "Total collected", "Last payment date"],
    rows: Array.from(groups.entries()).map(([method, row]) => ({
      "Payment method": method,
      "Transaction count": row.count,
      "Total collected": row.total,
      "Last payment date": formatDate(row.last),
    })),
  };
}

export async function getCashierReport(): Promise<ReportTable> {
  const businessId = await getDemoBusinessId();
  if (!businessId) return { columns: [], rows: [] };
  const sales = await prisma.sale.findMany({ where: { businessId }, include: { cashier: true } });
  const groups = new Map<string, { count: number; total: number; cash: number; mpesa: number; credit: number }>();
  for (const sale of sales) {
    const current = groups.get(sale.cashier.name) ?? { count: 0, total: 0, cash: 0, mpesa: 0, credit: 0 };
    current.count += 1;
    current.total += amount(sale.total);
    if (paymentCode(sale.paymentMethod) === "cash") current.cash += amount(sale.total);
    if (paymentCode(sale.paymentMethod) === "mpesa") current.mpesa += amount(sale.total);
    current.credit += amount(sale.due);
    groups.set(sale.cashier.name, current);
  }
  return {
    columns: ["Cashier", "Sales count", "Total sales", "Cash total", "M-Pesa total", "Credit due"],
    rows: Array.from(groups.entries()).map(([cashier, row]) => ({
      Cashier: cashier,
      "Sales count": row.count,
      "Total sales": row.total,
      "Cash total": row.cash,
      "M-Pesa total": row.mpesa,
      "Credit due": row.credit,
    })),
  };
}

export async function getBranchReport(): Promise<ReportTable> {
  const businessId = await getDemoBusinessId();
  if (!businessId) return { columns: [], rows: [] };
  const branches = await prisma.branch.findMany({ where: { businessId, status: { notIn: inactiveStatuses } }, include: { sales: true, expenses: true, products: true, users: true }, orderBy: { name: "asc" } });
  return {
    columns: ["Branch", "Sales total", "Expenses", "Stock value", "Users assigned"],
    rows: branches.map((branch) => ({
      Branch: branch.name,
      "Sales total": branch.sales.reduce((sum, sale) => sum + amount(sale.total), 0),
      Expenses: branch.expenses.filter((expense) => !inactiveStatuses.includes(expense.status)).reduce((sum, expense) => sum + amount(expense.amount), 0),
      "Stock value": branch.products.reduce((sum, product) => sum + product.stock * amount(product.purchasePrice), 0),
      "Users assigned": branch.users.length,
    })),
  };
}

export async function getPartyReports() {
  const businessId = await getDemoBusinessId();
  if (!businessId) return { summary: { totalCustomerBalances: 0, totalSupplierBalances: 0, overdueCustomers: 0, supplierPendingPayments: 0, totalCustomerPurchases: 0, totalSupplierPurchases: 0 }, rows: [] };

  const [customers, suppliers] = await Promise.all([
    prisma.customer.findMany({ where: { businessId, status: { notIn: inactiveStatuses } }, include: { sales: true, payments: true }, orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ where: { businessId, status: { notIn: inactiveStatuses } }, include: { purchases: true }, orderBy: { name: "asc" } }),
  ]);

  const customerRows = customers.map((customer) => {
    const totalAmount = amount(customer.totalPurchases) || customer.sales.reduce((sum, sale) => sum + amount(sale.total), 0);
    const paidAmount = customer.payments.reduce((sum, payment) => sum + amount(payment.amount), 0) + customer.sales.reduce((sum, sale) => sum + amount(sale.paid), 0);
    const lastSale = customer.sales.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    const balance = amount(customer.debtBalance);
    return {
      id: customer.id,
      name: customer.name,
      type: "Customer" as const,
      phone: customer.phone,
      transactions: customer.sales.length + customer.payments.length,
      totalAmount,
      paidAmount,
      balance,
      lastTransaction: formatDate(lastSale?.createdAt ?? customer.updatedAt),
      status: customer.status === "Overdue" ? "Overdue" : balance > 0 ? "Owes" : "Clear",
    };
  });

  const supplierRows = suppliers.map((supplier) => {
    const totalAmount = amount(supplier.totalPurchases) || supplier.purchases.reduce((sum, purchase) => sum + amount(purchase.total), 0);
    const paidAmount = supplier.purchases.reduce((sum, purchase) => sum + amount(purchase.paid), 0);
    const lastPurchase = supplier.purchases.sort((a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime())[0];
    const balance = amount(supplier.balance);
    return {
      id: supplier.id,
      name: supplier.name,
      type: "Supplier" as const,
      phone: supplier.phone,
      transactions: supplier.purchases.length,
      totalAmount,
      paidAmount,
      balance,
      lastTransaction: formatDate(lastPurchase?.purchaseDate ?? supplier.updatedAt),
      status: balance > 0 ? "Owes" : "Clear",
    };
  });

  const rows = [...customerRows, ...supplierRows];
  return {
    summary: {
      totalCustomerBalances: customerRows.reduce((sum, row) => sum + row.balance, 0),
      totalSupplierBalances: supplierRows.reduce((sum, row) => sum + row.balance, 0),
      overdueCustomers: customerRows.filter((row) => row.status === "Overdue").length,
      supplierPendingPayments: supplierRows.filter((row) => row.balance > 0).length,
      totalCustomerPurchases: customerRows.reduce((sum, row) => sum + row.totalAmount, 0),
      totalSupplierPurchases: supplierRows.reduce((sum, row) => sum + row.totalAmount, 0),
    },
    rows,
  };
}

export async function getPartyDetail(id: string) {
  const businessId = await getDemoBusinessId();
  if (!businessId) return null;

  const customer = await prisma.customer.findFirst({
    where: { id, businessId },
    include: { sales: { include: { payments: true }, orderBy: { createdAt: "desc" } }, payments: { orderBy: { createdAt: "desc" } } },
  });
  if (customer) {
    return {
      id: customer.id,
      name: customer.name,
      type: "Customer",
      balance: amount(customer.debtBalance),
      rows: [
        ...customer.sales.map((sale) => ({ Date: formatDate(sale.createdAt), Reference: sale.invoiceNumber, Type: "Sale", Total: amount(sale.total), Paid: amount(sale.paid), Balance: amount(sale.due), Status: sale.status })),
        ...customer.payments.map((payment) => ({ Date: formatDate(payment.createdAt), Reference: payment.reference ?? payment.id, Type: "Payment", Total: amount(payment.amount), Paid: amount(payment.amount), Balance: 0, Status: payment.status })),
      ],
    };
  }

  const supplier = await prisma.supplier.findFirst({ where: { id, businessId }, include: { purchases: { orderBy: { purchaseDate: "desc" } } } });
  if (!supplier) return null;
  return {
    id: supplier.id,
    name: supplier.name,
    type: "Supplier",
    balance: amount(supplier.balance),
    rows: supplier.purchases.map((purchase) => ({ Date: formatDate(purchase.purchaseDate), Reference: purchase.invoiceNumber, Type: "Purchase", Total: amount(purchase.total), Paid: amount(purchase.paid), Balance: amount(purchase.due), Status: purchase.status })),
  };
}
