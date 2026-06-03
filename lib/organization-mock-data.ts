export type BranchStatus = "Active" | "Inactive" | "Maintenance";
export type StaffStatus = "Active" | "Inactive" | "Suspended";

export type Branch = {
  id: string;
  initials: string;
  name: string;
  location: string;
  manager: string;
  phone: string;
  tills: number;
  users: number;
  stockValue: number;
  salesToday: number;
  status: BranchStatus;
  focus: string;
};

export type StaffUser = {
  id: string;
  initials: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  branch: string;
  till: string;
  lastLogin: string;
  status: StaffStatus;
};

export const branches: Branch[] = [
  { id: "main", initials: "MB", name: "Main Branch", location: "Industrial Area, Nairobi", manager: "John Kamau", phone: "0701 284 510", tills: 3, users: 8, stockValue: 2286400, salesToday: 84600, status: "Active", focus: "Distribution and supermarket stock" },
  { id: "cbd", initials: "NC", name: "Nairobi CBD Store", location: "Tom Mboya Street", manager: "James Mwangi", phone: "0712 550 184", tills: 4, users: 10, stockValue: 842300, salesToday: 126850, status: "Active", focus: "General retail and supermarket sales" },
  { id: "westlands", initials: "WB", name: "Westlands Branch", location: "Westlands Arcade", manager: "Amina Hassan", phone: "0728 440 912", tills: 2, users: 5, stockValue: 524600, salesToday: 48300, status: "Active", focus: "Cosmetics and beauty products" },
  { id: "restaurant", initials: "RB", name: "Restaurant Branch", location: "Nairobi CBD Restaurant", manager: "Faith Njeri", phone: "0733 108 647", tills: 2, users: 7, stockValue: 286500, salesToday: 62900, status: "Active", focus: "Food service and kitchen stock" },
  { id: "cosmetics", initials: "CS", name: "Cosmetics Store", location: "Biashara Street", manager: "Mary Wanjiku", phone: "0790 361 225", tills: 1, users: 3, stockValue: 418700, salesToday: 27450, status: "Maintenance", focus: "Seed oils and cosmetics retail" },
  { id: "auto", initials: "AS", name: "Auto Spares Branch", location: "Kirinyaga Road", manager: "Peter Otieno", phone: "0708 912 376", tills: 2, users: 4, stockValue: 756800, salesToday: 35800, status: "Inactive", focus: "Auto parts and workshop supplies" },
];

export const staffUsers: StaffUser[] = [
  { id: "james", initials: "JM", name: "James Mwangi", email: "james@biashara.co.ke", phone: "0712 550 184", role: "Business Owner", branch: "Main Branch", till: "All tills", lastLogin: "02 Jun 2026, 16:08", status: "Active" },
  { id: "mary", initials: "MW", name: "Mary Wanjiku", email: "mary@biashara.co.ke", phone: "0722 481 309", role: "Cashier", branch: "Cosmetics Store", till: "Till COS-01", lastLogin: "02 Jun 2026, 15:42", status: "Active" },
  { id: "john", initials: "JK", name: "John Kamau", email: "john@biashara.co.ke", phone: "0701 284 510", role: "Branch Manager", branch: "Main Branch", till: "Till MAIN-01", lastLogin: "02 Jun 2026, 15:31", status: "Active" },
  { id: "grace", initials: "GA", name: "Grace Achieng", email: "grace@biashara.co.ke", phone: "0738 505 920", role: "Accountant", branch: "Main Branch", till: "Not assigned", lastLogin: "02 Jun 2026, 14:20", status: "Active" },
  { id: "peter", initials: "PO", name: "Peter Otieno", email: "peter@biashara.co.ke", phone: "0708 912 376", role: "Stock Clerk", branch: "Auto Spares Branch", till: "Not assigned", lastLogin: "01 Jun 2026, 17:45", status: "Active" },
  { id: "faith", initials: "FN", name: "Faith Njeri", email: "faith@biashara.co.ke", phone: "0733 108 647", role: "Waiter", branch: "Restaurant Branch", till: "Till RST-02", lastLogin: "02 Jun 2026, 13:12", status: "Active" },
  { id: "tevin", initials: "TS", name: "Tevin Support", email: "support@biashara.co.ke", phone: "0799 204 661", role: "Support Staff", branch: "All branches", till: "Not assigned", lastLogin: "30 May 2026, 09:18", status: "Inactive" },
];

export const permissions = [
  "View dashboard", "Make sales", "Cancel/refund sales", "Add/edit products",
  "View buying price", "Manage stock", "Manage customers", "Record debt payments",
  "View reports", "Manage expenses", "Manage users", "Manage branches",
  "Change settings", "Download backups",
];

const all = permissions;
export const roles = [
  { name: "Business Administrator", users: 1, description: "Full business administration", permissions: all },
  { name: "Business Owner", users: 1, description: "Business-wide operational access", permissions: all },
  { name: "Branch Manager", users: 1, description: "Branch operations and staff oversight", permissions: all.filter((item) => !["Change settings", "Download backups"].includes(item)) },
  { name: "Cashier", users: 1, description: "Counter sales and customer service", permissions: ["View dashboard", "Make sales", "Manage customers", "Record debt payments"] },
  { name: "Stock Clerk", users: 1, description: "Inventory receiving and movement", permissions: ["View dashboard", "Add/edit products", "View buying price", "Manage stock"] },
  { name: "Accountant", users: 1, description: "Finance, debts and business reporting", permissions: ["View dashboard", "View buying price", "Record debt payments", "View reports", "Manage expenses", "Download backups"] },
  { name: "Waiter", users: 1, description: "Restaurant order entry", permissions: ["View dashboard", "Make sales", "Manage customers"] },
  { name: "Support Staff", users: 1, description: "Limited troubleshooting visibility", permissions: ["View dashboard", "View reports"] },
];
