export type IndustryMode =
  | "Retail"
  | "Supermarket"
  | "Restaurant / Small Hotel"
  | "Cosmetics / Skin Care"
  | "Hardware"
  | "Auto Spares"
  | "Salon / Barber"
  | "Pharmacy / Chemist"
  | "Laundry"
  | "Car Wash"
  | "Wines & Spirits"
  | "Butchery"
  | "Agrovet"
  | "Other";

export type IndustryOpsConfig = {
  label: IndustryMode;
  dashboardTitle: string;
  demoFocus: string;
  productLabel: string;
  salesLabel: string;
  customerLabel: string;
  stockLabel: string;
  sampleCategories: string[];
  recommendedModules: string[];
  demoPainPoints: string[];
  demoBenefits: string[];
};

const shared = {
  recommendedModules: ["Sales", "Products", "Customers", "Reports", "Settings"],
  demoBenefits: ["Owner dashboard", "Sales tracking", "Stock visibility", "Clean reports"],
};

export const industryOpsModes: IndustryMode[] = [
  "Retail",
  "Supermarket",
  "Restaurant / Small Hotel",
  "Cosmetics / Skin Care",
  "Hardware",
  "Auto Spares",
  "Salon / Barber",
  "Pharmacy / Chemist",
  "Laundry",
  "Car Wash",
  "Wines & Spirits",
  "Butchery",
  "Agrovet",
  "Other",
];

