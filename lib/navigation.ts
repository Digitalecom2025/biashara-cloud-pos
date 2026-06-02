export type SidebarItem = {
  label: string;
  href: string;
  icon: string;
  platform?: boolean;
};

export const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", href: "/", icon: "LayoutDashboard" },
  { label: "Sales", href: "/sales", icon: "ShoppingCart" },
  { label: "Purchases", href: "/purchases", icon: "ShoppingBag" },
  { label: "Products", href: "/products", icon: "Package" },
  { label: "Warehouse", href: "/warehouse", icon: "Warehouse" },
  { label: "Transfer", href: "/transfer", icon: "ArrowLeftRight" },
  { label: "Branches", href: "/branches", icon: "Store" },
  { label: "Stock Adjustments", href: "/stock-adjustments", icon: "SlidersHorizontal" },
  { label: "Customers", href: "/customers", icon: "Users" },
  { label: "Suppliers", href: "/suppliers", icon: "Truck" },
  { label: "Tax Settings", href: "/tax-settings", icon: "ReceiptText" },
  { label: "Due List / Debtors", href: "/debtors", icon: "HandCoins" },
  { label: "Finance & Accounts", href: "/finance", icon: "Landmark" },
  { label: "Rewards", href: "/rewards", icon: "Gift" },
  { label: "Subscriptions", href: "/subscriptions", icon: "CalendarCheck" },
  { label: "HRM", href: "/hrm", icon: "ContactRound" },
  { label: "Reports", href: "/reports", icon: "ChartNoAxesCombined" },
  { label: "Party Reports", href: "/party-reports", icon: "Files" },
  { label: "SMS Marketing", href: "/sms-marketing", icon: "MessageSquareText" },
  { label: "Payment Types", href: "/payment-types", icon: "WalletCards" },
  { label: "Settings", href: "/settings", icon: "Settings" },
  { label: "Super Admin", href: "/super-admin", icon: "ShieldCheck", platform: true },
];
