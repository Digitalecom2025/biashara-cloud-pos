export type ReportPreview = {
  id: string;
  date: string;
  type: string;
  branch: string;
  totalSales: number;
  expenses: number;
  profitEstimate: number;
  createdBy: string;
  status: "Ready" | "Generating" | "Archived";
};

export type PartyReport = {
  id: string;
  name: string;
  type: "Customer" | "Supplier";
  phone: string;
  transactions: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  lastTransaction: string;
  status: "Clear" | "Owes" | "Overdue";
};

export const reportCategories = [
  { title: "Sales Report", description: "Daily revenue, invoices and payment collection" },
  { title: "Product Sales Report", description: "Best-selling products and category performance" },
  { title: "Stock Report", description: "Warehouse quantities, valuation and movement" },
  { title: "Low Stock Report", description: "Items below reorder level across branches" },
  { title: "Purchase Report", description: "Supplier stock intake and balances payable" },
  { title: "Expense Report", description: "Operating costs grouped by category and branch" },
  { title: "Payment Method Report", description: "Cash, M-Pesa, bank, card and credit mix" },
  { title: "Cashier Report", description: "Till performance and user collections" },
  { title: "Branch Report", description: "Outlet sales, stock and staff comparison" },
  { title: "Profit Estimate Report", description: "Estimated income less expenses and stock cost" },
  { title: "Tax Report", description: "VAT summaries and invoice compliance records" },
  { title: "Audit Report", description: "Recorded actions, adjustments and approvals" },
];

export const reportPreviews: ReportPreview[] = [
  { id: "RPT-0612", date: "02 Jun 2026, 11:00", type: "Sales Report", branch: "All branches", totalSales: 184250, expenses: 0, profitEstimate: 54800, createdBy: "James Mwangi", status: "Ready" },
  { id: "RPT-0611", date: "02 Jun 2026, 10:30", type: "Cashier Report", branch: "Nairobi CBD Store", totalSales: 126850, expenses: 2850, profitEstimate: 38420, createdBy: "Mary Wanjiku", status: "Ready" },
  { id: "RPT-0610", date: "02 Jun 2026, 09:45", type: "Branch Report", branch: "Restaurant Branch", totalSales: 62900, expenses: 19800, profitEstimate: 21400, createdBy: "Faith Njeri", status: "Generating" },
  { id: "RPT-0609", date: "01 Jun 2026, 17:00", type: "Expense Report", branch: "All branches", totalSales: 0, expenses: 199900, profitEstimate: -199900, createdBy: "Grace Achieng", status: "Ready" },
  { id: "RPT-0608", date: "01 Jun 2026, 16:30", type: "Stock Report", branch: "Main Branch", totalSales: 0, expenses: 0, profitEstimate: 0, createdBy: "Peter Otieno", status: "Archived" },
  { id: "RPT-0607", date: "31 May 2026, 15:20", type: "Payment Method Report", branch: "Cosmetics Store", totalSales: 27450, expenses: 0, profitEstimate: 9620, createdBy: "Mary Wanjiku", status: "Ready" },
];

export const partyReportCategories = [
  "Customer statement report",
  "Supplier statement report",
  "Debtor balances",
  "Supplier balances",
  "Customer purchase history",
  "Supplier purchase history",
  "Credit sales report",
  "Partial payment history",
  "Outstanding balances",
];

export const partyReports: PartyReport[] = [
  { id: "party-01", name: "Walk-in Customer", type: "Customer", phone: "Default counter account", transactions: 386, totalAmount: 286400, paidAmount: 286400, balance: 0, lastTransaction: "02 Jun 2026, 10:42", status: "Clear" },
  { id: "party-02", name: "Karibu Restaurant", type: "Customer", phone: "0721 116 804", transactions: 42, totalAmount: 184600, paidAmount: 166000, balance: 18600, lastTransaction: "02 Jun 2026, 08:46", status: "Owes" },
  { id: "party-03", name: "Beauty Shop Customer", type: "Customer", phone: "0712 840 230", transactions: 28, totalAmount: 126900, paidAmount: 120700, balance: 6200, lastTransaction: "02 Jun 2026, 10:19", status: "Owes" },
  { id: "party-04", name: "Wholesale Customer", type: "Customer", phone: "0705 382 744", transactions: 64, totalAmount: 542300, paidAmount: 493800, balance: 48500, lastTransaction: "01 Jun 2026, 16:35", status: "Overdue" },
  { id: "party-05", name: "Seed Oil Supplier", type: "Supplier", phone: "0714 502 918", transactions: 19, totalAmount: 286400, paidAmount: 254000, balance: 32400, lastTransaction: "02 Jun 2026, 08:15", status: "Owes" },
  { id: "party-06", name: "Packaging Supplier", type: "Supplier", phone: "0720 881 346", transactions: 14, totalAmount: 128600, paidAmount: 128600, balance: 0, lastTransaction: "01 Jun 2026, 15:42", status: "Clear" },
  { id: "party-07", name: "Cement Supplier", type: "Supplier", phone: "0708 790 442", transactions: 22, totalAmount: 784500, paidAmount: 784500, balance: 0, lastTransaction: "31 May 2026, 11:20", status: "Clear" },
  { id: "party-08", name: "Auto Parts Distributor", type: "Supplier", phone: "0792 441 683", transactions: 17, totalAmount: 364900, paidAmount: 290700, balance: 74200, lastTransaction: "30 May 2026, 14:10", status: "Overdue" },
];
