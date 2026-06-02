export type WarehouseStatus = "Active" | "Low stock" | "Restricted";
export type ProductStockStatus = "Healthy" | "Low stock" | "Out of stock";
export type AdjustmentType = "Add" | "Reduce" | "Damage" | "Correction";
export type AdjustmentStatus = "Approved" | "Pending" | "Rejected";
export type TransferStatus = "Completed" | "Pending" | "In transit" | "Cancelled";

export type Warehouse = {
  id: string;
  name: string;
  location: string;
  branch: string;
  manager: string;
  productCount: number;
  stockValue: number;
  status: WarehouseStatus;
};

export type WarehouseProduct = {
  id: string;
  emoji: string;
  tone: string;
  name: string;
  category: string;
  warehouse: string;
  rack: string;
  shelf: string;
  currentStock: number;
  reorderLevel: number;
  status: ProductStockStatus;
};

export type StockAdjustment = {
  id: string;
  product: string;
  type: AdjustmentType;
  quantity: number;
  reason: string;
  warehouse: string;
  adjustedBy: string;
  date: string;
  status: AdjustmentStatus;
};

export type StockTransfer = {
  id: string;
  product: string;
  quantity: number;
  from: string;
  to: string;
  requestedBy: string;
  approvedBy: string;
  date: string;
  status: TransferStatus;
};

export const warehouses: Warehouse[] = [
  { id: "main", name: "Main Warehouse", location: "Industrial Area, Nairobi", branch: "Central Distribution", manager: "David Omondi", productCount: 428, stockValue: 2286400, status: "Active" },
  { id: "cbd", name: "Nairobi CBD Store", location: "Tom Mboya Street", branch: "Nairobi CBD", manager: "James Mwangi", productCount: 186, stockValue: 842300, status: "Active" },
  { id: "kitchen", name: "Kitchen Store", location: "Nairobi CBD Restaurant", branch: "Nairobi CBD", manager: "Faith Njeri", productCount: 74, stockValue: 286500, status: "Low stock" },
  { id: "hardware", name: "Hardware Store", location: "Enterprise Road", branch: "Industrial Area", manager: "Peter Kariuki", productCount: 152, stockValue: 918200, status: "Active" },
  { id: "auto", name: "Auto Spares Store", location: "Kirinyaga Road", branch: "Nairobi CBD", manager: "Lucy Wambui", productCount: 119, stockValue: 756800, status: "Low stock" },
  { id: "cosmetics", name: "Cosmetics Store", location: "Westlands Arcade", branch: "Westlands", manager: "Amina Hassan", productCount: 96, stockValue: 524600, status: "Restricted" },
];

export const warehouseProducts: WarehouseProduct[] = [
  { id: "prod-01", emoji: "🧴", tone: "bg-amber-50", name: "Seed Oil 50ml", category: "Cosmetics", warehouse: "Cosmetics Store", rack: "C-01", shelf: "S-02", currentStock: 42, reorderLevel: 15, status: "Healthy" },
  { id: "prod-02", emoji: "🧴", tone: "bg-yellow-50", name: "Seed Oil 250ml", category: "Cosmetics", warehouse: "Cosmetics Store", rack: "C-01", shelf: "S-03", currentStock: 28, reorderLevel: 12, status: "Healthy" },
  { id: "prod-03", emoji: "🫙", tone: "bg-lime-50", name: "Seed Oil 1L", category: "Cosmetics", warehouse: "Cosmetics Store", rack: "C-02", shelf: "S-01", currentStock: 9, reorderLevel: 10, status: "Low stock" },
  { id: "prod-04", emoji: "🍲", tone: "bg-orange-50", name: "Ugali Beef Stew", category: "Restaurant", warehouse: "Kitchen Store", rack: "K-02", shelf: "Prep", currentStock: 14, reorderLevel: 18, status: "Low stock" },
  { id: "prod-05", emoji: "🏗️", tone: "bg-slate-100", name: "Cement 50kg Bag", category: "Hardware", warehouse: "Hardware Store", rack: "H-01", shelf: "Floor", currentStock: 55, reorderLevel: 20, status: "Healthy" },
  { id: "prod-06", emoji: "🚘", tone: "bg-blue-50", name: "Brake Pads Toyota Axio Front", category: "Auto Spares", warehouse: "Auto Spares Store", rack: "A-02", shelf: "S-05", currentStock: 4, reorderLevel: 8, status: "Low stock" },
  { id: "prod-07", emoji: "🍚", tone: "bg-stone-100", name: "Rice 1kg", category: "Supermarket", warehouse: "Nairobi CBD Store", rack: "G-04", shelf: "S-01", currentStock: 0, reorderLevel: 24, status: "Out of stock" },
  { id: "prod-08", emoji: "🥛", tone: "bg-cyan-50", name: "Whole Milk 1L", category: "Supermarket", warehouse: "Nairobi CBD Store", rack: "D-01", shelf: "Chiller", currentStock: 38, reorderLevel: 20, status: "Healthy" },
];

