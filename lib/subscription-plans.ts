export type PlanName = "Lite" | "Growth" | "Business" | "Enterprise";

export type PlanConfig = {
  name: PlanName;
  price: number | null;
  note: string;
  summary: string;
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
    note: "Basic POS, inventory, finance/accounts and standard reports.",
    summary: "Admin with 5 users, basic features: POS, Inventory, Finance/Accounts & Standard Reports.",
    branchLimit: 1,
    userLimit: 6,
    productLimit: 100,
    reportLimit: 20,
    limits: ["Admin + 5 users", "1 branch", "100 products", "Sales and customers", "Finance and basic reports"],
  },
  {
    name: "Growth",
    price: 1500,
    note: "Everything in Lite with more users, branches and product capacity.",
    summary: "Admin with 7 users, plus warehouse transfers, rewards rules and staff management.",
    branchLimit: 2,
    userLimit: 8,
    productLimit: 500,
    reportLimit: 80,
    limits: ["Admin + 7 users", "2 branches", "500 products", "Warehouse and transfers", "Rewards rules and staff management"],
  },
  {
    name: "Business",
    price: 3000,
    note: "Everything in Growth with higher limits and wider operational access.",
    summary: "Admin with 10 users, more products, fleet access and extended reporting.",
    branchLimit: null,
    userLimit: 11,
    productLimit: 1000,
    reportLimit: null,
    limits: ["Admin + 10 users", "Unlimited branches", "1,000 products", "Fleet module", "Extended reports"],
  },
  {
    name: "Enterprise",
    price: null,
    note: "Custom limits, configuration support and tailored deployment help.",
    summary: "A tailored package for businesses that need custom capacity and setup support.",
    branchLimit: null,
    userLimit: null,
    productLimit: null,
    reportLimit: null,
    limits: ["Custom user limits", "Custom branch limits", "Custom product capacity", "Configuration support", "Tailored deployment support"],
  },
];

export function planByName(name: string): PlanConfig {
  const normalized = name === "Premium" ? "Business" : name === "Custom" || name === "Custom / Enterprise" ? "Enterprise" : name;
  return packagePlans.find((plan) => plan.name.toLowerCase() === normalized.toLowerCase()) ?? packagePlans[1];
}
