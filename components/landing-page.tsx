"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  Cloud,
  CreditCard,
  Crown,
  Hammer,
  Leaf,
  Pill,
  Settings,
  ShieldCheck,
  ShoppingBasket,
  ShoppingCart,
  Sparkles,
  Store,
  TrendingUp,
  Utensils,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const trustBullets = [
  "Sales, stock, customers and debtors",
  "Cloud access from phone, tablet and computer",
  "Reports for owners and managers",
  "Packages for small and growing businesses",
  "Guided setup available",
];

const featureHighlights: Array<{
  title: string;
  note: string;
  icon: LucideIcon;
  visualLabel: string;
  stats: string[];
}> = [
  {
    title: "Sales & Stock",
    note: "Run fast checkout, track product movement and know when stock is running low.",
    icon: ShoppingCart,
    visualLabel: "Sales and stock visual with cart, product box and inventory cards",
    stats: ["POS checkout", "Stock levels", "Low stock alerts"],
  },
  {
    title: "Customers & Debtors",
    note: "Keep customer records, monitor balances and follow up on debt without manual books.",
    icon: Users,
    visualLabel: "Customer profile, receipt and debtor ledger visual",
    stats: ["Customer profiles", "Debt balances", "Payment history"],
  },
  {
    title: "Reports",
    note: "See daily sales, product performance, payments, expenses and business summaries.",
    icon: BarChart3,
    visualLabel: "Daily sales report and analytics chart visual",
    stats: ["Sales reports", "Stock reports", "Owner summaries"],
  },
  {
    title: "Cloud Access",
    note: "Monitor your business from your phone, tablet or computer while staff continue selling.",
    icon: Cloud,
    visualLabel: "Phone, laptop and cloud access visual",
    stats: ["Remote view", "Branch visibility", "Secure access"],
  },
];

const industries: Array<{
  title: string;
  note: string;
  bestFor: string;
  icon: LucideIcon;
}> = [
  {
    title: "Restaurant / Cafe",
    note: "Track orders, sales, payments, customers and daily reports.",
    bestFor: "Food service",
    icon: Utensils,
  },
  {
    title: "Hardware Store",
    note: "Manage stock, suppliers, purchases, sales and customer balances.",
    bestFor: "Building supplies",
    icon: Hammer,
  },
  {
    title: "Mini-mart / Retail Shop",
    note: "Sell faster, track products, view stock and monitor daily sales.",
    bestFor: "Daily retail",
    icon: ShoppingBasket,
  },
  {
    title: "Cosmetics / Beauty Shop",
    note: "Manage product variations, stock levels, customers and sales reports.",
    bestFor: "Beauty products",
    icon: Sparkles,
  },
  {
    title: "Pharmacy / Chemist",
    note: "Track products, stock movement, sales and low-stock items.",
    bestFor: "Health retail",
    icon: Pill,
  },
  {
    title: "Auto Spares",
    note: "Manage parts, stock, supplier purchases and customer payments.",
    bestFor: "Vehicle parts",
    icon: Wrench,
  },
  {
    title: "Agrovet / Supplies",
    note: "Track products, stock, suppliers and customer purchases.",
    bestFor: "Agro supplies",
    icon: Leaf,
  },
];

const packages: Array<{
  name: string;
  price: string;
  note: string;
  bestFor: string;
  icon: LucideIcon;
  recommended?: boolean;
}> = [
  {
    name: "Lite",
    price: "Ksh 700/month",
    note: "Basic sales and stock tracking for simple business operations.",
    bestFor: "Small businesses starting with basic sales and stock tracking.",
    icon: Store,
  },
  {
    name: "Growth",
    price: "Ksh 1,500/month or Ksh 4,500 quarterly",
    note: "Customers, debtors, suppliers, purchases and reports for growing teams.",
    bestFor: "Small shops, restaurants and hardware stores that need customers, debtors, suppliers and reports.",
    icon: TrendingUp,
    recommended: true,
  },
  {
    name: "Business",
    price: "Ksh 3,000/month",
    note: "Staff roles, branches, stock movement and advanced reporting controls.",
    bestFor: "Businesses with staff, roles, branches, stock movement and advanced reports.",
    icon: Users,
  },
  {
    name: "Premium",
    price: "Ksh 5,000/month",
    note: "More users, priority support and advanced business controls.",
    bestFor: "Businesses that need more users, priority support and advanced controls.",
    icon: Crown,
  },
  {
    name: "Custom / Enterprise",
    price: "Quoted",
    note: "Special workflows, custom setup and selected advanced integrations.",
    bestFor: "Businesses that need special workflows, integrations or custom setup.",
    icon: Settings,
  },
];

