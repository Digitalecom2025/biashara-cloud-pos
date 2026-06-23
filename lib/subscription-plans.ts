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
    note: "All Lite features plus M-Pesa integration, advanced reports and AI.",
    summary: "Admin with 7 users, all features in Lite plus MPESA Integration, Advanced reports with AI.",
    branchLimit: 2,
    userLimit: 8,
    productLimit: 500,
    reportLimit: 80,
    limits: ["Admin + 7 users", "2 branches", "500 products", "Warehouse and transfers", "Rewards, HRM and AI"],
  },
  {
    name: "Business",
    price: 3000,
    note: "All Growth features plus CRM, eTIMS and ultra reports with AI.",
    summary: "Admin with 10 users, all features in Growth plus CRM, eTIMS and Ultra reports with AI.",
    branchLimit: null,
    userLimit: 11,
    productLimit: 1000,
    reportLimit: null,
    limits: ["Admin + 10 users", "Unlimited branches", "1,000 products", "Advanced HRM", "Ultra reports with AI"],
  },
  {
    name: "Enterprise",
    price: null,
    note: "All Business features plus lead capture, social chats and growth workflows.",
    summary: "Admin with unlimited users, all features in Business plus lead capturing, Integrated Social Media chats and growth-focused reports with AI.",
    branchLimit: null,
    userLimit: null,
    productLimit: null,
    reportLimit: null,
    limits: ["Unlimited users", "Unlimited branches", "Unlimited/custom products", "Custom workflows", "Integrated social media chats"],
  },
];

export function planByName(name: string): PlanConfig {
  const normalized = name === "Premium" ? "Business" : name === "Custom" || name === "Custom / Enterprise" ? "Enterprise" : name;
  return packagePlans.find((plan) => plan.name.toLowerCase() === normalized.toLowerCase()) ?? packagePlans[1];
}
