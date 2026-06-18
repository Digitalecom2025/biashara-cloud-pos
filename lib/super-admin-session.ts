"use client";

export type SuperAdminSession = {
  superAdminLoggedIn: true;
  email: string;
  token: string;
  loggedInAt: string;
};

const SUPER_ADMIN_SESSION_KEY = "leadsstacks.superAdminSession";

export function saveSuperAdminSession(session: SuperAdminSession) {
  window.sessionStorage.setItem(SUPER_ADMIN_SESSION_KEY, JSON.stringify(session));
}

export function getSuperAdminSession(): SuperAdminSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(SUPER_ADMIN_SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SuperAdminSession>;
    if (!parsed.superAdminLoggedIn || !parsed.email || !parsed.token) return null;
    return parsed as SuperAdminSession;
  } catch {
    return null;
  }
}

export function clearSuperAdminSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SUPER_ADMIN_SESSION_KEY);
  window.localStorage.removeItem(SUPER_ADMIN_SESSION_KEY);
}
