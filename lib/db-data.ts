import { prisma } from "@/lib/prisma";
import { branches as mockBranches, staffUsers as mockStaffUsers, type Branch, type BranchStatus, type StaffStatus, type StaffUser } from "@/lib/organization-mock-data";
import { customers as mockCustomers, debtors as mockDebtors, type Customer, type CustomerStatus, type CustomerType, type Debtor } from "@/lib/customer-mock-data";
import { products as mockProducts, type Product } from "@/lib/mock-data";
import { platformBusinesses as mockPlatformBusinesses, type PlatformBusiness, type PlatformBusinessStatus } from "@/lib/platform-mock-data";
import { recentSales as mockRecentSales, salesProducts as mockSalesProducts, type RecentSale, type SalesProduct } from "@/lib/sales-mock-data";
import { purchases as mockPurchases, suppliers as mockSuppliers, type Purchase, type PurchaseStatus, type Supplier, type SupplierStatus } from "@/lib/purchasing-mock-data";
import {
  stockAdjustments as mockStockAdjustments,
  stockTransfers as mockStockTransfers,
  warehouses as mockWarehouses,
  warehouseProducts as mockWarehouseProducts,
  type AdjustmentType,
  type StockAdjustment,
  type StockTransfer,
  type TransferStatus,
  type Warehouse,
  type WarehouseProduct,
} from "@/lib/inventory-mock-data";

const DEMO_BUSINESS_SLUG = "nairobi-cbd-store";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function productStyle(category: string) {
  const styles: Record<string, { emoji: string; tone: string }> = {
    Cosmetics: { emoji: "🧴", tone: "bg-pink-50" },
    Restaurant: { emoji: "🍽️", tone: "bg-orange-50" },
    Hardware: { emoji: "🔨", tone: "bg-slate-100" },
    "Auto Spares": { emoji: "🚘", tone: "bg-blue-50" },
    Supermarket: { emoji: "🛒", tone: "bg-lime-50" },
  };
  return styles[category] ?? { emoji: "📦", tone: "bg-[#16A34A]/10" };
}

function customerIndustries(type: string) {
  const industries: Record<string, string> = {
    "Walk-in": "General retail",
    Company: "Business account",
    Regular: "Repeat customer",
    Wholesale: "Bulk buyer",
    Retail: "Retail customer",
  };
  return industries[type] ?? "Customer account";
}

function customerStatus(value: string, debtBalance: number): CustomerStatus {
  if (value.toLowerCase() === "inactive") return "Inactive";
  if (value === "Overdue") return "Overdue";
  if (debtBalance > 0) return "Owes";
  return "Clear";
}

function supplierStatus(value: string, balance: number): SupplierStatus {
  if (value.toLowerCase() === "inactive") return "Inactive";
  if (balance > 0 || value === "Owes") return "Owes";
  return "Clear";
}

function productStockStatus(stock: number, reorderLevel: number) {
  if (stock <= 0) return "Out of stock" as const;
  if (stock <= reorderLevel) return "Low stock" as const;
  return "Healthy" as const;
}

function adjustmentType(type: string, quantity: number): AdjustmentType {
  if (type === "damage") return "Damage";
  if (type === "correction") return "Correction";
  if (quantity < 0) return "Reduce";
  return "Add";
}

