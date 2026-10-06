"use client";
export function trackMarketingEvent(name: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("leadsstacks:marketing", { detail: { name } }));
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (gtag && process.env.NEXT_PUBLIC_GA_ID) gtag("event", name);
}
