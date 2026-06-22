export type PlanName = "Lite" | "Growth" | "Business" | "Enterprise";

export type PlanConfig = {
  name: PlanName;
  price: number | null;
  note: string;
  limits: string[];
  branchLimit: number | null;
  userLimit: number | null;
  productLimit: number | null;
  reportLimit: number | null;
};

export const packagePlans: PlanConfig[] = [
  {
    name: "Lite",
    price: 700,
    note: "For a small shop starting cloud POS",
    branchLimit: 1,
    userLimit: 2,
    productLimit: 100,
    reportLimit: 20,
    limits: ["1 branch", "2 users", "100 products", "Basic sales", "Products", "Basic customers", "Basic reports", "Manual Cash/M-Pesa/Bank recording"],
  },
  {
    name: "Growth",
    price: 1500,
    note: "For growing shops and restaurants",
    branchLimit: 1,
    userLimit: 3,
    productLimit: 500,
    reportLimit: 60,
    limits: ["1 branch", "3 users", "500 products", "Sales", "Stock", "Customers", "Debtors", "Expenses", "Purchases", "Suppliers", "Standard reports"],
  },
  {
    name: "Business",
    price: 3000,
    note: "For multi-team daily operations",
    branchLimit: 2,
    userLimit: 10,
    productLimit: 2000,
    reportLimit: 200,
    limits: ["2 branches", "10 users", "2,000 products", "Branches", "HRM/User roles", "Warehouse", "Transfers", "Party reports", "Tax settings", "Advanced reports"],
  },
  {
    name: "Enterprise",
    price: null,
    note: "Contact sales for advanced operations",
    branchLimit: null,
    userLimit: null,
    productLimit: null,
    reportLimit: null,
    limits: ["Custom branches", "Custom users", "Custom products", "Offline sync", "M-Pesa API", "eTIMS", "WhatsApp", "Custom workflows"],
  },
];

export function planByName(name: string): PlanConfig {
  return packagePlans.find((plan) => plan.name.toLowerCase() === name.toLowerCase()) ?? packagePlans[2];
}
