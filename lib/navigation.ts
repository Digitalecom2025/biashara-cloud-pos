export type SidebarItem = {
  label: string;
  href: string;
  icon: string;
};

export type SidebarGroup = {
  label: string;
  items: SidebarItem[];
  defaultOpen?: boolean;
};

export const dashboardItem: SidebarItem = {
  label: "Dashboard",
  href: "/dashboard",
  icon: "LayoutDashboard",
};

const operationsItems: SidebarItem[] = [
  {
    label: "Sales",
    href: "/sales",
    icon: "ShoppingCart",
  },
  {
    label: "Purchases",
    href: "/purchases",
    icon: "ShoppingBag",
  },
  {
    label: "Products",
    href: "/products",
    icon: "Package",
  },
  {
    label: "Warehouse",
    href: "/warehouse",
    icon: "Warehouse",
  },
  {
    label: "Transfer",
    href: "/transfer",
    icon: "ArrowLeftRight",
  },
  {
    label: "Stock Adjustments",
    href: "/stock-adjustments",
    icon: "SlidersHorizontal",
  },
  {
    label: "Fleet",
    href: "/fleet",
    icon: "Truck",
  },
];

const customerItems: SidebarItem[] = [
  {
    label: "Customers",
    href: "/customers",
    icon: "Users",
  },
  {
    label: "Suppliers",
    href: "/suppliers",
    icon: "Truck",
  },
  {
    label: "Due List / Debtors",
    href: "/debtors",
    icon: "HandCoins",
  },
  {
    label: "Rewards",
    href: "/rewards",
    icon: "Gift",
  },
];

const managementItems: SidebarItem[] = [
  {
    label: "Branches",
    href: "/branches",
    icon: "Store",
  },
  {
    label: "Finance & Accounts",
    href: "/finance",
    icon: "Landmark",
  },
  {
    label: "HRM",
    href: "/hrm",
    icon: "ContactRound",
  },
];

const analyticsItems: SidebarItem[] = [
  {
    label: "Reports",
    href: "/reports",
    icon: "ChartNoAxesCombined",
  },
  {
    label: "Party Reports",
    href: "/party-reports",
    icon: "Files",
  },
];

const growthItems: SidebarItem[] = [
  {
    label: "SMS Marketing",
    href: "/sms-marketing",
    icon: "MessageSquareText",
  },
  {
    label: "AI Assistant",
    href: "/ai-assistant",
    icon: "BrainCircuit",
  },
];

const systemItems: SidebarItem[] = [
  {
    label: "Tax Settings",
    href: "/tax-settings",
    icon: "ReceiptText",
  },
  {
    label: "Payment Types",
    href: "/payment-types",
    icon: "WalletCards",
  },
  {
    label: "Subscriptions",
    href: "/subscriptions",
    icon: "CalendarCheck",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: "Settings",
  },
  {
    label: "Sync Center",
    href: "/sync-center",
    icon: "RefreshCw",
  },
];

export const sidebarGroups: SidebarGroup[] = [
  {
    label: "Operations",
    items: operationsItems,
    defaultOpen: true,
  },
  {
    label: "Customers & Partners",
    items: customerItems,
  },
  {
    label: "Business Management",
    items: managementItems,
  },
  {
    label: "Analytics",
    items: analyticsItems,
  },
  {
    label: "Growth & Engagement",
    items: growthItems,
  },
  {
    label: "System",
    items: systemItems,
  },
];

/**
 * Keep this flat export because authentication, role access,
 * route labels and package-access logic already depend on it.
 */
export const sidebarItems: SidebarItem[] = [
  dashboardItem,
  ...sidebarGroups.flatMap((group) => group.items),
];