"use client";

import { sidebarItems, type SidebarItem } from "@/lib/navigation";

export type BusinessSession = {
  businessLoggedIn: true;
  userId: string;
  businessId: string;
  businessName: string;
  businessStatus: string;
  userName: string;
  userEmail: string;
  userRole: string;
  branchName: string;
  till: string;
  subscriptionStatus: string;
  packagePlan: string;
  selectedPlan?: string | null;
  trialEndsAt?: string | null;
  trialDaysRemaining: number;
  permissions: string[];
};

const BUSINESS_SESSION_KEY = "biashara.businessSession";

export function saveBusinessSession(session: BusinessSession) {
  window.localStorage.setItem(BUSINESS_SESSION_KEY, JSON.stringify(session));
}

export function getBusinessSession(): BusinessSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(BUSINESS_SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<BusinessSession>;
    if (!parsed.businessLoggedIn || !parsed.userId || !parsed.businessId || !parsed.userEmail) return null;
    return parsed as BusinessSession;
  } catch {
    return null;
  }
}

export function clearBusinessSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(BUSINESS_SESSION_KEY);
  window.sessionStorage.removeItem(BUSINESS_SESSION_KEY);
}

export function sidebarItemsForBusinessRole(role?: string | null): SidebarItem[] {
  const normalized = role?.toLowerCase() ?? "";
  if (normalized.includes("cashier")) {
    const allowed = new Set(["/dashboard", "/sales", "/customers", "/sync-center", "/reports"]);
    return sidebarItems.filter((item) => allowed.has(item.href));
  }
  if (normalized.includes("stock")) {
    const allowed = new Set(["/products", "/warehouse", "/stock-adjustments", "/transfer", "/purchases", "/suppliers", "/reports", "/sync-center"]);
    return sidebarItems.filter((item) => allowed.has(item.href));
  }
  if (normalized.includes("accountant")) {
    const allowed = new Set(["/dashboard", "/finance", "/payment-types", "/tax-settings", "/reports", "/party-reports", "/customers", "/debtors", "/purchases", "/suppliers", "/subscriptions"]);
    return sidebarItems.filter((item) => allowed.has(item.href));
  }
  return sidebarItems;
}

export function canBusinessAccessRoute(pathname: string, role?: string | null) {
  return sidebarItemsForBusinessRole(role).some((item) => item.href === pathname);
}