export const industryOpsConfigs: Record<IndustryMode, IndustryOpsConfig> = {
  Retail: {
    label: "Retail",
    dashboardTitle: "Retail POS",
    demoFocus: "Built for daily retail sales, inventory tracking, customer accounts and owner reporting.",
    productLabel: "Products",
    salesLabel: "Counter Sales",
    customerLabel: "Customers",
    stockLabel: "Stock",
    sampleCategories: ["General Stock", "Household", "Beauty", "Food Items"],
    recommendedModules: ["Sales", "Products", "Customers", "Stock Adjustments", "Reports"],
    demoPainPoints: ["Manual sales books", "Stock count errors", "Customer debt confusion", "Daily closing delays"],
    demoBenefits: ["Fast counter sales", "Central stock", "Customer balances", "Owner dashboard"],
  },
  Supermarket: {
    label: "Supermarket",
    dashboardTitle: "Supermarket POS",
    demoFocus: "Built for multi-till sales, stock tracking, cashier reports and owner visibility.",
    productLabel: "Items",
    salesLabel: "Till Sales",
    customerLabel: "Customers",
    stockLabel: "Inventory",
    sampleCategories: ["Groceries", "Fresh Food", "Household", "Dairy", "Personal Care"],
    recommendedModules: ["Sales", "Products", "Warehouse", "Branches", "Reports", "Payment Types"],
    demoPainPoints: ["Multiple cashiers selling at once", "Stock confusion", "Cashier accountability", "M-Pesa/Cash reconciliation"],
    demoBenefits: ["Central stock", "4 tills connected", "Cashier reports", "Owner dashboard"],
  },
  "Restaurant / Small Hotel": {
    label: "Restaurant / Small Hotel",
    dashboardTitle: "Restaurant POS",
    demoFocus: "Built for menu sales, waiter/cashier tracking, food stock and daily restaurant reports.",
    productLabel: "Menu Items",
    salesLabel: "Food Sales",
    customerLabel: "Guests/Customers",
    stockLabel: "Food Stock",
    sampleCategories: ["Meals", "Drinks", "Takeaway", "Kitchen Stock"],
    recommendedModules: ["Sales", "Products", "Customers", "Due List / Debtors", "Reports"],
    demoPainPoints: ["Food debt tracking", "Waiter/cashier tracking", "Dine-in/takeaway", "Daily sales reports"],
    demoBenefits: ["Menu item reports", "Waiter accountability", "Debt follow-up", "Closing summaries"],
  },
  "Cosmetics / Skin Care": {
    label: "Cosmetics / Skin Care",
    dashboardTitle: "Cosmetics POS",
    demoFocus: "Built for beauty product sales, batch-style stock visibility and loyal customer tracking.",
    productLabel: "Cosmetic Products",
    salesLabel: "Beauty Sales",
    customerLabel: "Beauty Customers",
    stockLabel: "Product Stock",
    sampleCategories: ["Skin Oils", "Body Care", "Hair Care", "Beauty Accessories"],
    recommendedModules: ["Products", "Sales", "Rewards", "SMS Marketing", "Reports"],
    demoPainPoints: ["Fast-moving small items", "Customer repeat purchases", "Stockouts on popular products", "Promotion tracking"],
    demoBenefits: ["Product performance", "Loyalty tracking", "SMS promotions", "Low stock alerts"],
  },
  Hardware: {
    label: "Hardware",
    dashboardTitle: "Hardware POS",
    demoFocus: "Built for bulk stock, contractor accounts, supplier balances and branch warehouse visibility.",
    productLabel: "Hardware Items",
    salesLabel: "Hardware Sales",
    customerLabel: "Contractors/Customers",
    stockLabel: "Building Stock",
    sampleCategories: ["Cement", "Paint", "Tools", "Plumbing", "Electrical"],
    recommendedModules: ["Products", "Warehouse", "Purchases", "Suppliers", "Debtors", "Reports"],
    demoPainPoints: ["Bulk stock movement", "Contractor credit", "Supplier balances", "Warehouse confusion"],
    demoBenefits: ["Stock valuation", "Supplier tracking", "Debtor follow-up", "Branch reports"],
  },
  "Auto Spares": {
    label: "Auto Spares",
    dashboardTitle: "Auto Spares POS",
    demoFocus: "Built for part codes, vehicle-specific inventory, supplier purchases and credit customers.",
    productLabel: "Spare Parts",
    salesLabel: "Parts Sales",
    customerLabel: "Garage/Customers",
    stockLabel: "Parts Stock",
    sampleCategories: ["Brake Parts", "Filters", "Engine Parts", "Suspension", "Electrical"],
    recommendedModules: ["Products", "Sales", "Suppliers", "Warehouse", "Reports"],
    demoPainPoints: ["Part code lookup", "Slow-moving stock", "Garage credit", "Supplier ordering"],
    demoBenefits: ["Code-based search", "Stock control", "Garage balances", "Purchase history"],
  },
  "Salon / Barber": {
    label: "Salon / Barber",
    dashboardTitle: "Salon POS",
    demoFocus: "Built for service sales, product add-ons, staff tracking and repeat customers.",
    productLabel: "Services & Products",
    salesLabel: "Service Sales",
    customerLabel: "Clients",
    stockLabel: "Salon Stock",
    sampleCategories: ["Hair Services", "Products", "Accessories", "Treatments"],
    recommendedModules: ["Sales", "Customers", "Rewards", "HRM", "Reports"],
    demoPainPoints: ["Staff performance", "Repeat client tracking", "Product usage", "Daily cash control"],
    demoBenefits: ["Client history", "Staff reports", "Product stock", "Loyalty rewards"],
  },
  "Pharmacy / Chemist": {
    label: "Pharmacy / Chemist",
    dashboardTitle: "Pharmacy POS",
    demoFocus: "Built for medicine stock, low-stock alerts, counter sales and supplier purchases.",
    productLabel: "Medicines",
    salesLabel: "Pharmacy Sales",
    customerLabel: "Patients/Customers",
    stockLabel: "Medicine Stock",
    sampleCategories: ["OTC", "Prescription", "Supplements", "Personal Care"],
    recommendedModules: ["Products", "Sales", "Purchases", "Suppliers", "Reports"],
    demoPainPoints: ["Stock expiry follow-up", "Low stock medicines", "Supplier ordering", "Daily sales visibility"],
    demoBenefits: ["Medicine stock control", "Purchase records", "Sales reports", "Owner visibility"],
  },
  Laundry: {
    label: "Laundry",
    dashboardTitle: "Laundry POS",
    demoFocus: "Built for service orders, customer balances, payment tracking and daily reports.",
    productLabel: "Services",
    salesLabel: "Laundry Sales",
    customerLabel: "Laundry Customers",
    stockLabel: "Consumables",
    sampleCategories: ["Wash", "Iron", "Dry Clean", "Detergents"],
    recommendedModules: ["Sales", "Customers", "Reports", "Payment Types"],
    demoPainPoints: ["Order follow-up", "Customer balances", "Daily collections", "Service tracking"],
    demoBenefits: ["Service reports", "Customer history", "Payment tracking", "Owner dashboard"],
  },
  "Car Wash": {
    label: "Car Wash",
    dashboardTitle: "Car Wash POS",
    demoFocus: "Built for wash services, staff shifts, customer records and cash control.",
    productLabel: "Services",
    salesLabel: "Wash Sales",
    customerLabel: "Vehicle Customers",
    stockLabel: "Cleaning Stock",
    sampleCategories: ["Wash Services", "Detailing", "Accessories", "Cleaning Stock"],
    recommendedModules: ["Sales", "HRM", "Customers", "Reports"],
    demoPainPoints: ["Cash accountability", "Service counts", "Staff tracking", "Daily reports"],
    demoBenefits: ["Service totals", "Staff reports", "Customer history", "Cash control"],
  },
  "Wines & Spirits": {
    label: "Wines & Spirits",
    dashboardTitle: "Wines & Spirits POS",
    demoFocus: "Built for bottle stock, quick sales, cashier accountability and daily closing reports.",
    productLabel: "Bottles",
    salesLabel: "Bottle Sales",
    customerLabel: "Customers",
    stockLabel: "Bottle Stock",
    sampleCategories: ["Beer", "Wine", "Spirits", "Mixers"],
    recommendedModules: ["Sales", "Products", "Warehouse", "Reports"],
    demoPainPoints: ["Bottle stock loss", "Cashier accountability", "Fast checkout", "Daily reconciliation"],
    demoBenefits: ["Stock tracking", "Cashier reports", "Payment split", "Closing totals"],
  },
  Butchery: {
    label: "Butchery",
    dashboardTitle: "Butchery POS",
    demoFocus: "Built for meat sales, stock tracking, supplier purchases and customer balances.",
    productLabel: "Meat Items",
    salesLabel: "Butchery Sales",
    customerLabel: "Customers",
    stockLabel: "Meat Stock",
    sampleCategories: ["Beef", "Chicken", "Goat", "Sausages"],
    recommendedModules: ["Sales", "Products", "Purchases", "Suppliers", "Reports"],
    demoPainPoints: ["Daily stock tracking", "Supplier purchases", "Customer debt", "Sales reports"],
    demoBenefits: ["Stock value", "Supplier records", "Debt follow-up", "Daily sales"],
  },
  Agrovet: {
    label: "Agrovet",
    dashboardTitle: "Agrovet POS",
    demoFocus: "Built for farm inputs, supplier ordering, stock control and customer accounts.",
    productLabel: "Agrovet Items",
    salesLabel: "Agrovet Sales",
    customerLabel: "Farmers/Customers",
    stockLabel: "Farm Input Stock",
    sampleCategories: ["Feeds", "Seeds", "Fertilizer", "Animal Health"],
    recommendedModules: ["Products", "Sales", "Purchases", "Suppliers", "Debtors"],
    demoPainPoints: ["Seasonal stock", "Supplier balances", "Farmer credit", "Low stock alerts"],
    demoBenefits: ["Input stock control", "Supplier history", "Customer balances", "Reports"],
  },
  Other: {
    label: "Other",
    dashboardTitle: "General Business POS",
    demoFocus: "Built for sales, stock, customers, payments and business reporting.",
    productLabel: "Products",
    salesLabel: "Sales",
    customerLabel: "Customers",
    stockLabel: "Stock",
    sampleCategories: ["General", "Services", "Stock", "Accessories"],
    recommendedModules: shared.recommendedModules,
    demoPainPoints: ["Manual records", "Stock errors", "Payment tracking", "Report delays"],
    demoBenefits: shared.demoBenefits,
  },
};

export function normalizeIndustryMode(value?: string | null): IndustryMode {
  const clean = (value ?? "").trim().toLowerCase();
  return industryOpsModes.find((mode) => mode.toLowerCase() === clean) ?? "Retail";
}

export function getIndustryOpsConfig(value?: string | null): IndustryOpsConfig {
  return industryOpsConfigs[normalizeIndustryMode(value)];
}
