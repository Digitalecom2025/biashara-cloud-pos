export type CustomerStatus = "Active" | "Clear" | "Owes" | "Overdue" | "Inactive";
export type CustomerType = "Walk-in" | "Retail" | "Wholesale" | "Company" | "Regular";

export type Customer = {
  id: string;
  initials: string;
  name: string;
  phone: string;
  email?: string;
  type: CustomerType;
  industries: string;
  totalPurchases: number;
  debtBalance: number;
  lastPurchase: string;
  status: CustomerStatus;
};

export type Debtor = {
  id: string;
  customerId: string;
  customer: string;
  phone: string;
  invoice: string;
  originalAmount: number;
  paidAmount: number;
  balanceDue: number;
  dueDate: string;
  daysOverdue: number;
  status: "Partial" | "Overdue" | "Due soon";
};

export const customers: Customer[] = [
  { id: "walk-in", initials: "WI", name: "Walk-in Customer", phone: "Default counter account", type: "Walk-in", industries: "General retail", totalPurchases: 286400, debtBalance: 0, lastPurchase: "02 Jun 2026, 10:42", status: "Clear" },
  { id: "karibu", initials: "KR", name: "Karibu Restaurant", phone: "0721 116 804", email: "orders@kariburestaurant.co.ke", type: "Company", industries: "Restaurant supplies", totalPurchases: 184600, debtBalance: 18600, lastPurchase: "02 Jun 2026, 08:46", status: "Owes" },
  { id: "beauty", initials: "BS", name: "Beauty Shop Customer", phone: "0712 840 230", email: "hello@amanibeauty.co.ke", type: "Regular", industries: "Cosmetics and oils", totalPurchases: 126900, debtBalance: 6200, lastPurchase: "02 Jun 2026, 10:19", status: "Owes" },
  { id: "wholesale", initials: "WC", name: "Wholesale Customer", phone: "0705 382 744", email: "buying@upendowholesale.co.ke", type: "Wholesale", industries: "Supermarket stock", totalPurchases: 542300, debtBalance: 48500, lastPurchase: "01 Jun 2026, 16:35", status: "Overdue" },
  { id: "staff-meal", initials: "SM", name: "Staff Meal Account", phone: "Internal account", type: "Regular", industries: "Restaurant meals", totalPurchases: 24800, debtBalance: 2400, lastPurchase: "02 Jun 2026, 09:07", status: "Owes" },
  { id: "contractor", initials: "CC", name: "Contractor Client", phone: "0798 662 519", email: "site@jengacontractors.co.ke", type: "Company", industries: "Hardware and auto spares", totalPurchases: 368700, debtBalance: 73400, lastPurchase: "31 May 2026, 14:22", status: "Overdue" },
  { id: "miriam", initials: "MN", name: "Miriam Njeri", phone: "0708 319 605", type: "Retail", industries: "Cosmetics", totalPurchases: 35400, debtBalance: 0, lastPurchase: "30 May 2026, 11:18", status: "Clear" },
  { id: "garage", initials: "AG", name: "Auto Garage Customer", phone: "0733 908 177", email: "service@autogarage.co.ke", type: "Regular", industries: "Auto spares", totalPurchases: 97600, debtBalance: 12800, lastPurchase: "29 May 2026, 15:41", status: "Overdue" },
];

export const debtors: Debtor[] = [
  { id: "debt-01", customerId: "karibu", customer: "Karibu Restaurant", phone: "0721 116 804", invoice: "INV-2816", originalAmount: 32600, paidAmount: 14000, balanceDue: 18600, dueDate: "06 Jun 2026", daysOverdue: -4, status: "Due soon" },
  { id: "debt-02", customerId: "beauty", customer: "Beauty Shop Customer", phone: "0712 840 230", invoice: "INV-2847", originalAmount: 9200, paidAmount: 3000, balanceDue: 6200, dueDate: "09 Jun 2026", daysOverdue: -7, status: "Partial" },
  { id: "debt-03", customerId: "wholesale", customer: "Wholesale Customer", phone: "0705 382 744", invoice: "INV-2739", originalAmount: 74500, paidAmount: 26000, balanceDue: 48500, dueDate: "24 May 2026", daysOverdue: 9, status: "Overdue" },
  { id: "debt-04", customerId: "staff-meal", customer: "Staff Meal Account", phone: "Internal account", invoice: "INV-2844", originalAmount: 2400, paidAmount: 0, balanceDue: 2400, dueDate: "02 Jun 2026", daysOverdue: 0, status: "Partial" },
  { id: "debt-05", customerId: "contractor", customer: "Contractor Client", phone: "0798 662 519", invoice: "INV-2682", originalAmount: 112000, paidAmount: 38600, balanceDue: 73400, dueDate: "18 May 2026", daysOverdue: 15, status: "Overdue" },
  { id: "debt-06", customerId: "garage", customer: "Auto Garage Customer", phone: "0733 908 177", invoice: "INV-2758", originalAmount: 20800, paidAmount: 8000, balanceDue: 12800, dueDate: "27 May 2026", daysOverdue: 6, status: "Overdue" },
];
