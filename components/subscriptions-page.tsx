"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, ChevronRight, Crown, Gauge, ReceiptText } from "lucide-react";
import { packagePlans, planByName, type PlanConfig, type PlanName } from "@/lib/subscription-plans";

type UsageData = { label: string; used: number; limit: string; percent: number };
type PaymentHistory = { id: string; date: string; plan: string; period: string; method: string; amount: number; status: string };
type CurrentSubscription = {
  id: string | null;
  businessName: string;
  packagePlan: PlanName;
  status: string;
  startDate: string;
  renewalDate: string;
  amount: number;
  daysRemaining: number;
  plan: PlanConfig;
  usage: UsageData[];
  paymentHistory: PaymentHistory[];
};

function money(value: number) {
  return `Ksh ${new Intl.NumberFormat("en-KE").format(value)}`;
}

function inputDateFromDisplay(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    const fallback = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return fallback.toISOString().slice(0, 10);
  }
  return parsed.toISOString().slice(0, 10);
}

export function SubscriptionsPage() {
  const [subscription, setSubscription] = useState<CurrentSubscription | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanName>("Business");
  const [renewalDate, setRenewalDate] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSubscription = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/subscriptions/current");
      if (!response.ok) throw new Error("Failed to load subscription.");
      const json = (await response.json()) as { data: CurrentSubscription };
      setSubscription(json.data);
      setSelectedPlan(json.data.packagePlan);
      setRenewalDate(inputDateFromDisplay(json.data.renewalDate));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Subscription could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSubscription();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadSubscription]);

  async function savePlan(planName: PlanName) {
    const plan = planByName(planName);
    setSaving(true);
    setError("");
    setFeedback("");
    try {
      const response = await fetch("/api/subscriptions/current", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packagePlan: plan.name, amount: plan.price ?? 0, renewalDate }),
      });
      const json = (await response.json()) as { data?: CurrentSubscription; error?: string; message?: string };
      if (!response.ok) throw new Error(json.error ?? "Package could not be changed.");
      if (json.data) {
        setSubscription(json.data);
        setSelectedPlan(json.data.packagePlan);
        setRenewalDate(inputDateFromDisplay(json.data.renewalDate));
      }
      setFeedback(json.message ?? "Subscription updated.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Package could not be changed.");
    } finally {
      setSaving(false);
    }
  }

  const currentPlan = subscription?.plan ?? planByName(selectedPlan);
  const history = subscription?.paymentHistory ?? [];

  return (
    <div className="mx-auto max-w-[1700px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Billing and usage</p>
          <h2 className="mt-1 text-2xl font-black text-[#10271B] md:text-3xl">Subscriptions</h2>
          <p className="mt-1 text-sm text-[#789083]">Review your plan, usage limits and cloud subscription payments.</p>
          {error && <p className="mt-2 text-xs font-bold text-[#EF4444]">{error}</p>}
        </div>
        {feedback && <p className="rounded-xl bg-[#16A34A]/10 px-4 py-3 text-xs font-black text-[#0F8C42]">{feedback}</p>}
      </div>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="overflow-hidden rounded-2xl bg-[#0E2418] p-5 text-[#F6FFF8] shadow-lg shadow-[#12311F]/10">
          {loading ? <p className="text-sm font-bold text-[#B8C7BD]">Loading subscription...</p> : null}
          <div className="flex flex-col justify-between gap-5 sm:flex-row">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#D4A017]">Current plan</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#22C55E]/15 text-[#22C55E]"><Crown size={22} /></span>
                <div>
                  <h3 className="text-xl font-black">{currentPlan.name} Plan</h3>
                  <p className="mt-1 text-xs text-[#B8C7BD]">{subscription?.businessName ?? "Demo business"} - {subscription?.status ?? "active"}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 sm:min-w-56">
              <p className="text-[10px] font-black uppercase tracking-wider text-[#B8C7BD]">Renewal date</p>
              <p className="mt-1 text-sm font-black">{subscription?.renewalDate ?? "Not set"}</p>
              <p className="mt-1 text-[10px] text-[#22C55E]">{subscription?.daysRemaining ?? 0} days remaining</p>
              <p className="mt-1 text-[10px] text-[#B8C7BD]">Started: {subscription?.startDate ?? "Not set"}</p>
              <p className="mt-1 text-[10px] text-[#B8C7BD]">Monthly amount: {money(subscription?.amount ?? currentPlan.price ?? 0)}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
            <label>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#B8C7BD]">Renewal date</span>
              <input type="date" value={renewalDate} onChange={(event) => setRenewalDate(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-xs font-bold text-[#F6FFF8] outline-none" />
            </label>
            <button disabled={saving} onClick={() => savePlan(selectedPlan)} className="self-end rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white disabled:opacity-60">{saving ? "Saving..." : "Save selected package"}</button>
          </div>
        </article>

        <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#D4A017]/12 text-[#A57809]"><Gauge size={18} /></span><div><h3 className="font-black text-[#173324]">Usage limits</h3><p className="text-xs text-[#789083]">Current {currentPlan.name} Plan consumption.</p></div></div>
          <div className="mt-4 space-y-3">{(subscription?.usage ?? []).map((item) => <div key={item.label}><div className="flex justify-between text-[11px] font-bold"><span className="text-[#60766B]">{item.label}</span><span className="text-[#173324]">{item.used.toLocaleString()} / {item.limit}</span></div><div className="mt-1 h-2 overflow-hidden rounded-full bg-[#E8F0EA]"><div className={`h-full rounded-full ${item.percent >= 100 ? "bg-[#D4A017]" : "bg-[#16A34A]"}`} style={{ width: `${item.percent}%` }} /></div></div>)}</div>
        </article>
      </section>

      <section className="mt-5">
        <div><h3 className="font-black text-[#173324]">Choose a package</h3><p className="text-xs text-[#789083]">Select a package and save it. Payment billing is not implemented yet.</p></div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {packagePlans.map((plan) => {
            const isCurrent = subscription?.packagePlan === plan.name;
            const isSelected = selectedPlan === plan.name;
            return <article key={plan.name} className={`relative rounded-2xl border bg-white p-4 ${isSelected ? "border-[#16A34A] shadow-md shadow-[#16A34A]/10" : "border-[#DDEAE0]"}`}>{isCurrent && <span className="absolute right-3 top-3 rounded-full bg-[#16A34A]/10 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-[#0F8C42]">Current</span>}<h4 className="text-sm font-black text-[#173324]">{plan.name}</h4><p className="mt-3 text-lg font-black text-[#173324]">{plan.price === null ? "Quoted" : money(plan.price)}{plan.price !== null && <span className="text-[10px] text-[#789083]"> / month</span>}</p><p className="mt-2 min-h-10 text-[11px] leading-5 text-[#789083]">{plan.note}</p><div className="mt-3 space-y-2">{plan.limits.map((limit) => <p key={limit} className="flex gap-2 text-[10px] font-bold text-[#60766B]"><Check size={13} className="shrink-0 text-[#16A34A]" />{limit}</p>)}</div><button disabled={saving} onClick={() => { setSelectedPlan(plan.name); void savePlan(plan.name); }} className={`mt-4 flex w-full items-center justify-center gap-1 rounded-xl py-2.5 text-[11px] font-black ${isCurrent ? "bg-[#E8F0EA] text-[#60766B]" : "bg-[#16A34A] text-white"} disabled:opacity-60`}>{isCurrent ? "Current package" : plan.name === "Custom / Enterprise" ? "Select quoted plan" : "Choose plan"}<ChevronRight size={13} /></button></article>;
          })}
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white">
        <div className="flex items-center gap-3 border-b border-[#E8F0EA] p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#16A34A]/10 text-[#16A34A]"><ReceiptText size={18} /></span><div><h3 className="font-black text-[#173324]">Payment history</h3><p className="text-xs text-[#789083]">Subscription renewal records. Billing remains placeholder-only.</p></div></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead><tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-wider text-[#789083]">{["Payment ID", "Date", "Plan", "Billing period", "Method", "Amount", "Status"].map((h) => <th key={h} className="px-4 py-3.5">{h}</th>)}</tr></thead><tbody>{history.map((item) => <tr key={item.id} className="border-t border-[#EEF3EF] text-xs text-[#60766B]"><td className="px-4 py-3 font-black text-[#173324]">{item.id}</td><td className="px-4 py-3">{item.date}</td><td className="px-4 py-3">{item.plan}</td><td className="px-4 py-3">{item.period}</td><td className="px-4 py-3">{item.method}</td><td className="px-4 py-3 font-black text-[#173324]">{money(item.amount)}</td><td className="px-4 py-3"><span className="rounded-full bg-[#16A34A]/10 px-2.5 py-1 text-[10px] font-black text-[#0F8C42]">{item.status}</span></td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}
