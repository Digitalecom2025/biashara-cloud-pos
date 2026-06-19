import { prisma } from "@/lib/prisma";
import { getBusinessContext } from "@/lib/db-data";

export type ProfileMetric = {
  label: string;
  value: string;
  tone?: "green" | "gold" | "red";
};

export type ProfileTransaction = {
  id: string;
  date: string;
  reference: string;
  description: string;
  amount: number;
  paid?: number;
  due?: number;
  status: string;
};

export type CustomerProfileData = {
  id: string;
  businessName: string;
  name: string;
  phone: string;
  email: string;
  type: string;
  status: string;
  createdAt: string;
  totalPurchases: number;
  outstandingDebt: number;
  paymentsMade: number;
  metrics: ProfileMetric[];
  recentSales: ProfileTransaction[];
  payments: ProfileTransaction[];
  notes: string[];
};

export type SupplierProfileData = {
  id: string;
  businessName: string;
  name: string;
  phone: string;
  email: string;
  category: string;
  status: string;
  createdAt: string;
  totalPurchases: number;
  balance: number;
  paymentsMade: number;
  metrics: ProfileMetric[];
  purchases: ProfileTransaction[];
  notes: string[];
};

export type BranchProfileData = {
  id: string;
  businessName: string;
  name: string;
  location: string;
  phone: string;
  managerName: string;
  status: string;
  createdAt: string;
  todaySales: number;
  cashSales: number;
  mpesaSales: number;
  creditSales: number;
  stockValue: number;
  lowStockCount: number;
  userCount: number;
  productCount: number;
  metrics: ProfileMetric[];
  users: Array<{ id: string; name: string; email: string; role: string; status: string }>;
  recentSales: ProfileTransaction[];
  lowStockProducts: Array<{ id: string; name: string; stock: number; reorderLevel: number; category: string }>;
  products: Array<{ id: string; name: string; category: string; stock: number; value: number; status: string }>;
};

export type ProductProfileData = {
  id: string;
  businessName: string;
  name: string;
  description: string;
  code: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  reorderLevel: number;
  warehouse: string;
  rack: string;
  shelf: string;
  status: string;
  stockValue: number;
  totalSold: number;
  salesValue: number;
  totalPurchased: number;
  metrics: ProfileMetric[];
  saleHistory: ProfileTransaction[];
  purchaseHistory: ProfileTransaction[];
  stockMovements: ProfileTransaction[];
};

function money(value: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(value);
}

function shortDate(value?: Date | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(value);
}

