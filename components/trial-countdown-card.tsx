"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, CalendarClock } from "lucide-react";
import { formatTrialEndDate, getTrialDaysRemaining, isTrialExpired } from "@/lib/trial";
import { getTrialPreview, type TrialPreviewSession } from "@/lib/trial-session";

export function TrialCountdownCard() {
  const [trial, setTrial] = useState<TrialPreviewSession | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setTrial(getTrialPreview());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!trial) return null;

  const expired = isTrialExpired(trial.trialEndsAt) || trial.status === "expired";
  const active = trial.status === "trial" && !expired;
  const days = getTrialDaysRemaining(trial.trialEndsAt);
  const endingSoon = active && days <= 3;

  return (
    <article className={`mb-5 rounded-2xl border p-5 shadow-sm shadow-[#12311F]/5 ${expired ? "border-[#EF4444]/25 bg-[#FFF1F1]" : endingSoon ? "border-[#D4A017]/35 bg-[#FFF9E8]" : "border-[#16A34A]/20 bg-[#16A34A]/[0.045]"}`}>
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="flex gap-3">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${expired ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#16A34A]/10 text-[#16A34A]"}`}>
            {expired ? <AlertTriangle size={20} /> : <CalendarClock size={20} />}
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.17em] text-[#16A34A]">14-day trial</p>
            <h3 className="mt-1 text-lg font-black text-[#173324]">{expired ? "Your trial has expired" : "Free Trial Active"}</h3>
            <p className="mt-1 text-xs leading-5 text-[#60766B]">
              {expired
                ? "Choose a package to continue using Biashara POS. Your trial data remains safe."
                : `${days} day${days === 1 ? "" : "s"} remaining for ${trial.businessName} on the ${trial.selectedPlan} package. Trial ends on ${formatTrialEndDate(trial.trialEndsAt)}.`}
            </p>
            {endingSoon && <p className="mt-2 text-xs font-black text-[#8A670C]">Your trial ends soon. Choose a package to continue using Biashara POS.</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/subscriptions" className="rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white hover:bg-[#12883E]">Change Package</Link>
          <Link href="/subscriptions" className="rounded-xl border border-[#16A34A]/30 bg-white px-4 py-3 text-xs font-black text-[#0F8C42] hover:bg-[#F8FBF8]">Choose Package</Link>
          <Link href="/#request-setup" className="rounded-xl border border-[#D4A017]/35 bg-white px-4 py-3 text-xs font-black text-[#8A670C] hover:bg-[#FFF9E8]">Talk to Support</Link>
        </div>
      </div>
    </article>
  );
}
