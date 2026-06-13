export type PlatformBusinessStatus = "Active" | "Trial" | "Suspended" | "Expired";

export type PlatformBusiness = {
  id: string;
  name: string;
  owner: string;
  phone: string;
  email: string;
  industry: string;
  plan: string;
  branches: number;
  users: number;
  status: PlatformBusinessStatus;
  renewal: string;
  contactPerson?: string;
  businessType?: string;
  trialStart?: string;
  trialEnd?: string;
  daysRemaining?: number;
  selectedPlan?: string;
};

export const platformBusinesses: PlatformBusiness[] = [
  { id: "BIZ-001", name: "Greenview Supermarket", owner: "Alice Njeri", phone: "0712 450 821", email: "accounts@greenview.co.ke", industry: "Supermarket", plan: "Business", branches: 4, users: 18, status: "Active", renewal: "12 Jun 2026" },
  { id: "BIZ-002", name: "Sherrie Baby Shop", owner: "Sherrie Wambui", phone: "0724 119 305", email: "sherrie@babyshop.co.ke", industry: "Retail", plan: "Growth", branches: 2, users: 6, status: "Trial", renewal: "09 Jun 2026" },
  { id: "BIZ-003", name: "Radiance Seed Oils", owner: "David Muriuki", phone: "0701 882 461", email: "admin@radianceseedoils.co.ke", industry: "Cosmetics", plan: "Business", branches: 3, users: 11, status: "Active", renewal: "02 Jul 2026" },
  { id: "BIZ-004", name: "Kamau Auto Spares", owner: "John Kamau", phone: "0733 762 510", email: "kamau@autospares.co.ke", industry: "Auto Spares", plan: "Premium", branches: 5, users: 22, status: "Active", renewal: "18 Jun 2026" },
  { id: "BIZ-005", name: "Nairobi Hardware Supplies", owner: "Peter Kariuki", phone: "0798 241 770", email: "sales@nairobihardware.co.ke", industry: "Hardware", plan: "Business", branches: 3, users: 13, status: "Suspended", renewal: "28 May 2026" },
  { id: "BIZ-006", name: "Karibu Restaurant", owner: "Faith Achieng", phone: "0722 410 820", email: "manager@kariburestaurant.co.ke", industry: "Restaurant / Small Hotel", plan: "Growth", branches: 2, users: 9, status: "Active", renewal: "24 Jun 2026" },
  { id: "BIZ-007", name: "Elite Salon & Barber", owner: "Mercy Atieno", phone: "0715 609 114", email: "hello@elitesalon.co.ke", industry: "Salon / Barber", plan: "Lite", branches: 1, users: 3, status: "Expired", renewal: "30 May 2026" },
  { id: "BIZ-008", name: "QuickWash Laundry", owner: "Kevin Otieno", phone: "0708 334 281", email: "admin@quickwash.co.ke", industry: "Laundry", plan: "Growth", branches: 2, users: 5, status: "Trial", renewal: "14 Jun 2026" },
];

export const platformPayments = [
  { id: "PAY-260602-08", business: "Radiance Seed Oils", plan: "Business", period: "Jun 2026", method: "M-Pesa", amount: 3000, date: "02 Jun 2026, 09:14", status: "Paid" },
  { id: "PAY-260601-07", business: "Kamau Auto Spares", plan: "Premium", period: "Jun 2026", method: "Bank", amount: 5000, date: "01 Jun 2026, 15:42", status: "Paid" },
  { id: "PAY-260531-06", business: "Greenview Supermarket", plan: "Business", period: "Jun 2026", method: "M-Pesa", amount: 3000, date: "31 May 2026, 11:05", status: "Paid" },
  { id: "PAY-260530-05", business: "Elite Salon & Barber", plan: "Lite", period: "Jun 2026", method: "M-Pesa", amount: 700, date: "30 May 2026, 08:22", status: "Failed" },
  { id: "PAY-260529-04", business: "Karibu Restaurant", plan: "Growth", period: "Jun 2026", method: "M-Pesa", amount: 1500, date: "29 May 2026, 17:36", status: "Paid" },
];

export const industryModes = [
  { name: "Retail", businesses: 18, note: "General shops and specialized retail outlets" },
  { name: "Supermarket", businesses: 12, note: "Barcode-led grocery and household retail" },
  { name: "Restaurant / Small Hotel", businesses: 15, note: "Food service, kitchen and waiter workflows" },
  { name: "Cosmetics", businesses: 9, note: "Beauty products and personal care inventory" },
  { name: "Hardware", businesses: 7, note: "Construction supplies and bulk stock" },
  { name: "Auto Spares", businesses: 6, note: "Vehicle parts catalog and rack tracking" },
  { name: "Salon / Barber", businesses: 8, note: "Services, products and customer appointments" },
  { name: "Pharmacy", businesses: 4, note: "Health retail mode placeholder" },
  { name: "Laundry", businesses: 5, note: "Service order and collection tracking" },
  { name: "Car Wash", businesses: 3, note: "Vehicle service workflow placeholder" },
  { name: "Wines & Spirits", businesses: 6, note: "Beverage stock and till operations" },
];

export const supportLogs = [
  { id: "SUP-1042", business: "Nairobi Hardware Supplies", contacted: "Today, 09:20", issue: "Billing follow-up", owner: "Nancy Support", status: "Open", note: "Suspension review pending payment confirmation." },
  { id: "SUP-1041", business: "Sherrie Baby Shop", contacted: "Yesterday, 15:45", issue: "Trial onboarding", owner: "Moses Admin", status: "In progress", note: "Owner requested product import guidance." },
  { id: "SUP-1040", business: "Kamau Auto Spares", contacted: "30 May 2026", issue: "Branch setup", owner: "Tevin Technical", status: "Resolved", note: "Added guidance for fifth branch till assignment." },
  { id: "SUP-1039", business: "Elite Salon & Barber", contacted: "29 May 2026", issue: "Renewal reminder", owner: "Nancy Support", status: "Open", note: "Account expired after failed M-Pesa renewal." },
  { id: "SUP-1038", business: "Radiance Seed Oils", contacted: "28 May 2026", issue: "Report question", owner: "Moses Admin", status: "Resolved", note: "Explained stock report filters." },
];

export const platformAdmins = [
  { name: "James Mwangi", initials: "JM", email: "james@leadsstacks.co.ke", phone: "0712 000 110", role: "Super Admin", lastLogin: "Today, 10:18", status: "Active" },
  { name: "Nancy Support", initials: "NS", email: "nancy@leadsstacks.co.ke", phone: "0712 000 220", role: "Support Admin", lastLogin: "Today, 09:52", status: "Active" },
  { name: "Grace Billing", initials: "GB", email: "grace@leadsstacks.co.ke", phone: "0712 000 330", role: "Billing Admin", lastLogin: "Yesterday, 17:40", status: "Active" },
  { name: "Tevin Technical", initials: "TT", email: "tevin@leadsstacks.co.ke", phone: "0712 000 440", role: "Technical Admin", lastLogin: "Today, 08:36", status: "Active" },
];