const freeTrialBullets = [
  "No payment required",
  "Start with your products, users and payment methods",
  "Test sales, stock, customers, debtors and reports",
  "Choose Lite, Growth, Business, Premium or Custom later",
];

const businessTypes = [
  "Retail Shop",
  "Mini-mart / Supermarket",
  "Restaurant / Cafe",
  "Hardware Store",
  "Cosmetics / Beauty Shop",
  "Auto Spares",
  "Pharmacy / Chemist",
  "Agrovet / Supplies",
  "Other",
];

function signupHref(packageName: string) {
  const normalized = packageName === "Custom / Enterprise" ? "Custom" : packageName;
  return `/signup?package=${encodeURIComponent(normalized)}`;
}

export function LandingPage() {
  const [form, setForm] = useState({
    fullName: "",
    businessName: "",
    phone: "",
    email: "",
    businessType: "",
    usersCount: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  async function submitSetupRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setFeedback("");
    setError("");
    try {
      const response = await fetch("/api/demo-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to submit request.");
      setFeedback(payload.message ?? "Thank you. We'll contact you shortly to help with your POS setup.");
      setForm({ fullName: "", businessName: "", phone: "", email: "", businessType: "", usersCount: "", message: "" });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen scroll-smooth bg-[#F5FAF6] text-[#173324]">
      <header className="sticky top-0 z-50 border-b border-[#DDEAE0] bg-white/92 backdrop-blur">
        <nav className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-4 py-4 md:px-7">
          <Link href="/" className="flex items-center gap-3" aria-label="LeadsStacks POS home">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#16A34A] text-sm font-black text-white shadow-lg shadow-[#16A34A]/20">LS</span>
            <span>
              <span className="block text-sm font-black tracking-wide">LEADSSTACKS</span>
              <span className="block text-[10px] font-black uppercase tracking-[0.25em] text-[#D4A017]">POS</span>
            </span>
          </Link>
          <div className="hidden items-center gap-5 text-xs font-black text-[#60766B] lg:flex">
            <a href="#features" className="hover:text-[#16A34A]">Features</a>
            <a href="#industryops" className="hover:text-[#16A34A]">IndustryOps</a>
            <a href="#packages" className="hover:text-[#16A34A]">Packages</a>
            <a href="#request-setup" className="hover:text-[#16A34A]">Start Free Trial</a>
            <Link href="/login" className="hover:text-[#16A34A]">Sign In</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-xl border border-[#DDEAE0] bg-white px-3 py-2.5 text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]">Sign In</Link>
            <Link href="/signup" className="rounded-xl bg-[#16A34A] px-3 py-2.5 text-xs font-black text-white hover:bg-[#12883E]">Start Free Trial</Link>
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden bg-[#07120D] text-[#F6FFF8]">
        <div className="absolute -left-28 top-16 h-80 w-80 rounded-full bg-[#16A34A]/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#D4A017]/14 blur-3xl" />
        <div className="mx-auto grid max-w-[1480px] items-center gap-10 px-4 py-16 md:px-7 lg:grid-cols-[1.02fr_0.98fr] lg:py-24">
          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#22C55E]">LeadsStacks POS</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
              LeadsStacks POS for Kenyan Businesses
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#B8C7BD] md:text-lg">
              Manage sales, stock, customers, debtors, reports and subscriptions from one simple cloud POS system built for shops, restaurants, hardware stores, mini-marts and growing SMEs.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-2xl bg-[#16A34A] px-5 py-4 text-sm font-black text-white shadow-xl shadow-[#16A34A]/20 hover:bg-[#12883E]">
                Start Free 14-Day Trial <ArrowRight size={17} />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 rounded-2xl border border-[#D4A017]/45 bg-[#D4A017]/12 px-5 py-4 text-sm font-black text-[#F7D783] hover:bg-[#D4A017]/16">
                Sign In
              </Link>
              <a href="#packages" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-5 py-4 text-sm font-black text-white hover:bg-white/12">
                View Packages
              </a>
            </div>
            <p className="mt-4 max-w-3xl text-sm font-bold leading-6 text-[#F7D783]">
              No complicated setup. Start with your products, users and payment methods, then test the system with your business operations.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {trustBullets.map((item) => (
                <p key={item} className="flex items-center gap-2 text-sm font-semibold text-[#E8F7EC]">
                  <CheckCircle2 size={16} className="text-[#22C55E]" /> {item}
                </p>
              ))}
            </div>
          </div>
          <HeroPreview />
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-[1480px] gap-8 px-4 md:px-7 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <SectionIntro eyebrow="Cloud POS control" title="One Simple System for Daily Business Control" note="LeadsStacks POS is a cloud-based POS system for Kenyan businesses that need sales, stock, customers, debtors, reports and business control from one simple system." />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {freeTrialBullets.map((item) => (
                <p key={item} className="flex items-center gap-2 rounded-xl border border-[#E8F0EA] bg-[#F8FBF8] p-3 text-xs font-black text-[#60766B]">
                  <CheckCircle2 size={15} className="shrink-0 text-[#16A34A]" /> {item}
                </p>
              ))}
            </div>
            <Link href="/signup" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#16A34A] px-5 py-4 text-sm font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E]">
              Start Free 14-Day Trial <ArrowRight size={16} />
            </Link>
          </div>
          <VisualPanel icon={ShieldCheck} title="Business onboarding" label="Business onboarding visual showing products, users, cashiers and package selection" items={["Add business profile", "Load products", "Create users/cashiers", "Select package"]} />
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 py-16 md:px-7" id="features">
        <SectionIntro eyebrow="Features" title="Everything You Need to Run Daily POS Operations" note="Start with sales and stock, then add customers, debtors, reports, staff and package controls as the business grows." />
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {featureHighlights.map((feature) => (
            <article key={feature.title} className="grid gap-4 rounded-3xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5 md:grid-cols-[0.9fr_1.1fr]">
              <VisualPanel icon={feature.icon} title={feature.title} label={feature.visualLabel} items={feature.stats} compact />
              <div className="flex flex-col justify-center">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#16A34A]/10 text-[#16A34A]">
                  <feature.icon size={20} />
                </span>
                <h3 className="mt-4 text-xl font-black text-[#173324]">{feature.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#789083]">{feature.note}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#F8FBF8] py-16" id="industryops">
        <div className="mx-auto max-w-[1480px] px-4 md:px-7">
          <SectionIntro eyebrow="IndustryOps" title="IndustryOps: POS Setups for Different Business Types" note="Choose a POS setup that matches how your business operates. LeadsStacks POS can be configured for different industries and workflows." />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {industries.map((industry) => (
              <article key={industry.title} className="rounded-3xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
                <div role="img" aria-label={`${industry.title} POS setup illustration`} className="grid h-20 w-20 place-items-center rounded-2xl border border-[#D4A017]/25 bg-[#FFF9E8] text-[#A57809]">
                  <industry.icon size={32} />
                </div>
                <h3 className="mt-4 text-sm font-black text-[#173324]">{industry.title}</h3>
                <p className="mt-2 min-h-12 text-xs leading-5 text-[#789083]">{industry.note}</p>
                <span className="mt-4 inline-flex rounded-full bg-[#16A34A]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#0F8C42]">
                  Best for: {industry.bestFor}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 py-16 md:px-7" id="packages">
        <SectionIntro eyebrow="Packages" title="Choose a Package That Fits Your Business" note="Start with a free trial. If you already know what you need, choose a package and we will prepare your setup." />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {packages.map((plan) => (
            <article key={plan.name} className={`relative rounded-3xl border p-5 shadow-sm shadow-[#12311F]/5 ${plan.recommended ? "border-[#16A34A]/50 bg-[#16A34A]/[0.045]" : "border-[#DDEAE0] bg-white"}`}>
              {plan.recommended && <span className="absolute right-4 top-4 rounded-full bg-[#16A34A] px-3 py-1 text-[9px] font-black uppercase tracking-wider text-white">Recommended</span>}
              <div role="img" aria-label={`${plan.name} package icon`} className="grid h-12 w-12 place-items-center rounded-2xl bg-[#12311F] text-[#D4A017]">
                <plan.icon size={22} />
              </div>
              <h3 className="mt-4 text-lg font-black text-[#173324]">{plan.name}</h3>
              <p className="mt-2 text-xl font-black text-[#12311F]">{plan.price}</p>
              <p className="mt-3 text-xs leading-5 text-[#789083]">{plan.note}</p>
              <p className="mt-3 rounded-xl bg-[#F8FBF8] p-3 text-[11px] font-bold leading-5 text-[#60766B]">Best for: {plan.bestFor}</p>
              {plan.name === "Custom / Enterprise" ? (
                <div className="mt-5 grid gap-2">
                  <Link href={signupHref(plan.name)} className="inline-flex justify-center rounded-xl bg-[#12311F] px-4 py-3 text-xs font-black text-white hover:bg-[#0E2418]">Start Trial</Link>
                  <a href="#request-setup" className="inline-flex justify-center rounded-xl border border-[#D4A017]/35 bg-[#FFF9E8] px-4 py-3 text-xs font-black text-[#8A670C] hover:bg-[#FFF2C9]">Talk to Support</a>
                </div>
              ) : (
                <div className="mt-5 grid gap-2">
                  <Link href={signupHref(plan.name)} className="inline-flex justify-center rounded-xl bg-[#12311F] px-4 py-3 text-xs font-black text-white hover:bg-[#0E2418]">Start Trial</Link>
                  <Link href={signupHref(plan.name)} className="inline-flex justify-center rounded-xl border border-[#16A34A]/25 bg-[#16A34A]/[0.045] px-4 py-3 text-xs font-black text-[#0F8C42] hover:bg-[#16A34A]/10">Choose Package</Link>
                </div>
              )}
            </article>
          ))}
        </div>
        <p className="mt-5 rounded-2xl border border-[#D4A017]/35 bg-[#FFF9E8] p-4 text-sm font-bold text-[#8A670C]">
          Not sure which package fits your business? Start the free trial and decide after testing.
        </p>
      </section>

      <section className="mx-auto grid max-w-[1480px] gap-8 px-4 py-16 md:px-7 lg:grid-cols-[0.9fr_1.1fr]" id="request-setup">
        <div>
          <SectionIntro eyebrow="Setup support" title="Want Help Choosing the Right Setup?" note="Tell us about your business and we will walk you through the best LeadsStacks POS package for your operations." />
          <div className="mt-6 rounded-3xl border border-[#DDEAE0] bg-white p-5">
            <p className="text-sm font-black text-[#173324]">Support</p>
            <p className="mt-2 text-sm text-[#789083]">Talk to support if you want help deciding the right package or preparing your setup.</p>
            <p className="mt-2 text-sm text-[#789083]">WhatsApp/Phone: +254 700 000 000</p>
            <p className="mt-1 text-sm text-[#789083]">Email: hello@leadsstacks.com</p>
            <Link href="/signup" className="mt-4 inline-flex rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white hover:bg-[#12883E]">Start free trial instead</Link>
          </div>
        </div>
        <form onSubmit={submitSetupRequest} className="rounded-3xl border border-[#DDEAE0] bg-white p-5 shadow-xl shadow-[#12311F]/8 md:p-7">
          {(feedback || error) && (
            <div className={`mb-4 rounded-xl px-4 py-3 text-xs font-bold ${error ? "border border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]" : "border border-[#16A34A]/20 bg-[#16A34A]/10 text-[#0F8C42]"}`}>
              {error || feedback}
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full name" value={form.fullName} onChange={(value) => updateField("fullName", value)} required />
            <Field label="Business name" value={form.businessName} onChange={(value) => updateField("businessName", value)} required />
            <Field label="Phone number" value={form.phone} onChange={(value) => updateField("phone", value)} required />
            <Field label="Email optional" type="email" value={form.email} onChange={(value) => updateField("email", value)} />
            <label>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Business type</span>
              <select value={form.businessType} onChange={(event) => updateField("businessType", event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] px-3 py-3 text-sm font-semibold outline-none focus:border-[#16A34A]" required>
                <option value="">Select business type</option>
                {businessTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <Field label="Number of users/cashiers" type="number" value={form.usersCount} onChange={(value) => updateField("usersCount", value)} />
            <label className="md:col-span-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Message optional</span>
              <textarea value={form.message} onChange={(event) => updateField("message", event.target.value)} className="mt-2 min-h-28 w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] px-3 py-3 text-sm font-semibold outline-none focus:border-[#16A34A]" placeholder="Tell us what you want to manage with LeadsStacks POS..." />
            </label>
          </div>
          <button disabled={loading} className="mt-5 w-full rounded-xl bg-[#16A34A] py-4 text-sm font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E] disabled:cursor-not-allowed disabled:bg-[#CBD8CF]">
            {loading ? "Submitting..." : "Request Setup"}
          </button>
        </form>
      </section>

      <footer className="border-t border-[#DDEAE0] bg-white">
        <div className="mx-auto flex max-w-[1480px] flex-col justify-between gap-6 px-4 py-8 md:flex-row md:items-center md:px-7">
          <div>
            <p className="text-sm font-black text-[#173324]">LeadsStacks POS by Integrated Revenue Solutions</p>
            <p className="mt-1 text-xs text-[#789083]">Copyright 2026 LeadsStacks</p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-black text-[#60766B]">
            <Link href="/signup" className="hover:text-[#16A34A]">Start Free Trial</Link>
            <a href="#packages" className="hover:text-[#16A34A]">Packages</a>
            <a href="#request-setup" className="hover:text-[#16A34A]">Talk to Support</a>
            <Link href="/login" className="hover:text-[#16A34A]">Sign In</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function SectionIntro({ eyebrow, title, note }: { eyebrow: string; title: string; note: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#16A34A]">{eyebrow}</p>
      <h2 className="mt-2 max-w-4xl text-3xl font-black tracking-tight text-[#10271B] md:text-4xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#789083]">{note}</p>
    </div>
  );
}

function HeroPreview() {
  return (
    <article role="img" aria-label="LeadsStacks POS dashboard visual on laptop and tablet with sales chart, products and payment cards" className="relative z-10 rounded-[28px] border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-black/30 backdrop-blur md:p-5">
      <div className="rounded-3xl bg-[#F5FAF6] p-4 text-[#173324]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-[#16A34A]">Owner dashboard</p>
            <h3 className="mt-1 text-lg font-black">LeadsStacks POS</h3>
          </div>
          <span className="rounded-xl bg-[#12311F] px-3 py-2 text-[10px] font-black text-[#22C55E]">Cloud POS</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <PreviewCard icon={BarChart3} label="Today sales" value="KES 184K" />
          <PreviewCard icon={CreditCard} label="M-Pesa" value="KES 126K" />
          <PreviewCard icon={Boxes} label="Stock value" value="KES 4.8M" />
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-2xl border border-[#DDEAE0] bg-white p-4">
            <p className="text-xs font-black text-[#173324]">POS checkout</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {["Bread", "Rice 1kg", "Cooking Oil", "Receipt"].map((item) => (
                <div key={item} className="rounded-xl border border-[#E8F0EA] bg-[#F8FBF8] p-3">
                  <p className="text-[11px] font-black text-[#173324]">{item}</p>
                  <p className="mt-1 text-[10px] text-[#789083]">Tap to sell</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-[#12311F] p-4 text-white">
            <p className="text-xs font-black text-[#D4A017]">Payment mix</p>
            <p className="mt-2 text-2xl font-black">Cash + M-Pesa</p>
            <p className="mt-2 text-[11px] leading-5 text-[#B8C7BD]">Track daily payments, cashiers and reports from one cloud dashboard.</p>
          </div>
        </div>
      </div>
    </article>
  );
}

function VisualPanel({ icon: Icon, title, label, items, compact }: { icon: LucideIcon; title: string; label: string; items: string[]; compact?: boolean }) {
  return (
    <div role="img" aria-label={label} className={`rounded-2xl border border-[#DDEAE0] bg-[#F8FBF8] ${compact ? "p-4" : "p-5"}`}>
      <div className="flex items-center justify-between">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#12311F] text-[#D4A017]">
          <Icon size={22} />
        </span>
        <span className="rounded-full bg-[#16A34A]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#0F8C42]">Cloud POS</span>
      </div>
      <p className="mt-4 text-sm font-black text-[#173324]">{title}</p>
      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <div key={item} className="rounded-xl border border-[#E8F0EA] bg-white px-3 py-2 text-[11px] font-black text-[#60766B]">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#DDEAE0] bg-white p-3">
      <Icon size={17} className="text-[#16A34A]" />
      <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}</p>
      <p className="mt-1 text-sm font-black text-[#173324]">{value}</p>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label>
      <span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} className="mt-2 w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] px-3 py-3 text-sm font-semibold outline-none focus:border-[#16A34A]" />
    </label>
  );
}
