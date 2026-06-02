export type SalesProduct = {
  id: number;
  emoji: string;
  tone: string;
  name: string;
  code: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
};

export type RecentSale = {
  invoice: string;
  customer: string;
  payment: string;
  total: number;
  paid: number;
  due: number;
  cashier: string;
  date: string;
  status: "Paid" | "Partial" | "Due";
};

export const salesProducts: SalesProduct[] = [
  { id: 1, emoji: "🧴", tone: "bg-amber-50", name: "Seed Oil 50ml", code: "COS-SO50", category: "Cosmetics", unit: "Bottle", price: 280, stock: 42 },
  { id: 2, emoji: "🧴", tone: "bg-yellow-50", name: "Seed Oil 250ml", code: "COS-SO250", category: "Cosmetics", unit: "Bottle", price: 850, stock: 28 },
  { id: 3, emoji: "🧴", tone: "bg-orange-50", name: "Seed Oil 500ml", code: "COS-SO500", category: "Cosmetics", unit: "Bottle", price: 1450, stock: 16 },
  { id: 4, emoji: "🫙", tone: "bg-lime-50", name: "Seed Oil 1L", code: "COS-SO1L", category: "Cosmetics", unit: "Bottle", price: 2600, stock: 9 },
  { id: 5, emoji: "🍲", tone: "bg-orange-50", name: "Ugali Beef Stew", code: "RST-UBS01", category: "Restaurant", unit: "Plate", price: 450, stock: 34 },
  { id: 6, emoji: "🍗", tone: "bg-red-50", name: "Chips Chicken", code: "RST-CC02", category: "Restaurant", unit: "Plate", price: 680, stock: 21 },
  { id: 7, emoji: "🏗️", tone: "bg-slate-100", name: "Cement 50kg Bag", code: "HDW-CEM50", category: "Hardware", unit: "Bag", price: 780, stock: 55 },
  { id: 8, emoji: "🚘", tone: "bg-blue-50", name: "Brake Pads Toyota Axio Front", code: "AUT-BP085", category: "Auto Spares", unit: "Set", price: 2400, stock: 4 },
];

export const customers = [
  { id: "walk-in", name: "Walk-in Customer", phone: "Default cash customer" },
  { id: "amani", name: "Amani Beauty Studio", phone: "0712 840 230" },
  { id: "karibu", name: "Karibu Restaurant", phone: "0721 116 804" },
  { id: "mwangaza", name: "Mwangaza Hardware", phone: "0708 662 519" },
  { id: "joseph", name: "Joseph Kamau", phone: "0798 205 140" },
];

export const recentSales: RecentSale[] = [
  { invoice: "INV-2848", customer: "Walk-in Customer", payment: "M-Pesa", total: 4850, paid: 4850, due: 0, cashier: "James Mwangi", date: "02 Jun 2026, 10:42", status: "Paid" },
  { invoice: "INV-2847", customer: "Amani Beauty Studio", payment: "Credit / Debt", total: 9200, paid: 3000, due: 6200, cashier: "James Mwangi", date: "02 Jun 2026, 10:19", status: "Partial" },
  { invoice: "INV-2846", customer: "Walk-in Customer", payment: "Cash", total: 1560, paid: 1560, due: 0, cashier: "Faith Njeri", date: "02 Jun 2026, 09:54", status: "Paid" },
  { invoice: "INV-2845", customer: "Mwangaza Hardware", payment: "Bank", total: 23400, paid: 23400, due: 0, cashier: "James Mwangi", date: "02 Jun 2026, 09:31", status: "Paid" },
  { invoice: "INV-2844", customer: "Joseph Kamau", payment: "Credit / Debt", total: 2400, paid: 0, due: 2400, cashier: "Faith Njeri", date: "02 Jun 2026, 09:07", status: "Due" },
  { invoice: "INV-2843", customer: "Karibu Restaurant", payment: "M-Pesa", total: 6860, paid: 6860, due: 0, cashier: "James Mwangi", date: "02 Jun 2026, 08:46", status: "Paid" },
];
