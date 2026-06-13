"use client";

export type TrialPreviewSession = {
  businessId: string;
  businessName: string;
  fullName: string;
  selectedPlan: string;
  status: "trial" | "active" | "expired";
  trialStartedAt: string;
  trialEndsAt: string;
};

const TRIAL_SESSION_KEY = "biashara.trialPreview";

export function saveTrialPreview(session: TrialPreviewSession) {
  window.localStorage.setItem(TRIAL_SESSION_KEY, JSON.stringify(session));
}

export function getTrialPreview(): TrialPreviewSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(TRIAL_SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<TrialPreviewSession>;
    if (!parsed.businessId || !parsed.businessName || !parsed.trialEndsAt) return null;
    return parsed as TrialPreviewSession;
  } catch {
    return null;
  }
}

export function updateTrialPreview(updates: Partial<TrialPreviewSession>) {
  const current = getTrialPreview();
  if (!current) return null;
  const next = { ...current, ...updates };
  saveTrialPreview(next);
  return next;
}
