import { prisma } from "@/lib/prisma";
import { branches as mockBranches, staffUsers as mockStaffUsers, type Branch, type BranchStatus, type StaffStatus, type StaffUser } from "@/lib/organization-mock-data";
import { customers as mockCustomers, debtors as mockDebtors, type Customer, type CustomerStatus, type CustomerType, type Debtor } from "@/lib/customer-mock-data";
import { products as mockProducts, type Product } from "@/lib/mock-data";
import { platformBusinesses as mockPlatformBusinesses, type PlatformBusiness, type PlatformBusinessStatus } from "@/lib/platform-mock-data";

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
