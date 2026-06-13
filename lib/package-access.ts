export type PackageName = "Trial" | "Lite" | "Growth" | "Business" | "Premium" | "Custom";

export type PackageLimitConfig = {
  name: PackageName;
  users: number | "Custom";
  branches: number | "Custom";
  products: number | "Custom";
  reports: string;
  offlineSync: string;
  aiInsights: string;
  lockedFeatures: string[];
};

export const packageAccess: Record<PackageName, PackageLimitConfig> = {
  Trial: {
    name: "Trial",
    users: 3,
    branches: 1,
    products: 100,
    reports: "Basic reports",
    offlineSync: "Preview/demo allowed",
    aiInsights: "Preview insights",
    lockedFeatures: ["SMS Marketing", "Rewards", "Advanced integrations", "M-Pesa API", "eTIMS"],
  },
  Lite: {
    name: "Lite",
    users: 2,
    branches: 1,
    products: 100,
    reports: "Basic reports",
    offlineSync: "Not included",
    aiInsights: "Not included",
    lockedFeatures: ["SMS Marketing", "Rewards", "Advanced integrations"],
  },
  Growth: {
    name: "Growth",
    users: 3,
    branches: 1,
    products: 500,
    reports: "Standard reports",
    offlineSync: "Selected demos",
    aiInsights: "Limited preview",
    lockedFeatures: ["SMS Marketing", "Rewards", "Advanced integrations"],
  },
  Business: {
    name: "Business",
    users: 10,
    branches: 2,
    products: 2000,
    reports: "Advanced reports",
    offlineSync: "Available on selected setup",
    aiInsights: "Preview insights",
    lockedFeatures: ["M-Pesa API", "eTIMS", "WhatsApp"],
  },
  Premium: {
    name: "Premium",
    users: 25,
    branches: 5,
    products: 10000,
    reports: "Advanced reports",
    offlineSync: "Included on selected setup",
    aiInsights: "Included",
    lockedFeatures: ["Custom workflows"],
  },
  Custom: {
    name: "Custom",
    users: "Custom",
    branches: "Custom",
    products: "Custom",
    reports: "Custom reporting",
    offlineSync: "Included",
    aiInsights: "Included",
    lockedFeatures: [],
  },
};

export function getPackageAccess(plan?: string | null) {
  const normalized = plan === "Custom / Enterprise" ? "Custom" : plan;
  return packageAccess[(normalized as PackageName) || "Trial"] ?? packageAccess.Trial;
}
