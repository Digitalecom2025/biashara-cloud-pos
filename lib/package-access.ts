export type PackageName = "Trial" | "Lite" | "Growth" | "Business" | "Enterprise";

export type PackageFeature =
  | "sales"
  | "warehouse"
  | "transfer"
  | "stock-adjustments"
  | "customers"
  | "suppliers"
  | "tax-settings"
  | "debtors"
  | "finance"
  | "rewards"
  | "subscriptions"
  | "hrm"
  | "reports"
  | "ai-assistant"
  | "sync-center"
  | "party-reports"
  | "sms-marketing"
  | "settings"
  | "products"
  | "purchases"
  | "branches"
  | "payment-types";

export type PackageLimitConfig = {
  name: PackageName;
  users: number | "Unlimited";
  branches: number | "Unlimited";
  products: number | "Unlimited";
  reports: string;
  summary: string;
  features: Record<PackageFeature, boolean>;
  featureNotes: Partial<Record<PackageFeature, string>>;
};

const liteFeatures: Record<PackageFeature, boolean> = {
  sales: true,
  warehouse: false,
  transfer: false,
  "stock-adjustments": true,
  customers: true,
  suppliers: true,
  "tax-settings": false,
  debtors: true,
  finance: true,
  rewards: false,
  subscriptions: true,
  hrm: false,
  reports: true,
  "ai-assistant": false,
  "sync-center": false,
  "party-reports": false,
  "sms-marketing": false,
  settings: true,
  products: true,
  purchases: true,
  branches: true,
  "payment-types": true,
};

const growthFeatures: Record<PackageFeature, boolean> = {
  ...liteFeatures,
  warehouse: true,
  transfer: true,
  "tax-settings": true,
  rewards: true,
  hrm: true,
  "ai-assistant": true,
  "sync-center": true,
  "party-reports": true,
  "sms-marketing": true,
};

const businessFeatures: Record<PackageFeature, boolean> = {
  ...growthFeatures,
};

export const packageAccess: Record<PackageName, PackageLimitConfig> = {
  Trial: {
    name: "Trial",
    users: 8,
    branches: 2,
    products: 500,
    reports: "Standard reports with AI",
    summary: "Trial defaults to Growth so users can test core POS, stock, finance and reporting workflows.",
    features: growthFeatures,
    featureNotes: {},
  },
  Lite: {
    name: "Lite",
    users: 6,
    branches: 1,
    products: 100,
    reports: "Basic reports",
    summary: "Admin with 5 users, basic features: POS, Inventory, Finance/Accounts & Standard Reports.",
    features: liteFeatures,
    featureNotes: {
      warehouse: "Warehouse helps you manage stock movement and storage across your business. Upgrade to Growth to unlock Warehouse.",
      transfer: "Transfer helps move stock between branches and warehouses. Upgrade to Growth to unlock Transfers.",
      "tax-settings": "Tax Settings help manage VAT, invoice prefixes and tax mode. Upgrade to Growth to unlock Tax Settings.",
      rewards: "Rewards help create loyalty rules for repeat customers. Upgrade to Growth to unlock Rewards.",
      hrm: "HRM helps manage staff, roles and branch assignments. Upgrade to Growth to unlock HRM.",
      "ai-assistant": "AI Assistant explains sales, stock, debtors and reports. Upgrade to Growth to unlock AI insights.",
      "sync-center": "Sync Centre manages offline sales syncing. Upgrade to Growth to unlock Sync Centre.",
      "party-reports": "Party Reports show customer and supplier balances and statements. Upgrade to Growth to unlock Party Reports.",
      "sms-marketing": "SMS Marketing helps send customer reminders and promotions. Upgrade to Growth to unlock SMS Marketing.",
    },
  },
  Growth: {
    name: "Growth",
    users: 8,
    branches: 2,
    products: 500,
    reports: "Active with standard reports",
    summary: "Admin with 7 users, all features in Lite plus MPESA Integration, Advanced reports with AI.",
    features: growthFeatures,
    featureNotes: {
      "ai-assistant": "AI Assistant is active with standard reporting on Growth.",
      "sms-marketing": "SMS Marketing is active on demand on Growth.",
    },
  },
  Business: {
    name: "Business",
    users: 11,
    branches: "Unlimited",
    products: 1000,
    reports: "Advanced reports such as staff performance reports",
    summary: "Admin with 10 users, all features in Growth plus CRM, eTIMS and Ultra reports with AI.",
    features: businessFeatures,
    featureNotes: {
      hrm: "HRM includes advanced features like leave and payroll on Business.",
      "ai-assistant": "AI Assistant is active with advanced insights on Business.",
      "sync-center": "Sync Centre is active for all main users and sub users on Business.",
      "party-reports": "Party Reports are active with advanced insights on Business.",
    },
  },
  Enterprise: {
    name: "Enterprise",
    users: "Unlimited",
    branches: "Unlimited",
    products: "Unlimited",
    reports: "Growth-focused reports with AI",
    summary: "Admin with unlimited users, all features in Business plus lead capturing, Integrated Social Media chats and growth-focused reports with AI.",
    features: businessFeatures,
    featureNotes: {
      customers: "Customers include lead generation, nurturing and funnels on Enterprise.",
      "ai-assistant": "AI is active with an active chat agent on Enterprise.",
    },
  },
};