function formatDateTime(value?: Date | null) {
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

function formatShortDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function daysBetween(from: Date, to: Date) {
  const day = 24 * 60 * 60 * 1000;
  const start = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const end = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.floor((start - end) / day);
}

function businessStatus(value: string): PlatformBusinessStatus {
  const normalized = value.toLowerCase();
  if (normalized === "trial") return "Trial";
  if (normalized === "suspended") return "Suspended";
  if (normalized === "expired") return "Expired";
  return "Active";
}

export async function getDemoBusinessId() {
  const business = await prisma.business.findUnique({ where: { slug: DEMO_BUSINESS_SLUG }, select: { id: true } });
  return business?.id;
}

export function mapProductForPage(product: {
  id: string;
  name: string;
  description: string;
  code: string;
  sku: string | null;
  barcode: string | null;
  category: string;
  brand: string | null;
  unit: string;
  purchasePrice: unknown;
  salePrice: unknown;
  stock: number;
  reorderLevel: number;
  warehouse: string;
  rack: string | null;
  shelf: string | null;
  imageUrl: string | null;
  status: string;
}): Product {
  const style = productStyle(product.category);
  return {
    id: product.id,
    emoji: style.emoji,
    tone: style.tone,
    name: product.name,
    description: product.description,
    code: product.code,
    sku: product.sku ?? undefined,
    barcode: product.barcode ?? undefined,
    category: product.category,
    brand: product.brand ?? undefined,
    warehouse: product.warehouse,
    unit: product.unit,
    purchasePrice: Number(product.purchasePrice),
    salePrice: Number(product.salePrice),
    stock: product.stock,
    reorderLevel: product.reorderLevel,
    rack: product.rack ?? "",
    shelf: product.shelf ?? "",
    imageUrl: product.imageUrl ?? undefined,
    status: product.status,
  };
}

export async function getProductsForPage(): Promise<Product[]> {
  try {
    const businessId = await getDemoBusinessId();
    if (!businessId) return mockProducts;
    const dbProducts = await prisma.product.findMany({ where: { businessId, status: { notIn: ["Inactive", "inactive"] } }, orderBy: { name: "asc" } });
    if (dbProducts.length === 0) return mockProducts;
    return dbProducts.map(mapProductForPage);
  } catch (error) {
    console.warn("Falling back to mock products", error);
    return mockProducts;
  }
}

export async function getSalesProductsForPage(): Promise<SalesProduct[]> {
  try {
    const products = await getProductsForPage();
    return products.map((product) => ({
      id: product.id,
      emoji: product.emoji,
      tone: product.tone,
      name: product.name,
      code: product.code,
      category: product.category,
      unit: product.unit,
      price: product.salePrice,
      stock: product.stock,
    }));
  } catch (error) {
    console.warn("Falling back to mock sales products", error);
    return mockSalesProducts;
  }
}

export function mapCustomerForPage(customer: {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  customerType: string;
  totalPurchases: unknown;
  debtBalance: unknown;
  status: string;
  updatedAt: Date;
}): Customer {
  const debtBalance = Number(customer.debtBalance);
  return {
    id: customer.id,
    initials: initials(customer.name),
    name: customer.name,
    phone: customer.phone,
    email: customer.email ?? undefined,
    type: customer.customerType as CustomerType,
    industries: customerIndustries(customer.customerType),
    totalPurchases: Number(customer.totalPurchases),
    debtBalance,
    lastPurchase: formatDateTime(customer.updatedAt),
    status: customerStatus(customer.status, debtBalance),
  };
}

export async function getCustomersForPage(): Promise<Customer[]> {
  try {
    const businessId = await getDemoBusinessId();
    if (!businessId) return mockCustomers;
    const dbCustomers = await prisma.customer.findMany({ where: { businessId, status: { notIn: ["inactive", "Inactive"] } }, orderBy: { name: "asc" } });
    if (dbCustomers.length === 0) return mockCustomers;
    return dbCustomers.map(mapCustomerForPage);
  } catch (error) {
    console.warn("Falling back to mock customers", error);
    return mockCustomers;
  }
}

export async function getDebtorsForPage(): Promise<Debtor[]> {
  try {
    const businessId = await getDemoBusinessId();
    if (!businessId) return mockDebtors;
    const dbCustomers = await prisma.customer.findMany({
      where: { businessId, debtBalance: { gt: 0 }, status: { notIn: ["inactive", "Inactive"] } },
      include: {
        payments: { orderBy: { createdAt: "desc" } },
        sales: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    });
    if (dbCustomers.length === 0) return mockDebtors;

    const today = new Date();
    return dbCustomers.map((customer, index) => {
      const balanceDue = Number(customer.debtBalance);
      const paidAmount = customer.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      const dueDate = new Date(customer.updatedAt);
      dueDate.setDate(dueDate.getDate() + 7);
      const daysOverdue = daysBetween(today, dueDate);
      const status: Debtor["status"] = customer.status === "Overdue" || daysOverdue > 0 ? "Overdue" : paidAmount > 0 ? "Partial" : "Due soon";

      return {
        id: customer.id,
        customerId: customer.id,
        customer: customer.name,
        phone: customer.phone,
        invoice: customer.sales[0]?.invoiceNumber ?? `BAL-${String(index + 1).padStart(4, "0")}`,
        originalAmount: balanceDue + paidAmount,
        paidAmount,
        balanceDue,
        dueDate: formatShortDate(dueDate),
        daysOverdue,
        status,
      };
    });
  } catch (error) {
    console.warn("Falling back to mock debtors", error);
    return mockDebtors;
  }
}

export async function getRecentSalesForPage(): Promise<RecentSale[]> {
  try {
    const businessId = await getDemoBusinessId();
    if (!businessId) return mockRecentSales;
    const sales = await prisma.sale.findMany({
      where: { businessId },
      include: { customer: true, cashier: true, branch: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    if (sales.length === 0) return mockRecentSales;
    return sales.map((sale) => ({
      id: sale.id,
      invoice: sale.invoiceNumber,
      customer: sale.customer?.name ?? "Walk-in Customer",
      payment: sale.paymentMethod,
      total: Number(sale.total),
      paid: Number(sale.paid),
      due: Number(sale.due),
      cashier: sale.cashier.name,
      branch: sale.branch.name,
      date: formatDateTime(sale.createdAt),
      status: Number(sale.due) === 0 ? "Paid" : Number(sale.paid) > 0 ? "Partial" : "Due",
    }));
  } catch (error) {
    console.warn("Falling back to mock recent sales", error);
    return mockRecentSales;
  }
}

export function mapSupplierForPage(supplier: {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  category: string;
  totalPurchases: unknown;
  balance: unknown;
  status: string;
  updatedAt: Date;
}): Supplier {
  const balance = Number(supplier.balance);
  return {
    id: supplier.id,
    initials: initials(supplier.name),
    name: supplier.name,
    phone: supplier.phone,
    email: supplier.email ?? "",
    category: supplier.category,
    totalPurchases: Number(supplier.totalPurchases),
    currentBalance: balance,
    lastPurchase: formatDateTime(supplier.updatedAt),
    status: supplierStatus(supplier.status, balance),
  };
}

export async function getSuppliersForPage(): Promise<Supplier[]> {
  try {
    const businessId = await getDemoBusinessId();
    if (!businessId) return mockSuppliers;
    const dbSuppliers = await prisma.supplier.findMany({ where: { businessId, status: { notIn: ["inactive", "Inactive"] } }, orderBy: { name: "asc" } });
    if (dbSuppliers.length === 0) return mockSuppliers;
    return dbSuppliers.map(mapSupplierForPage);
  } catch (error) {
    console.warn("Falling back to mock suppliers", error);
    return mockSuppliers;
  }
}

export async function getPurchasesForPage(): Promise<Purchase[]> {
  try {
    const businessId = await getDemoBusinessId();
    if (!businessId) return mockPurchases;
    const purchases = await prisma.purchase.findMany({
      where: { businessId },
      include: { supplier: true, items: true },
      orderBy: { purchaseDate: "desc" },
      take: 50,
    });
    if (purchases.length === 0) return mockPurchases;
    return purchases.map((purchase) => ({
      id: purchase.id,
      invoice: purchase.invoiceNumber,
      supplierId: purchase.supplierId,
      supplier: purchase.supplier.name,
      description: purchase.notes ?? "Stock purchase",
      date: formatDateTime(purchase.purchaseDate),
      itemsCount: purchase.items.length,
      totalAmount: Number(purchase.total),
      paidAmount: Number(purchase.paid),
      balanceDue: Number(purchase.due),
      paymentMethod: purchase.paymentMethod,
      status: purchase.status as PurchaseStatus,
    }));
  } catch (error) {
    console.warn("Falling back to mock purchases", error);
    return mockPurchases;
  }
}

export async function getWarehouseProductsForPage(): Promise<WarehouseProduct[]> {
  try {
    const products = await getProductsForPage();
    return products.map((product) => ({
      id: String(product.id),
      emoji: product.emoji,
      tone: product.tone,
      name: product.name,
      code: product.code,
      category: product.category,
      warehouse: product.warehouse,
      branch: product.warehouse,
      rack: product.rack || "-",
      shelf: product.shelf || "-",
      currentStock: product.stock,
      reorderLevel: product.reorderLevel ?? 0,
      status: productStockStatus(product.stock, product.reorderLevel ?? 0),
      stockValue: product.stock * product.purchasePrice,
    }));
  } catch (error) {
    console.warn("Falling back to mock warehouse products", error);
    return mockWarehouseProducts;
  }
}

export async function getWarehousesForPage(): Promise<Warehouse[]> {
  try {
    const products = await getWarehouseProductsForPage();
    if (products.length === 0) return mockWarehouses;
    return Array.from(new Set(products.map((product) => product.warehouse))).map((warehouseName, index) => {
      const warehouseProducts = products.filter((product) => product.warehouse === warehouseName);
      const lowStock = warehouseProducts.some((product) => product.status !== "Healthy");
      return {
        id: warehouseName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `warehouse-${index + 1}`,
        name: warehouseName,
        location: warehouseName,
        branch: warehouseProducts[0]?.branch ?? warehouseName,
        manager: "Inventory team",
        productCount: warehouseProducts.length,
        stockValue: warehouseProducts.reduce((sum, product) => sum + (product.stockValue ?? 0), 0),
        status: lowStock ? "Low stock" : "Active",
      };
    });
  } catch (error) {
    console.warn("Falling back to mock warehouses", error);
    return mockWarehouses;
  }
}

export async function getStockAdjustmentsForPage(): Promise<StockAdjustment[]> {
  try {
    const businessId = await getDemoBusinessId();
    if (!businessId) return mockStockAdjustments;
    const movements = await prisma.stockMovement.findMany({
      where: { businessId, type: { in: ["adjustment", "damage", "correction"] } },
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    if (movements.length === 0) return mockStockAdjustments;
    return movements.map((movement) => ({
      id: movement.reference ?? movement.id,
      product: movement.product.name,
      type: adjustmentType(movement.type, movement.quantity),
      quantity: Math.abs(movement.quantity),
      reason: movement.reason,
      warehouse: movement.product.warehouse,
      adjustedBy: movement.createdBy,
      date: formatDateTime(movement.createdAt),
      status: "Approved",
    }));
  } catch (error) {
    console.warn("Falling back to mock stock adjustments", error);
    return mockStockAdjustments;
  }
}

export async function getTransfersForPage(): Promise<StockTransfer[]> {
  try {
    const businessId = await getDemoBusinessId();
    if (!businessId) return mockStockTransfers;
    const movements = await prisma.stockMovement.findMany({
      where: { businessId, type: { in: ["transfer_in", "transfer_out"] } },
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    if (movements.length === 0) return mockStockTransfers;

    const groups = new Map<string, typeof movements>();
    for (const movement of movements) {
      const key = movement.reference ?? movement.id;
      groups.set(key, [...(groups.get(key) ?? []), movement]);
    }

    return Array.from(groups.entries()).map(([reference, group]) => {
      const out = group.find((movement) => movement.type === "transfer_out");
      const input = group.find((movement) => movement.type === "transfer_in");
      const movement = out ?? input ?? group[0];
      const reason = movement.reason;
      const from = reason.match(/from (.*?) to /i)?.[1] ?? "Source location";
      const to = reason.match(/ to (.*?)(?:\.|$)/i)?.[1] ?? "Destination location";
      return {
        id: reference,
        product: movement.product.name,
        quantity: Math.abs(out?.quantity ?? input?.quantity ?? movement.quantity),
        from,
        to,
        requestedBy: movement.createdBy,
        approvedBy: "System approved",
        date: formatDateTime(movement.createdAt),
        status: "Completed" as TransferStatus,
      };
    });
  } catch (error) {
    console.warn("Falling back to mock transfers", error);
    return mockStockTransfers;
  }
}

export async function getBranchesForPage(): Promise<Branch[]> {
  try {
    const businessId = await getDemoBusinessId();
    if (!businessId) return mockBranches;
    const dbBranches = await prisma.branch.findMany({
      where: { businessId },
      include: { users: true, products: true, sales: true },
      orderBy: { name: "asc" },
    });
    if (dbBranches.length === 0) return mockBranches;
    return dbBranches.map((branch) => ({
      id: branch.id,
      initials: initials(branch.name),
      name: branch.name,
      location: branch.location,
      manager: branch.managerName,
      phone: branch.phone,
      tills: Math.max(1, Math.ceil(branch.users.length / 3)),
      users: branch.users.length,
      stockValue: branch.products.reduce((sum, product) => sum + Number(product.purchasePrice) * product.stock, 0),
      salesToday: branch.sales.reduce((sum, sale) => sum + Number(sale.total), 0),
      status: branch.status as BranchStatus,
      focus: branch.name.includes("CBD") ? "General retail and supermarket sales" : "Distribution and supermarket stock",
    }));
  } catch (error) {
    console.warn("Falling back to mock branches", error);
    return mockBranches;
  }
}

export async function getUsersForPage(): Promise<StaffUser[]> {
  try {
    const businessId = await getDemoBusinessId();
    if (!businessId) return mockStaffUsers;
    const dbUsers = await prisma.user.findMany({
      where: { businessId },
      include: { branch: true },
      orderBy: { name: "asc" },
    });
    if (dbUsers.length === 0) return mockStaffUsers;
    return dbUsers.map((user) => ({
      id: user.id,
      initials: initials(user.name),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      branch: user.branch?.name ?? "All branches",
      till: user.role === "Cashier" ? "Till CBD-01" : user.role === "Business Owner" ? "All tills" : "Not assigned",
      lastLogin: formatDateTime(user.lastLoginAt),
      status: user.status as StaffStatus,
    }));
  } catch (error) {
    console.warn("Falling back to mock users", error);
    return mockStaffUsers;
  }
}

export async function getBusinessesForSuperAdmin(): Promise<PlatformBusiness[]> {
  try {
    const businesses = await prisma.business.findMany({
      include: {
        branches: true,
        users: true,
        subscriptions: { orderBy: { renewalDate: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "asc" },
    });
    if (businesses.length === 0) return mockPlatformBusinesses;
    return businesses.map((business, index) => {
      const owner = business.users.find((user) => user.role === "Business Owner") ?? business.users[0];
      const subscription = business.subscriptions[0];
      return {
        id: `BIZ-${String(index + 1).padStart(3, "0")}`,
        name: business.name,
        owner: owner?.name ?? "Owner not assigned",
        phone: business.phone,
        email: business.email,
        industry: business.industryMode,
        plan: subscription?.packagePlan ?? business.packagePlan,
        branches: business.branches.length,
        users: business.users.length,
        status: businessStatus(business.status),
        renewal: subscription ? formatDateTime(subscription.renewalDate) : "Not set",
      };
    });
  } catch (error) {
    console.warn("Falling back to mock platform businesses", error);
    return mockPlatformBusinesses;
  }
}
