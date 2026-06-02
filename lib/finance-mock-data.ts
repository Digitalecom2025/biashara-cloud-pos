export type LedgerStatus = "Completed" | "Pending" | "Failed";
export type ExpenseStatus = "Approved" | "Pending" | "Rejected";
export type PaymentTypeStatus = "Active" | "Inactive";

export type TillSummary = {
  id: string;
  till: string;
  branch: string;
  cashier: string;
  openingFloat: number;
  cashSales: number;
  cashExpenses: number;
  expectedCash: number;
  status: "Open" | "Closed";
};

export type LedgerRecord = {
  id: string;
  reference: string;
  description: string;
  amount: number;
  branch: string;
  recordedBy: string;
  date: string;
  status: LedgerStatus;
};

export type ExpenseRecord = {
  id: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  branch: string;
  recordedBy: string;
  date: string;
  status: ExpenseStatus;
};

export type PaymentType = {
  id: string;
  name: string;
  description: string;
  transactions: number;
  totalCollected: number;
  status: PaymentTypeStatus;
};

export const tillSummaries: TillSummary[] = [
  { id: "till-01", till: "Till CBD-01", branch: "Nairobi CBD Store", cashier: "Mary Wanjiku", openingFloat: 5000, cashSales: 42450, cashExpenses: 2850, expectedCash: 44600, status: "Open" },
  { id: "till-02", till: "Till RST-02", branch: "Restaurant Branch", cashier: "Faith Njeri", openingFloat: 3000, cashSales: 28600, cashExpenses: 1200, expectedCash: 30400, status: "Open" },
  { id: "till-03", till: "Till COS-01", branch: "Cosmetics Store", cashier: "Mary Wanjiku", openingFloat: 2500, cashSales: 18400, cashExpenses: 0, expectedCash: 20900, status: "Closed" },
];

export const mpesaRecords: LedgerRecord[] = [
  { id: "MP-7812", reference: "QHG7R2K9", description: "M-Pesa sale receipt INV-2848", amount: 4850, branch: "Nairobi CBD Store", recordedBy: "James Mwangi", date: "02 Jun 2026, 10:42", status: "Completed" },
  { id: "MP-7811", reference: "QHG6T9L4", description: "Restaurant order payment", amount: 6860, branch: "Restaurant Branch", recordedBy: "Faith Njeri", date: "02 Jun 2026, 08:46", status: "Completed" },
  { id: "MP-7810", reference: "QHG4P2W8", description: "Cosmetics retail sale", amount: 9200, branch: "Cosmetics Store", recordedBy: "Mary Wanjiku", date: "01 Jun 2026, 16:28", status: "Completed" },
  { id: "MP-7809", reference: "QHG3N1Z6", description: "Hardware counter sale", amount: 12400, branch: "Main Branch", recordedBy: "John Kamau", date: "01 Jun 2026, 14:12", status: "Pending" },
];

export const bankRecords: LedgerRecord[] = [
  { id: "BNK-0241", reference: "DEP-80492", description: "Daily cash sales deposit", amount: 68400, branch: "Main Branch", recordedBy: "Grace Achieng", date: "02 Jun 2026, 09:10", status: "Completed" },
  { id: "BNK-0240", reference: "TRF-55108", description: "Hardware company payment", amount: 23400, branch: "Main Branch", recordedBy: "Grace Achieng", date: "01 Jun 2026, 15:20", status: "Completed" },
  { id: "BNK-0239", reference: "DEP-80371", description: "Restaurant weekend deposit", amount: 42600, branch: "Restaurant Branch", recordedBy: "Grace Achieng", date: "01 Jun 2026, 11:35", status: "Completed" },
];