function dateTime(value?: Date | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function numberValue(value: unknown) {
  return Number(value ?? 0);
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

async function getBusinessScopedId() {
  const context = await getBusinessContext();
  return context.businessId;
}

export async function getCustomerProfile(id: string): Promise<CustomerProfileData | null> {
  const businessId = await getBusinessScopedId();
  if (!businessId) return null;

  const customer = await prisma.customer.findFirst({
    where: { id, businessId },
    include: {
      business: { select: { name: true } },
      sales: {
        orderBy: { createdAt: "desc" },
        include: { branch: true, cashier: true, payments: true },
        take: 20,
      },
      payments: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!customer) return null;

  const paymentsMade = customer.payments.reduce((sum, payment) => sum + numberValue(payment.amount), 0);
  const recentSales = customer.sales.map((sale) => ({
    id: sale.id,
    date: dateTime(sale.createdAt),
    reference: sale.invoiceNumber,
    description: `${sale.paymentMethod} sale by ${sale.cashier.name}`,
    amount: numberValue(sale.total),
    paid: numberValue(sale.paid),
    due: numberValue(sale.due),
    status: sale.status,
  }));

  return {
    id: customer.id,
    businessName: customer.business.name,
    name: customer.name,
    phone: customer.phone,
    email: customer.email ?? "No email added",
    type: customer.customerType,
    status: customer.status,
    createdAt: shortDate(customer.createdAt),
    totalPurchases: numberValue(customer.totalPurchases),
    outstandingDebt: numberValue(customer.debtBalance),
    paymentsMade,
    metrics: [
      { label: "Total purchases", value: money(numberValue(customer.totalPurchases)), tone: "green" },
      { label: "Outstanding debt", value: money(numberValue(customer.debtBalance)), tone: numberValue(customer.debtBalance) > 0 ? "red" : "green" },
      { label: "Payments made", value: money(paymentsMade), tone: "gold" },
      { label: "Sales count", value: `${customer.sales.length}`, tone: "green" },
    ],
    recentSales,
    payments: customer.payments.map((payment) => ({
      id: payment.id,
      date: dateTime(payment.createdAt),
      reference: payment.reference ?? payment.id.slice(0, 8).toUpperCase(),
      description: payment.paymentMethod,
      amount: numberValue(payment.amount),
      status: payment.status,
    })),
    notes: [
      customer.status === "active" ? "Customer account is active." : "Customer account is inactive.",
      numberValue(customer.debtBalance) > 0 ? "Follow up on outstanding balance." : "No outstanding customer balance.",
    ],
  };
}

export async function getSupplierProfile(id: string): Promise<SupplierProfileData | null> {
  const businessId = await getBusinessScopedId();
  if (!businessId) return null;

  const supplier = await prisma.supplier.findFirst({
    where: { id, businessId },
    include: {
      business: { select: { name: true } },
      purchases: { orderBy: { purchaseDate: "desc" }, include: { items: true }, take: 20 },
    },
  });
  if (!supplier) return null;

  const paymentsMade = supplier.purchases.reduce((sum, purchase) => sum + numberValue(purchase.paid), 0);

  return {
    id: supplier.id,
    businessName: supplier.business.name,
    name: supplier.name,
    phone: supplier.phone,
    email: supplier.email ?? "No email added",
    category: supplier.category,
    status: supplier.status,
    createdAt: shortDate(supplier.createdAt),
    totalPurchases: numberValue(supplier.totalPurchases),
    balance: numberValue(supplier.balance),
    paymentsMade,
    metrics: [
      { label: "Total purchases", value: money(numberValue(supplier.totalPurchases)), tone: "green" },
      { label: "Current balance", value: money(numberValue(supplier.balance)), tone: numberValue(supplier.balance) > 0 ? "red" : "green" },
      { label: "Paid through purchases", value: money(paymentsMade), tone: "gold" },
      { label: "Purchase count", value: `${supplier.purchases.length}`, tone: "green" },
    ],
    purchases: supplier.purchases.map((purchase) => ({
      id: purchase.id,
      date: dateTime(purchase.purchaseDate),
      reference: purchase.invoiceNumber,
      description: `${purchase.items.length} item${purchase.items.length === 1 ? "" : "s"} - ${purchase.paymentMethod}`,
      amount: numberValue(purchase.total),
      paid: numberValue(purchase.paid),
      due: numberValue(purchase.due),
      status: purchase.status,
    })),
    notes: [
      supplier.status === "active" ? "Supplier account is active." : "Supplier account is inactive.",
      "Supplier payments are currently recorded through purchase payments.",
    ],
  };
}

export async function getBranchProfile(id: string): Promise<BranchProfileData | null> {
  const businessId = await getBusinessScopedId();
  if (!businessId) return null;

  const branch = await prisma.branch.findFirst({
    where: { id, businessId },
    include: {
      business: { select: { name: true } },
      users: { orderBy: { createdAt: "desc" } },
      products: { orderBy: { name: "asc" } },
      sales: {
        orderBy: { createdAt: "desc" },
        include: { cashier: true, customer: true },
        take: 20,
      },
    },
  });
  if (!branch) return null;

  const today = startOfToday();
  const todaysSales = branch.sales.filter((sale) => sale.createdAt >= today);
  const todaySales = todaysSales.reduce((sum, sale) => sum + numberValue(sale.total), 0);
  const cashSales = todaysSales.filter((sale) => sale.paymentMethod.toLowerCase().includes("cash")).reduce((sum, sale) => sum + numberValue(sale.total), 0);
  const mpesaSales = todaysSales.filter((sale) => sale.paymentMethod.toLowerCase().includes("pesa")).reduce((sum, sale) => sum + numberValue(sale.total), 0);
  const creditSales = todaysSales.filter((sale) => sale.due && numberValue(sale.due) > 0).reduce((sum, sale) => sum + numberValue(sale.due), 0);
  const stockValue = branch.products.reduce((sum, product) => sum + product.stock * numberValue(product.purchasePrice), 0);
  const lowStockProducts = branch.products.filter((product) => product.stock <= product.reorderLevel);

  return {
    id: branch.id,
    businessName: branch.business.name,
    name: branch.name,
    location: branch.location,
    phone: branch.phone,
    managerName: branch.managerName || "Not assigned",
    status: branch.status,
    createdAt: shortDate(branch.createdAt),
    todaySales,
    cashSales,
    mpesaSales,
    creditSales,
    stockValue,
    lowStockCount: lowStockProducts.length,
    userCount: branch.users.length,
    productCount: branch.products.length,
    metrics: [
      { label: "Today sales", value: money(todaySales), tone: "green" },
      { label: "Cash sales", value: money(cashSales), tone: "green" },
      { label: "M-Pesa sales", value: money(mpesaSales), tone: "gold" },
      { label: "Credit sales", value: money(creditSales), tone: creditSales > 0 ? "red" : "green" },
      { label: "Stock value", value: money(stockValue), tone: "green" },
      { label: "Low stock items", value: `${lowStockProducts.length}`, tone: lowStockProducts.length > 0 ? "red" : "green" },
    ],
    users: branch.users.map((user) => ({ id: user.id, name: user.name, email: user.email, role: user.role, status: user.status })),
    recentSales: branch.sales.map((sale) => ({
      id: sale.id,
      date: dateTime(sale.createdAt),
      reference: sale.invoiceNumber,
      description: `${sale.customer?.name ?? "Walk-in Customer"} - ${sale.cashier.name}`,
      amount: numberValue(sale.total),
      paid: numberValue(sale.paid),
      due: numberValue(sale.due),
      status: sale.status,
    })),
    lowStockProducts: lowStockProducts.map((product) => ({
      id: product.id,
      name: product.name,
      stock: product.stock,
      reorderLevel: product.reorderLevel,
      category: product.category,
    })),
    products: branch.products.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      stock: product.stock,
      value: product.stock * numberValue(product.purchasePrice),
      status: product.status,
    })),
  };
}

export async function getProductProfile(id: string): Promise<ProductProfileData | null> {
  const businessId = await getBusinessScopedId();
  if (!businessId) return null;

  const product = await prisma.product.findFirst({
    where: { id, businessId },
    include: {
      business: { select: { name: true } },
      saleItems: { orderBy: { createdAt: "desc" }, include: { sale: true }, take: 20 },
      purchaseItems: { orderBy: { createdAt: "desc" }, include: { purchase: { include: { supplier: true } } }, take: 20 },
      stockMovements: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!product) return null;

  const totalSold = product.saleItems.reduce((sum, item) => sum + item.quantity, 0);
  const salesValue = product.saleItems.reduce((sum, item) => sum + numberValue(item.total), 0);
  const totalPurchased = product.purchaseItems.reduce((sum, item) => sum + item.quantity, 0);
  const stockValue = product.stock * numberValue(product.purchasePrice);

  return {
    id: product.id,
    businessName: product.business.name,
    name: product.name,
    description: product.description,
    code: product.code,
    sku: product.sku ?? "-",
    barcode: product.barcode ?? "-",
    category: product.category,
    brand: product.brand ?? "-",
    unit: product.unit,
    purchasePrice: numberValue(product.purchasePrice),
    salePrice: numberValue(product.salePrice),
    stock: product.stock,
    reorderLevel: product.reorderLevel,
    warehouse: product.warehouse,
    rack: product.rack ?? "-",
    shelf: product.shelf ?? "-",
    status: product.status,
    stockValue,
    totalSold,
    salesValue,
    totalPurchased,
    metrics: [
      { label: "Current stock", value: `${product.stock} ${product.unit}`, tone: product.stock <= product.reorderLevel ? "red" : "green" },
      { label: "Stock value", value: money(stockValue), tone: "green" },
      { label: "Sold quantity", value: `${totalSold}`, tone: "gold" },
      { label: "Sales value", value: money(salesValue), tone: "green" },
    ],
    saleHistory: product.saleItems.map((item) => ({
      id: item.id,
      date: dateTime(item.sale.createdAt),
      reference: item.sale.invoiceNumber,
      description: `${item.quantity} ${product.unit} sold`,
      amount: numberValue(item.total),
      status: item.sale.status,
    })),
    purchaseHistory: product.purchaseItems.map((item) => ({
      id: item.id,
      date: dateTime(item.purchase.purchaseDate),
      reference: item.purchase.invoiceNumber,
      description: `${item.quantity} ${product.unit} from ${item.purchase.supplier.name}`,
      amount: numberValue(item.total),
      status: item.purchase.status,
    })),
    stockMovements: product.stockMovements.map((movement) => ({
      id: movement.id,
      date: dateTime(movement.createdAt),
      reference: movement.reference ?? movement.id.slice(0, 8).toUpperCase(),
      description: `${movement.type}: ${movement.reason}`,
      amount: movement.quantity,
      status: movement.createdBy,
    })),
  };
}

