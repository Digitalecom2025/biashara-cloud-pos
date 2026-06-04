import { getDemoBusinessId } from "@/lib/db-data";
import { prisma } from "@/lib/prisma";

export type AiTone = "green" | "gold" | "red";

export type AiSummaryCardData = {
  title: string;
  insight: string;
  tone: AiTone;
};

export type AiInsightItemData = {
  label: string;
  value: string;
  note: string;
};

export type AiAssistantSummary = {
  lastUpdated: string;
  packagePlan: string;
  metrics: {
    todaySales: number;
    weekSales: number;
    monthSales: number;
    salesTodayCount: number;
    stockValue: number;
    totalDebt: number;
    debtorsCount: number;
    monthExpenses: number;
    activeUsers: number;
    branchCount: number;
    estimatedWeekProfit: number;
  };
  cards: AiSummaryCardData[];
  insights: {
    sales: AiInsightItemData[];
    stock: AiInsightItemData[];
    debtors: AiInsightItemData[];
    expenses: AiInsightItemData[];
    staff: AiInsightItemData[];
    branches: AiInsightItemData[];
  };
  recommendedActions: string[];
  promptResponses: Record<string, string>;
};

const inactiveStatuses = ["inactive", "Inactive", "Cancelled", "cancelled"];

function amount(value: unknown) {
  return Number(value ?? 0);
}

