export type SupplierStatus = "Clear" | "Owes" | "Inactive";
export type PurchaseStatus = "Paid" | "Partial" | "Unpaid";

export type Supplier = {
  id: string;
  initials: string;
  name: string;
  phone: string;
  email: string;
  category: string;
  totalPurchases: number;
  currentBalance: number;
  lastPurchase: string;
  status: SupplierStatus;
};

export type Purchase = {
  id: string;
  invoice: string;
  supplierId: string;
  supplier: string;
  description: string;
  date: string;
  itemsCount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  paymentMethod: string;
  status: PurchaseStatus;
};

export const suppliers: Supplier[] = [
  { id: "seed-oil", initials: "SO", name: "Seed Oil Supplier", phone: "0714 502 918", email: "orders@seedoilsupplier.co.ke", category: "Cosmetics oils", totalPurchases: 286400, currentBalance: 32400, lastPurchase: "02 Jun 2026, 08:15", status: "Owes" },
  { id: "packaging", initials: "PS", name: "Packaging Supplier", phone: "0720 881 346", email: "sales@packaginghub.co.ke", category: "Bottles and packaging", totalPurchases: 128600, currentBalance: 0, lastPurchase: "01 Jun 2026, 15:42", status: "Clear" },
  { id: "food", initials: "NF", name: "Nairobi Food Wholesalers", phone: "0733 240 155", email: "orders@nairobifoods.co.ke", category: "Restaurant food stock", totalPurchases: 542800, currentBalance: 46800, lastPurchase: "02 Jun 2026, 06:55", status: "Owes" },
  { id: "cement", initials: "CS", name: "Cement Supplier", phone: "0708 790 442", email: "dispatch@cementsupplier.co.ke", category: "Hardware materials", totalPurchases: 784500, currentBalance: 0, lastPurchase: "31 May 2026, 11:20", status: "Clear" },
  { id: "auto-parts", initials: "AP", name: "Auto Parts Distributor", phone: "0792 441 683", email: "trade@autopartsdist.co.ke", category: "Auto spares", totalPurchases: 364900, currentBalance: 74200, lastPurchase: "30 May 2026, 14:10", status: "Owes" },
  { id: "beauty", initials: "BP", name: "Beauty Products Distributor", phone: "0711 950 726", email: "hello@beautyproducts.co.ke", category: "Cosmetics products", totalPurchases: 219700, currentBalance: 18000, lastPurchase: "29 May 2026, 09:35", status: "Owes" },
  { id: "general", initials: "GS", name: "General Stock Supplier", phone: "0701 618 290", email: "orders@generalstock.co.ke", category: "Supermarket stock", totalPurchases: 436300, currentBalance: 0, lastPurchase: "25 May 2026, 13:05", status: "Inactive" },
];

export const purchases: Purchase[] = [
  { id: "pur-1091", invoice: "PUR-1091", supplierId: "seed-oil", supplier: "Seed Oil Supplier", description: "Seed Oil bottles stock purchase", date: "02 Jun 2026, 08:15", itemsCount: 4, totalAmount: 82400, paidAmount: 50000, balanceDue: 32400, paymentMethod: "Bank", status: "Partial" },
  { id: "pur-1090", invoice: "PUR-1090", supplierId: "food", supplier: "Nairobi Food Wholesalers", description: "Restaurant food stock purchase", date: "02 Jun 2026, 06:55", itemsCount: 18, totalAmount: 96800, paidAmount: 50000, balanceDue: 46800, paymentMethod: "M-Pesa", status: "Partial" },
  { id: "pur-1089", invoice: "PUR-1089", supplierId: "packaging", supplier: "Packaging Supplier", description: "Packaging bottles purchase", date: "01 Jun 2026, 15:42", itemsCount: 6, totalAmount: 28600, paidAmount: 28600, balanceDue: 0, paymentMethod: "Cash", status: "Paid" },
  { id: "pur-1088", invoice: "PUR-1088", supplierId: "cement", supplier: "Cement Supplier", description: "Cement stock purchase", date: "31 May 2026, 11:20", itemsCount: 60, totalAmount: 46800, paidAmount: 46800, balanceDue: 0, paymentMethod: "Bank", status: "Paid" },
  { id: "pur-1087", invoice: "PUR-1087", supplierId: "auto-parts", supplier: "Auto Parts Distributor", description: "Brake pads stock purchase", date: "30 May 2026, 14:10", itemsCount: 12, totalAmount: 74200, paidAmount: 0, balanceDue: 74200, paymentMethod: "Credit", status: "Unpaid" },
  { id: "pur-1086", invoice: "PUR-1086", supplierId: "beauty", supplier: "Beauty Products Distributor", description: "Cosmetics stock purchase", date: "29 May 2026, 09:35", itemsCount: 14, totalAmount: 58900, paidAmount: 40900, balanceDue: 18000, paymentMethod: "M-Pesa", status: "Partial" },
  { id: "pur-1085", invoice: "PUR-1085", supplierId: "general", supplier: "General Stock Supplier", description: "Supermarket general stock refill", date: "25 May 2026, 13:05", itemsCount: 32, totalAmount: 124500, paidAmount: 124500, balanceDue: 0, paymentMethod: "Bank", status: "Paid" },
];

export const purchaseReturns = [
  { id: "RET-0028", supplier: "Packaging Supplier", total: 4200, reason: "Damaged bottles" },
  { id: "RET-0027", supplier: "Nairobi Food Wholesalers", total: 1850, reason: "Short shelf life" },
];