export const expenses: ExpenseRecord[] = [
  { id: "EXP-0428", category: "Stock purchase", description: "Seed Oil bottles stock purchase", amount: 82400, paymentMethod: "Bank", branch: "Cosmetics Store", recordedBy: "Grace Achieng", date: "02 Jun 2026, 08:15", status: "Approved" },
  { id: "EXP-0427", category: "Rent", description: "Nairobi CBD monthly shop rent", amount: 65000, paymentMethod: "Bank", branch: "Nairobi CBD Store", recordedBy: "James Mwangi", date: "01 Jun 2026, 09:00", status: "Approved" },
  { id: "EXP-0426", category: "Staff wages", description: "Restaurant casual staff wages", amount: 18600, paymentMethod: "M-Pesa", branch: "Restaurant Branch", recordedBy: "Grace Achieng", date: "31 May 2026, 17:15", status: "Approved" },
  { id: "EXP-0425", category: "Transport", description: "Cement delivery transport", amount: 7400, paymentMethod: "Cash", branch: "Main Branch", recordedBy: "John Kamau", date: "31 May 2026, 11:40", status: "Approved" },
  { id: "EXP-0424", category: "Packaging", description: "Takeaway containers and bottles", amount: 12600, paymentMethod: "M-Pesa", branch: "Restaurant Branch", recordedBy: "Faith Njeri", date: "30 May 2026, 14:05", status: "Pending" },
  { id: "EXP-0423", category: "Electricity", description: "Westlands branch power tokens", amount: 8500, paymentMethod: "M-Pesa", branch: "Westlands Branch", recordedBy: "Amina Hassan", date: "29 May 2026, 10:25", status: "Approved" },
  { id: "EXP-0422", category: "Marketing", description: "June SMS promotion budget", amount: 5000, paymentMethod: "Cash", branch: "Main Branch", recordedBy: "James Mwangi", date: "28 May 2026, 16:30", status: "Rejected" },
];

export const incomeRecords: LedgerRecord[] = [
  { id: "INC-0952", reference: "SALES-CASH", description: "Cash sales", amount: 42450, branch: "Nairobi CBD Store", recordedBy: "Mary Wanjiku", date: "02 Jun 2026, 11:00", status: "Completed" },
  { id: "INC-0951", reference: "SALES-MPESA", description: "M-Pesa sales", amount: 126800, branch: "All branches", recordedBy: "System", date: "02 Jun 2026, 11:00", status: "Completed" },
  { id: "INC-0950", reference: "BANK-DEPOSIT", description: "Bank deposits", amount: 68400, branch: "Main Branch", recordedBy: "Grace Achieng", date: "02 Jun 2026, 09:10", status: "Completed" },
  { id: "INC-0949", reference: "SALES-CREDIT", description: "Credit sales", amount: 15000, branch: "All branches", recordedBy: "System", date: "02 Jun 2026, 11:00", status: "Pending" },
];

export const paymentTypes: PaymentType[] = [
  { id: "cash", name: "Cash", description: "Till drawer and counter cash payments", transactions: 184, totalCollected: 286400, status: "Active" },
  { id: "mpesa", name: "M-Pesa", description: "Mobile money paybill and till payments", transactions: 312, totalCollected: 642850, status: "Active" },
  { id: "bank", name: "Bank", description: "Bank deposits and direct transfers", transactions: 46, totalCollected: 218900, status: "Active" },
  { id: "card", name: "Card", description: "Debit and credit card terminal receipts", transactions: 0, totalCollected: 0, status: "Inactive" },
  { id: "credit", name: "Credit / Debt", description: "Customer balances payable after sale", transactions: 31, totalCollected: 86400, status: "Active" },
];

export const taxRecords = [
  { id: "TAX-0626", period: "June 2026", taxableSales: 184250, vatCollected: 23895, invoices: 96, status: "Current" },
  { id: "TAX-0526", period: "May 2026", taxableSales: 3246800, vatCollected: 421662, invoices: 1482, status: "Filed" },
  { id: "TAX-0426", period: "April 2026", taxableSales: 2964200, vatCollected: 384961, invoices: 1374, status: "Filed" },
  { id: "TAX-0326", period: "March 2026", taxableSales: 2810600, vatCollected: 365378, invoices: 1298, status: "Filed" },
];
