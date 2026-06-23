export const subscriptionPlans = [
  { name: "Lite", price: 700, note: "Admin with 5 users, basic POS, inventory, finance/accounts and standard reports", limits: ["Admin + 5 users", "100 products", "1 branch", "Standard reports"], featured: false },
  { name: "Growth", price: 1500, note: "Admin with 7 users, Lite features plus M-Pesa integration and advanced reports with AI", limits: ["Admin + 7 users", "500 products", "2 branches", "Advanced reports"], featured: true },
  { name: "Business", price: 3000, note: "Admin with 10 users, Growth features plus CRM, eTIMS and ultra reports with AI", limits: ["Admin + 10 users", "1,000 products", "Unlimited branches", "Ultra reports"], featured: false },
  { name: "Enterprise", price: null, note: "Unlimited users with custom workflows, social chats and growth-focused reports with AI", limits: ["Unlimited users", "Custom workflows", "Unlimited branches", "Dedicated setup"], featured: false },
] as const;

export const subscriptionUsage = [
  { label: "Users", used: 7, limit: "15", percent: 47 },
  { label: "Products", used: 3248, limit: "10,000", percent: 32 },
  { label: "Branches", used: 6, limit: "5", percent: 100 },
  { label: "Reports", used: 48, limit: "Unlimited", percent: 36 },
];

export const subscriptionPayments = [
  { id: "SUB-2026-006", date: "02 Jun 2026", plan: "Business", period: "Jun 2026", method: "M-Pesa", amount: 3000, status: "Paid" },
  { id: "SUB-2026-005", date: "02 May 2026", plan: "Business", period: "May 2026", method: "M-Pesa", amount: 3000, status: "Paid" },
  { id: "SUB-2026-004", date: "02 Apr 2026", plan: "Business", period: "Apr 2026", method: "Bank", amount: 3000, status: "Paid" },
  { id: "SUB-2026-003", date: "02 Mar 2026", plan: "Growth", period: "Mar 2026", method: "M-Pesa", amount: 1500, status: "Paid" },
];

export const rewardCustomers = [
  { name: "Karibu Restaurant", phone: "0722 410 820", type: "Wholesale", points: 8420, redeemed: 2800, value: 5620, lastVisit: "Today, 10:42", status: "Active" },
  { name: "Beauty Shop Customer", phone: "0715 230 115", type: "Regular", points: 6380, redeemed: 1900, value: 4480, lastVisit: "Yesterday", status: "Active" },
  { name: "Wholesale Customer", phone: "0701 885 440", type: "Wholesale", points: 5140, redeemed: 1600, value: 3540, lastVisit: "30 May 2026", status: "Active" },
  { name: "Staff Meal Account", phone: "0790 662 810", type: "Company", points: 2310, redeemed: 900, value: 1410, lastVisit: "29 May 2026", status: "Paused" },
  { name: "Contractor Client", phone: "0733 912 006", type: "Company", points: 1890, redeemed: 500, value: 1390, lastVisit: "27 May 2026", status: "Active" },
];

export const rewardRules = [
  { title: "Standard purchase points", note: "Earn 1 point for every Ksh 100 spent", status: "Active" },
  { title: "Restaurant lunch boost", note: "Earn double points on weekday lunch orders", status: "Active" },
  { title: "Hardware bulk reward", note: "Award 500 bonus points above Ksh 50,000", status: "Draft" },
];

export const smsCustomerGroups = [
  { name: "All active customers", contacts: 1480, note: "Retail, wholesale and company accounts" },
  { name: "Customers with debt", contacts: 42, note: "Open or overdue invoice balances" },
  { name: "Loyalty members", contacts: 628, note: "Customers enrolled in rewards" },
  { name: "Wholesale customers", contacts: 86, note: "Bulk buyers across branches" },
];

export const smsTemplates = [
  { title: "Debt reminder SMS", audience: "Customers with debt", message: "Hello {customer}, your Biashara POS account balance is Ksh {balance}. Kindly settle by {due_date}. Thank you." },
  { title: "Promotion SMS", audience: "All active customers", message: "Biashara offer: enjoy selected deals this week at {branch}. Visit us today. Reply STOP to opt out." },
  { title: "Low stock alert SMS", audience: "Store managers", message: "Stock alert: {product} is below reorder level at {warehouse}. Current balance: {stock}." },
];

export const smsCampaigns = [
  { id: "SMS-260602-04", name: "June opening offers", type: "Promotion", audience: "All active customers", recipients: 1480, sent: 1458, createdBy: "James Mwangi", date: "02 Jun 2026, 08:15", status: "Sent" },
  { id: "SMS-260601-03", name: "Overdue invoice reminder", type: "Debt reminder", audience: "Customers with debt", recipients: 42, sent: 42, createdBy: "Grace Achieng", date: "01 Jun 2026, 16:40", status: "Sent" },
  { id: "SMS-260530-02", name: "Cosmetics loyalty offer", type: "Promotion", audience: "Loyalty members", recipients: 628, sent: 0, createdBy: "Mary Wanjiku", date: "30 May 2026, 11:25", status: "Draft" },
  { id: "SMS-260529-01", name: "Rice stock follow-up", type: "Low stock alert", audience: "Store managers", recipients: 6, sent: 6, createdBy: "Peter Otieno", date: "29 May 2026, 09:10", status: "Sent" },
];
