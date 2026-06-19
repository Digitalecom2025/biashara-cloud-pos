import { sidebarItems, type SidebarItem } from "@/lib/navigation";

export type DemoRole = "admin" | "cashier" | "manager" | "stock" | "accountant";

export type DemoAccount = {
  role: DemoRole;
  name: string;
  email: string;
  password: string;
  title: string;
  branch: string;
  till: string;
  access: string[];
  allowedRoutes: string[];
};

export type DemoSession = {
  demoLoggedIn: true;
  demoUserRole: DemoRole;
  demoUserName: string;
  demoUserEmail: string;
  demoUserTitle: string;
  demoUserBranch: string;
  demoUserTill: string;
};

const DEMO_SESSION_KEY = "biashara.demoSession";
const BUSINESS_COOKIE = "biashara_business_id";
const SESSION_TYPE_COOKIE = "biashara_session_type";
const LEGACY_DEMO_AUTH_KEYS = [
  "demoLoggedIn",
  "demoUserRole",
  "demoUserName",
  "demoUserEmail",
  "demoUserTitle",
  "demoUserBranch",
  "demoUserTill",
];

const adminRoutes = sidebarItems.map((item) => item.href);

export const demoAccounts: DemoAccount[] = [
  {
    role: "admin",
    name: "James Mwangi",
    email: "admin@biasharapos.demo",
    password: "demo123",
    title: "Business Owner / Admin",
    branch: "All branches",
    till: "All tills",
    access: ["Full business dashboard", "Sales, stock and customers", "Finance, HRM and reports", "AI Assistant and Sync Center"],
    allowedRoutes: adminRoutes,
  },
  {
    role: "cashier",
    name: "Mary Wanjiku",
    email: "cashier@biasharapos.demo",
    password: "demo123",
    title: "Cashier",
    branch: "Nairobi CBD Store",
    till: "Till 1",
    access: ["Limited dashboard", "Sales/POS", "Customers", "Sync Center", "Limited reports"],
    allowedRoutes: ["/dashboard", "/sales", "/customers", "/sync-center", "/reports"],
  },
  {
    role: "manager",
    name: "John Kamau",
    email: "manager@biasharapos.demo",
    password: "demo123",
    title: "Branch Manager",
    branch: "Main Branch",
    till: "Branch office",
    access: ["Dashboard", "Sales", "Products and stock", "Customers and debtors", "Branch reports", "Sync Center"],
    allowedRoutes: ["/dashboard", "/sales", "/products", "/warehouse", "/stock-adjustments", "/transfer", "/customers", "/debtors", "/branches", "/reports", "/sync-center", "/ai-assistant"],
  },
  {
    role: "stock",
    name: "Peter Otieno",
    email: "stock@biasharapos.demo",
    password: "demo123",
    title: "Stock Clerk",
    branch: "Main Warehouse",
    till: "Inventory desk",
    access: ["Products", "Warehouse", "Stock adjustments", "Transfers", "Purchases", "Suppliers", "Limited reports"],
    allowedRoutes: ["/products", "/warehouse", "/stock-adjustments", "/transfer", "/purchases", "/suppliers", "/reports", "/sync-center"],
  },
  {
    role: "accountant",
    name: "Grace Achieng",
    email: "accounts@biasharapos.demo",
    password: "demo123",
    title: "Accountant",
    branch: "Finance office",
    till: "Accounts desk",
    access: ["Finance", "Reports", "Party reports", "Payment types", "Tax settings", "Debtors", "Purchases and suppliers"],
    allowedRoutes: ["/dashboard", "/finance", "/payment-types", "/tax-settings", "/reports", "/party-reports", "/customers", "/debtors", "/purchases", "/suppliers"],
  },
];

export const protectedClientRoutes = [
  "/dashboard",
  "/sales",
  "/products",
  "/customers",
  "/debtors",
  "/purchases",
  "/suppliers",
  "/warehouse",
  "/stock-adjustments",
  "/transfer",
  "/branches",
  "/hrm",
  "/finance",
  "/payment-types",
  "/tax-settings",
  "/reports",
  "/party-reports",
  "/rewards",
  "/subscriptions",
  "/settings",
  "/ai-assistant",
  "/sync-center",
  "/sms-marketing",
  "/supermarket-demo",
];

export function isProtectedClientRoute(pathname: string) {
  return protectedClientRoutes.includes(pathname);
}

export function findDemoAccount(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  return demoAccounts.find((account) => account.email === normalized && account.password === password);
}

export function createDemoSession(account: DemoAccount): DemoSession {
  return {
    demoLoggedIn: true,
    demoUserRole: account.role,
    demoUserName: account.name,
    demoUserEmail: account.email,
    demoUserTitle: account.title,
    demoUserBranch: account.branch,
    demoUserTill: account.till,
  };
}

export function saveDemoSession(session: DemoSession) {
  window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
  document.cookie = `${SESSION_TYPE_COOKIE}=demo; path=/; max-age=${60 * 60 * 24 * 14}; SameSite=Lax`;
  document.cookie = `${BUSINESS_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function getDemoSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(DEMO_SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<DemoSession>;
    if (!parsed.demoLoggedIn || !parsed.demoUserRole || !parsed.demoUserEmail) return null;
    return parsed as DemoSession;
  } catch {
    return null;
  }
}

export function clearDemoSession() {
  window.localStorage.removeItem(DEMO_SESSION_KEY);
  for (const key of LEGACY_DEMO_AUTH_KEYS) {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }
  window.sessionStorage.removeItem(DEMO_SESSION_KEY);
  document.cookie = `${SESSION_TYPE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function accountForRole(role: DemoRole) {
  return demoAccounts.find((account) => account.role === role) ?? demoAccounts[0];
}

export function canAccessRoute(pathname: string, role: DemoRole) {
  const account = accountForRole(role);
  return account.allowedRoutes.includes(pathname);
}

export function sidebarItemsForRole(role: DemoRole): SidebarItem[] {
  const account = accountForRole(role);
  return sidebarItems.filter((item) => account.allowedRoutes.includes(item.href));
}