export const stockAdjustments: StockAdjustment[] = [
  { id: "ADJ-0186", product: "Seed Oil 50ml", type: "Add", quantity: 24, reason: "Purchase stock received", warehouse: "Cosmetics Store", adjustedBy: "Amina Hassan", date: "02 Jun 2026, 10:15", status: "Approved" },
  { id: "ADJ-0185", product: "Whole Milk 1L", type: "Damage", quantity: 6, reason: "Packaging damaged in transit", warehouse: "Nairobi CBD Store", adjustedBy: "James Mwangi", date: "02 Jun 2026, 09:34", status: "Approved" },
  { id: "ADJ-0184", product: "Ugali Beef Stew", type: "Reduce", quantity: 4, reason: "Kitchen wastage", warehouse: "Kitchen Store", adjustedBy: "Faith Njeri", date: "02 Jun 2026, 08:48", status: "Pending" },
  { id: "ADJ-0183", product: "Cement 50kg Bag", type: "Correction", quantity: 3, reason: "Physical count variance", warehouse: "Hardware Store", adjustedBy: "Peter Kariuki", date: "01 Jun 2026, 16:20", status: "Approved" },
  { id: "ADJ-0182", product: "Brake Pads Toyota Axio Front", type: "Reduce", quantity: 2, reason: "Workshop issue note", warehouse: "Auto Spares Store", adjustedBy: "Lucy Wambui", date: "01 Jun 2026, 14:05", status: "Pending" },
  { id: "ADJ-0181", product: "Rice 1kg", type: "Damage", quantity: 8, reason: "Burst packets", warehouse: "Nairobi CBD Store", adjustedBy: "James Mwangi", date: "31 May 2026, 12:40", status: "Rejected" },
];

export const stockTransfers: StockTransfer[] = [
  { id: "TRF-0092", product: "Seed Oil 250ml", quantity: 12, from: "Main Warehouse", to: "Cosmetics Store", requestedBy: "Amina Hassan", approvedBy: "David Omondi", date: "02 Jun 2026, 10:05", status: "In transit" },
  { id: "TRF-0091", product: "Whole Milk 1L", quantity: 24, from: "Main Warehouse", to: "Nairobi CBD Store", requestedBy: "James Mwangi", approvedBy: "David Omondi", date: "02 Jun 2026, 08:30", status: "Completed" },
  { id: "TRF-0090", product: "Ugali Beef Stew", quantity: 18, from: "Main Warehouse", to: "Kitchen Store", requestedBy: "Faith Njeri", approvedBy: "David Omondi", date: "01 Jun 2026, 15:10", status: "Pending" },
  { id: "TRF-0089", product: "Cement 50kg Bag", quantity: 30, from: "Main Warehouse", to: "Hardware Store", requestedBy: "Peter Kariuki", approvedBy: "David Omondi", date: "01 Jun 2026, 12:55", status: "Completed" },
  { id: "TRF-0088", product: "Brake Pads Toyota Axio Front", quantity: 8, from: "Main Warehouse", to: "Auto Spares Store", requestedBy: "Lucy Wambui", approvedBy: "Pending approval", date: "31 May 2026, 14:25", status: "Pending" },
  { id: "TRF-0087", product: "Rice 1kg", quantity: 40, from: "Main Warehouse", to: "Nairobi CBD Store", requestedBy: "James Mwangi", approvedBy: "David Omondi", date: "30 May 2026, 11:05", status: "Cancelled" },
];