export const featureLabels: Record<PackageFeature, string> = {
  sales: "Sales",
  warehouse: "Warehouse",
  transfer: "Transfer",
  "stock-adjustments": "Stock Adjustments",
  customers: "Customers",
  suppliers: "Suppliers",
  "tax-settings": "Tax Settings",
  debtors: "Due List / Debtors",
  finance: "Finance & Accounts",
  rewards: "Rewards",
  subscriptions: "Subscriptions",
  hrm: "HRM",
  reports: "Reports",
  "ai-assistant": "AI Assistant",
  "sync-center": "Sync Centre",
  "party-reports": "Party Reports",
  "sms-marketing": "SMS Marketing",
  settings: "Settings",
  products: "Products",
  purchases: "Purchases",
  branches: "Branches",
  "payment-types": "Payment Types",
};

export const routeFeatureMap: Record<string, PackageFeature> = {
  "/sales": "sales",
  "/warehouse": "warehouse",
  "/transfer": "transfer",
  "/stock-adjustments": "stock-adjustments",
  "/customers": "customers",
  "/suppliers": "suppliers",
  "/tax-settings": "tax-settings",
  "/debtors": "debtors",
  "/finance": "finance",
  "/rewards": "rewards",
  "/subscriptions": "subscriptions",
  "/hrm": "hrm",
  "/reports": "reports",
  "/ai-assistant": "ai-assistant",
  "/sync-center": "sync-center",
  "/party-reports": "party-reports",
  "/sms-marketing": "sms-marketing",
  "/settings": "settings",
  "/products": "products",
  "/purchases": "purchases",
  "/branches": "branches",
  "/payment-types": "payment-types",
};

export function normalizePackageName(plan?: string | null): PackageName {
  if (!plan || plan === "Trial" || plan === "Not sure yet") return "Growth";
  if (plan === "Premium") return "Business";
  if (plan === "Custom" || plan === "Custom / Enterprise") return "Enterprise";
  if (["Lite", "Growth", "Business", "Enterprise"].includes(plan)) return plan as PackageName;
  return "Growth";
}

export function getPackageAccess(plan?: string | null) {
  return packageAccess[normalizePackageName(plan)];
}

export function getUserLimit(plan?: string | null) {
  return getPackageAccess(plan).users;
}

export function getBranchLimit(plan?: string | null) {
  return getPackageAccess(plan).branches;
}

export function getProductLimit(plan?: string | null) {
  return getPackageAccess(plan).products;
}

export function isFeatureActive(plan: string | null | undefined, feature: PackageFeature) {
  return getPackageAccess(plan).features[feature] === true;
}

export function hasFeature(plan: string | null | undefined, feature: PackageFeature) {
  return isFeatureActive(plan, feature);
}

export function getLockedFeatureMessage(plan: string | null | undefined, feature: PackageFeature) {
  const access = getPackageAccess(plan);
  return access.featureNotes[feature] ?? `${featureLabels[feature]} is not included in ${access.name}. Upgrade to unlock this feature.`;
}

export function getUpgradeTarget(plan: string | null | undefined, feature: PackageFeature) {
  const order: PackageName[] = ["Lite", "Growth", "Business", "Enterprise"];
  const currentIndex = Math.max(order.indexOf(normalizePackageName(plan)), 0);
  return order.slice(currentIndex + 1).find((candidate) => packageAccess[candidate].features[feature]) ?? "Growth";
}