function money(value: number) {
  return `KSh ${new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(value)}`;
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfWeek() {
  const date = startOfToday();
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date;
}

function startOfMonth() {
  const date = startOfToday();
  date.setDate(1);
  return date;
}

function paymentCode(method: string) {
  const normalized = method.toLowerCase().replace(/[^a-z0-9]+/g, "");
  if (normalized.includes("mpesa")) return "M-Pesa";
  if (normalized.includes("bank")) return "Bank";
  if (normalized.includes("card")) return "Card";
  if (normalized.includes("credit") || normalized.includes("debt")) return "Credit / Debt";
  if (normalized.includes("cash")) return "Cash";
  return method || "Unknown";
}

function names(items: { name: string }[], fallback: string, limit = 3) {
  const selected = items.slice(0, limit).map((item) => item.name);
  return selected.length ? selected.join(", ") : fallback;
}

export async function getAiAssistantSummary(): Promise<AiAssistantSummary> {
  const businessId = await getDemoBusinessId();
  const fallback: AiAssistantSummary = {
    lastUpdated: new Date().toISOString(),
    packagePlan: "Business",
    metrics: {
      todaySales: 0,
      weekSales: 0,
      monthSales: 0,
      salesTodayCount: 0,
      stockValue: 0,
      totalDebt: 0,
      debtorsCount: 0,
      monthExpenses: 0,
      activeUsers: 0,
      branchCount: 0,
      estimatedWeekProfit: 0,
    },
    cards: [
      { title: "Today's AI Summary", insight: "No sales data is available yet. Start making sales to unlock live assistant insights.", tone: "gold" },
      { title: "Sales Health", insight: "Sales health will be calculated after transactions are recorded.", tone: "gold" },
      { title: "Stock Risk", insight: "Stock risk will appear after products are available.", tone: "gold" },
      { title: "Debtor Risk", insight: "No debtor data is available yet.", tone: "green" },
      { title: "Expense Warning", insight: "Expense warnings will appear after expenses are recorded.", tone: "gold" },
      { title: "Profit Opportunity", insight: "Profit opportunities will be generated from sales and product costs.", tone: "green" },
    ],
    insights: {
      sales: [],
      stock: [],
      debtors: [],
      expenses: [],
      staff: [],
      branches: [],
    },
    recommendedActions: ["Add products, record sales, and track expenses to unlock useful AI assistant guidance."],
    promptResponses: {},
  };
  if (!businessId) return fallback;

  const today = startOfToday();
  const week = startOfWeek();
  const month = startOfMonth();

  const [business, sales, saleItems, products, customers, expenses, users, branches, stockMovements] = await Promise.all([
    prisma.business.findUnique({ where: { id: businessId } }),
    prisma.sale.findMany({
      where: { businessId },
      include: { cashier: true, branch: true, customer: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.saleItem.findMany({
      where: { sale: { businessId } },
      include: { product: true, sale: true },
    }),
    prisma.product.findMany({ where: { businessId, status: { notIn: inactiveStatuses } } }),
    prisma.customer.findMany({ where: { businessId, status: { notIn: inactiveStatuses } }, orderBy: { debtBalance: "desc" } }),
    prisma.expense.findMany({ where: { businessId, status: { notIn: inactiveStatuses } } }),
    prisma.user.findMany({ where: { businessId, status: { notIn: ["inactive", "Inactive"] } } }),
    prisma.branch.findMany({ where: { businessId, status: { notIn: ["inactive", "Inactive"] } } }),
    prisma.stockMovement.findMany({ where: { businessId, type: { in: ["damage", "adjustment", "correction"] } }, include: { product: true }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  const salesToday = sales.filter((sale) => sale.createdAt >= today);
  const salesThisWeek = sales.filter((sale) => sale.createdAt >= week);
  const salesThisMonth = sales.filter((sale) => sale.createdAt >= month);
  const saleItemsToday = saleItems.filter((item) => item.sale.createdAt >= today);
  const saleItemsThisWeek = saleItems.filter((item) => item.sale.createdAt >= week);
  const expensesThisMonth = expenses.filter((expense) => expense.createdAt >= month && expense.status !== "Rejected");
  const todaySales = salesToday.reduce((sum, sale) => sum + amount(sale.total), 0);
  const weekSales = salesThisWeek.reduce((sum, sale) => sum + amount(sale.total), 0);
  const monthSales = salesThisMonth.reduce((sum, sale) => sum + amount(sale.total), 0);
  const stockValue = products.reduce((sum, product) => sum + product.stock * amount(product.purchasePrice), 0);
  const monthExpenses = expensesThisMonth.reduce((sum, expense) => sum + amount(expense.amount), 0);
  const weekCost = saleItemsThisWeek.reduce((sum, item) => sum + item.quantity * amount(item.product.purchasePrice), 0);
  const estimatedWeekProfit = weekSales - weekCost - monthExpenses;

  const paymentGroups = new Map<string, number>();
  for (const sale of salesToday.length ? salesToday : salesThisMonth.length ? salesThisMonth : sales) {
    const method = paymentCode(sale.paymentMethod);
    paymentGroups.set(method, (paymentGroups.get(method) ?? 0) + amount(sale.total));
  }
  const bestPayment = Array.from(paymentGroups.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "No sales yet";

  const productGroups = new Map<string, { name: string; quantity: number; total: number; stock: number }>();
  for (const item of saleItemsToday.length ? saleItemsToday : saleItemsThisWeek.length ? saleItemsThisWeek : saleItems) {
    const current = productGroups.get(item.productId) ?? { name: item.product.name, quantity: 0, total: 0, stock: item.product.stock };
    current.quantity += item.quantity;
    current.total += amount(item.total);
    current.stock = item.product.stock;
    productGroups.set(item.productId, current);
  }
  const productRanks = Array.from(productGroups.values()).sort((a, b) => b.quantity - a.quantity || b.total - a.total);
  const bestProduct = productRanks[0]?.name ?? "No product sales yet";
  const slowProduct = products.find((product) => !productGroups.has(product.id))?.name ?? productRanks[productRanks.length - 1]?.name ?? "Not enough sales data";
  const fastMovingProducts = productRanks.slice(0, 3).map((item) => ({ name: item.name }));

  const lowStockProducts = products.filter((product) => product.stock > 0 && product.stock <= product.reorderLevel).sort((a, b) => a.stock - b.stock);
  const outOfStockProducts = products.filter((product) => product.stock <= 0);
  const reorderProducts = [...lowStockProducts, ...outOfStockProducts].slice(0, 4);

  const debtors = customers.filter((customer) => amount(customer.debtBalance) > 0);
  const totalDebt = debtors.reduce((sum, customer) => sum + amount(customer.debtBalance), 0);
  const topDebtors = debtors.slice(0, 3).map((customer) => ({ name: customer.name, balance: amount(customer.debtBalance) }));
  const highestDebtor = topDebtors[0];

  const expenseGroups = new Map<string, number>();
  for (const expense of expensesThisMonth) {
    expenseGroups.set(expense.category, (expenseGroups.get(expense.category) ?? 0) + amount(expense.amount));
  }
  const highestExpense = Array.from(expenseGroups.entries()).sort((a, b) => b[1] - a[1])[0];
  const expenseShare = monthSales > 0 ? monthExpenses / monthSales : 0;

  const cashierGroups = new Map<string, { count: number; total: number }>();
  for (const sale of salesToday.length ? salesToday : salesThisMonth.length ? salesThisMonth : sales) {
    const current = cashierGroups.get(sale.cashier.name) ?? { count: 0, total: 0 };
    current.count += 1;
    current.total += amount(sale.total);
    cashierGroups.set(sale.cashier.name, current);
  }
  const topCashier = Array.from(cashierGroups.entries()).sort((a, b) => b[1].total - a[1].total)[0];

  const branchGroups = new Map<string, number>();
  for (const sale of salesThisMonth.length ? salesThisMonth : sales) {
    branchGroups.set(sale.branch.name, (branchGroups.get(sale.branch.name) ?? 0) + amount(sale.total));
  }
  const topBranch = Array.from(branchGroups.entries()).sort((a, b) => b[1] - a[1])[0];
  const damageMovements = stockMovements.filter((movement) => movement.type === "damage" || movement.quantity < 0);

  const stockRiskTone: AiTone = lowStockProducts.length + outOfStockProducts.length > 0 ? "gold" : "green";
  const debtorTone: AiTone = topDebtors.some((debtor) => debtor.balance >= 5000) ? "red" : totalDebt > 0 ? "gold" : "green";
  const expenseTone: AiTone = expenseShare > 0.6 ? "red" : expenseShare > 0.35 ? "gold" : "green";

  const cards: AiSummaryCardData[] = [
    {
      title: "Today's AI Summary",
      insight: salesToday.length
        ? `${money(todaySales)} from ${salesToday.length} sale${salesToday.length === 1 ? "" : "s"} today. ${bestPayment} is currently your strongest payment method.`
        : `No sales have been recorded today. This week's sales are ${money(weekSales)}.`,
      tone: salesToday.length ? "green" : "gold",
    },
    {
      title: "Sales Health",
      insight: bestProduct === "No product sales yet" ? "No product sales data yet. Complete sales to unlock product movement insights." : `${bestProduct} is your strongest-selling product from available sales data.`,
      tone: bestProduct === "No product sales yet" ? "gold" : "green",
    },
    {
      title: "Stock Risk",
      insight: `${lowStockProducts.length} low-stock and ${outOfStockProducts.length} out-of-stock product${lowStockProducts.length + outOfStockProducts.length === 1 ? "" : "s"} need attention.`,
      tone: stockRiskTone,
    },
    {
      title: "Debtor Risk",
      insight: totalDebt > 0 ? `${debtors.length} customer${debtors.length === 1 ? "" : "s"} owe ${money(totalDebt)}. ${highestDebtor ? `${highestDebtor.name} is the largest balance.` : ""}` : "Customer debt is clear based on current records.",
      tone: debtorTone,
    },
    {
      title: "Expense Warning",
      insight: highestExpense ? `${highestExpense[0]} is your highest expense category this month at ${money(highestExpense[1])}.` : "No expense records this month yet.",
      tone: expenseTone,
    },
    {
      title: "Profit Opportunity",
      insight: bestProduct === "No product sales yet" ? "Record more sales to identify promotion opportunities." : `Promote ${bestProduct} and restock fast movers to protect sales momentum.`,
      tone: "green",
    },
  ];

  const recommendedActions = [
    reorderProducts.length ? `Restock ${names(reorderProducts, "low-stock products", 3)} before stock interrupts sales.` : "Stock levels look stable. Keep monitoring reorder levels weekly.",
    highestDebtor ? `Follow up with ${highestDebtor.name} about the outstanding ${money(highestDebtor.balance)} balance.` : "No debtor follow-up is urgent right now.",
    highestExpense ? `Review ${highestExpense[0]} expenses because they are the highest cost category this month.` : "Start recording expenses consistently for stronger cost warnings.",
    bestProduct !== "No product sales yet" ? `Promote ${bestProduct} this week because it leads product sales.` : "Complete more sales to identify a top product to promote.",
    topCashier ? `Review ${topCashier[0]}'s cashier activity and share good selling patterns with the team.` : "Add cashier sales activity to unlock staff performance recommendations.",
    damageMovements.length ? `Review recent damaged/reduced stock movements, especially ${damageMovements[0].product.name}.` : "No recent stock damage warning is visible from stock movements.",
  ];

  const lowStockNames = names(reorderProducts, "No products are currently below reorder level");
  const topDebtorNames = topDebtors.length ? topDebtors.map((debtor) => `${debtor.name} (${money(debtor.balance)})`).join(", ") : "No customers currently owe money";
  const topCashierText = topCashier ? `${topCashier[0]} with ${money(topCashier[1].total)} from ${topCashier[1].count} sale${topCashier[1].count === 1 ? "" : "s"}` : "No cashier sales data is available yet";

  return {
    lastUpdated: new Date().toISOString(),
    packagePlan: business?.packagePlan ?? "Business",
    metrics: {
      todaySales,
      weekSales,
      monthSales,
      salesTodayCount: salesToday.length,
      stockValue,
      totalDebt,
      debtorsCount: debtors.length,
      monthExpenses,
      activeUsers: users.length,
      branchCount: branches.length,
      estimatedWeekProfit,
    },
    cards,
    insights: {
      sales: [
        { label: "Best-selling product", value: bestProduct, note: productRanks[0] ? `${productRanks[0].quantity} units sold in the selected period` : "Waiting for sale item data" },
        { label: "Slow-moving product", value: slowProduct, note: "Based on products with low or no sale activity" },
        { label: "Best payment method", value: bestPayment, note: "Calculated from recent sale payment methods" },
        { label: "Sales trend", value: weekSales > 0 ? money(weekSales) : "No weekly sales", note: `Month-to-date sales: ${money(monthSales)}` },
      ],
      stock: [
        { label: "Low stock products", value: names(lowStockProducts, "None"), note: `${lowStockProducts.length} products below or at reorder level` },
        { label: "Out of stock products", value: names(outOfStockProducts, "None"), note: `${outOfStockProducts.length} products at zero stock` },
        { label: "Fast-moving products", value: names(fastMovingProducts, "Not enough data"), note: "Based on sale item quantity" },
        { label: "Suggested reorder items", value: lowStockNames, note: `Stock value estimate: ${money(stockValue)}` },
      ],
      debtors: [
        { label: "Total amount owed", value: money(totalDebt), note: `${debtors.length} customers with debt balances` },
        { label: "Overdue/high-risk customers", value: topDebtorNames, note: "Ranked by outstanding balance" },
        { label: "Suggested follow-up action", value: highestDebtor ? "Call or SMS today" : "No urgent follow-up", note: highestDebtor ? `Start with ${highestDebtor.name}` : "Debt balances are clear" },
      ],
      expenses: [
        { label: "Highest expense category", value: highestExpense?.[0] ?? "None this month", note: highestExpense ? `${money(highestExpense[1])} recorded this month` : "No monthly expenses recorded" },
        { label: "Expense share warning", value: monthSales > 0 ? `${Math.round(expenseShare * 100)}% of monthly sales` : "No sales comparison yet", note: expenseShare > 0.6 ? "Expenses are taking a large share of sales" : "Monitor expense-to-sales ratio" },
        { label: "Profit leakage warning", value: highestExpense?.[0] ?? "Not enough data", note: "Review high recurring expense categories" },
      ],
      staff: [
        { label: "Top cashier", value: topCashierText, note: "Based on available sales records" },
        { label: "Active users", value: `${users.length} active users`, note: "Users currently enabled for this business" },
        { label: "Shift summary placeholder", value: topBranch ? `${topBranch[0]} leading` : "Not enough branch sales", note: "Shift analytics will improve after more sales" },
      ],
      branches: [
        { label: "Branch count", value: `${branches.length} active branches`, note: "Configured business locations" },
        { label: "Top branch", value: topBranch ? `${topBranch[0]} - ${money(topBranch[1])}` : "No branch sales yet", note: "Based on available monthly sales" },
        { label: "Branch summary", value: branches.length > 1 ? "Multi-branch tracking active" : "Single branch mode", note: "More branch KPIs will appear as data grows" },
      ],
    },
    recommendedActions,
    promptResponses: {
      "What sold the most today?": bestProduct === "No product sales yet" ? "I do not have enough sale-item data yet. Complete POS sales and I will rank products by quantity and value." : `${bestProduct} is currently the strongest-selling product from available sales data. It has led item movement in the selected period, so keep enough stock available.`,
      "Which products are running low?": `Based on current stock levels, these products need attention: ${lowStockNames}. Restock the fastest-moving low-stock items first to avoid losing sales.`,
      "Who owes me money?": `${topDebtorNames}. Total customer debt is ${money(totalDebt)} across ${debtors.length} customer${debtors.length === 1 ? "" : "s"}.`,
      "Which cashier sold the most?": `${topCashierText}. This is calculated from local sales records only.`,
      "How much profit did I make this week?": `Estimated weekly profit is ${money(estimatedWeekProfit)}. This uses weekly sales minus estimated product costs and current monthly expenses, so treat it as a business estimate.`,
      "What should I restock first?": reorderProducts.length ? `Restock ${names(reorderProducts, "low-stock products", 3)} first. Prioritize any low-stock item that also appears in fast-moving products.` : "No reorder item is urgent based on current stock and reorder levels.",
      "Which expenses are too high?": highestExpense ? `${highestExpense[0]} is the highest expense category this month at ${money(highestExpense[1])}. Review supplier prices, approvals, and recurring costs in this category.` : "No monthly expense records are available yet. Record expenses to unlock cost warnings.",
      "Summarize today's business performance.": salesToday.length ? `Today you made ${money(todaySales)} from ${salesToday.length} sale${salesToday.length === 1 ? "" : "s"}. ${bestPayment} is leading payments, ${bestProduct} is your strongest product, and customer debt stands at ${money(totalDebt)}.` : `No sales are recorded today yet. This week is at ${money(weekSales)}, stock value is ${money(stockValue)}, and customer debt is ${money(totalDebt)}.`,
    },
  };
}
