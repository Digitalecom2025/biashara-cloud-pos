"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Building2,
  CheckCircle2,
  CreditCard,
  Database,
  FileText,
  Landmark,
  Layers3,
  PackageCheck,
  RefreshCw,
  ShoppingCart,
  Store,
  Users,
  WifiOff,
  type LucideIcon,
} from "lucide-react";

const trustBullets = [
  "Works on desktop, tablet and phone",
  "Sales, stock, customers and debtors",
  "Offline sales queue + sync center",
  "Branches, cashiers and reports",
  "AI business insights",
];

const painPoints = [
  "Sales are not properly tracked",
  "Stock goes missing",
  "Customers buy on debt and follow-up is hard",
  "Cashier accountability is poor",
  "Reports are manual or delayed",
  "Internet issues interrupt cloud systems",
];

const features: Array<[string, LucideIcon]> = [
  ["Fast POS checkout", ShoppingCart],
  ["Product and stock tracking", PackageCheck],
  ["Customer and debtor management", Users],
  ["Purchases and suppliers", Store],
  ["Branch and cashier control", Building2],
  ["Finance and expenses", Landmark],
  ["Reports and party statements", FileText],
  ["AI business assistant", BrainCircuit],
  ["Offline sales queue and sync center", RefreshCw],
];

const industries = [
  ["Supermarkets", "Run multiple tills with central stock and cashier reports."],
  ["Restaurants / Small Hotels", "Track food sales, waiter activity and debt accounts."],
  ["Retail Shops", "Manage daily sales, products, customers and payments."],
  ["Cosmetics / Skin Care", "Control fast-moving oils, beauty stock and repeat buyers."],
  ["Hardware", "Track bulky inventory, contractor debts and supplier purchases."],
  ["Auto Spares", "Find parts quickly and manage branch stock movement."],
  ["Salons / Barbers", "Track services, staff activity and regular customers."],
  ["Pharmacies / Chemists", "Monitor stock, low quantities and customer purchases."],
  ["Agrovets", "Manage seasonal stock, suppliers and farmer accounts."],
  ["Butcheries", "Track daily sales, cash flow and stock movement."],
];

const packages = [
  ["Lite", "Ksh 700/month", "For simple sales and basic stock."],
  ["Growth", "Ksh 1,500/month", "For stock, customers, debtors, expenses, purchases and suppliers."],
  ["Business", "Ksh 3,000/month", "For staff, tills, branches, user roles and advanced reports."],
  ["Premium", "Ksh 5,000/month", "For AI insights, rewards, SMS marketing placeholders, advanced reporting and priority support."],
  ["Custom / Enterprise", "Quoted", "For supermarkets, multi-branch businesses, offline sync, M-Pesa API, eTIMS, WhatsApp and custom workflows."],
];

const aiQuestions = [
  "What sold the most today?",
  "Which products are running low?",
  "Who owes me money?",
  "Which cashier sold the most?",
  "What should I restock first?",
];

const businessTypes = ["Retail Shop", "Supermarket", "Restaurant / Small Hotel", "Cosmetics / Skin Care", "Hardware", "Auto Spares", "Salon / Barber", "Pharmacy / Chemist", "Agrovet", "Butchery", "Other"];

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

  async function submitDemoRequest(event: React.FormEvent<HTMLFormElement>) {
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
      setFeedback(payload.message ?? "Thank you. We'll contact you shortly to schedule your POS demo.");
      setForm({ fullName: "", businessName: "", phone: "", email: "", businessType: "", usersCount: "", message: "" });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5FAF6] text-[#173324]">
      <header className="sticky top-0 z-50 border-b border-[#DDEAE0] bg-white/92 backdrop-blur">
        <nav className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-4 py-4 md:px-7">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#16A34A] text-lg font-black text-white shadow-lg shadow-[#16A34A]/20">B</span>
            <span>
              <span className="block text-sm font-black tracking-wide">BIASHARA</span>
              <span className="block text-[10px] font-black uppercase tracking-[0.25em] text-[#D4A017]">Cloud POS</span>
            </span>
          </Link>
          <div className="hidden items-center gap-5 text-xs font-black text-[#60766B] lg:flex">
            <a href="#features" className="hover:text-[#16A34A]">Features</a>
            <a href="#industries" className="hover:text-[#16A34A]">Industries</a>
            <a href="#pricing" className="hover:text-[#16A34A]">Pricing</a>
            <a href="#hybrid" className="hover:text-[#16A34A]">Hybrid POS</a>
            <a href="#request-demo" className="hover:text-[#16A34A]">Request Demo</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-xl border border-[#DDEAE0] bg-white px-3 py-2.5 text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]">Login</Link>
            <Link href="/signup" className="rounded-xl bg-[#16A34A] px-3 py-2.5 text-xs font-black text-white hover:bg-[#12883E]">Start Trial</Link>
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden bg-[#07120D] text-[#F6FFF8]">
        <div className="absolute -left-28 top-16 h-80 w-80 rounded-full bg-[#16A34A]/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#D4A017]/14 blur-3xl" />
        <div className="mx-auto grid max-w-[1480px] items-center gap-10 px-4 py-16 md:px-7 lg:grid-cols-[1.02fr_0.98fr] lg:py-24">
          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#22C55E]">Biashara Cloud POS by LeadsStacks</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
              Cloud POS for Kenyan Businesses That Need Sales, Stock, Debtors, Reports & Offline Sync
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#B8C7BD] md:text-lg">
              Run your shop, restaurant, supermarket, cosmetics store, hardware, auto spares or retail business from one smart POS system - on desktop, tablet or phone.
            </p>
            <p className="mt-4 max-w-2xl rounded-2xl border border-[#D4A017]/30 bg-[#D4A017]/10 px-4 py-3 text-sm font-bold text-[#F7D783]">
              Try sales, stock, customers, debtors, reports and offline sync before choosing your package.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-2xl bg-[#16A34A] px-5 py-4 text-sm font-black text-white shadow-xl shadow-[#16A34A]/20 hover:bg-[#12883E]">
                Start Free 14-Day Trial <ArrowRight size={17} />
              </Link>
              <a href="#request-demo" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-5 py-4 text-sm font-black text-white hover:bg-white/12">
                Request Demo
              </a>
              <Link href="/login" className="inline-flex items-center gap-2 rounded-2xl border border-[#D4A017]/45 bg-[#D4A017]/12 px-5 py-4 text-sm font-black text-[#F7D783] hover:bg-[#D4A017]/16">
                Login to POS
              </Link>
            </div>
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

      <section className="mx-auto max-w-[1480px] px-4 py-16 md:px-7" id="features">
        <SectionIntro eyebrow="The problem" title="Stop Guessing What Is Happening in Your Business" note="Biashara gives owners a clear view of daily sales, stock movement, cashiers, debtors and reports." />
        <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {painPoints.map((point) => (
            <article key={point} className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
              <WifiOff className="text-[#EF4444]" size={19} />
              <p className="mt-3 text-sm font-black text-[#173324]">{point}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1480px] px-4 md:px-7">
          <SectionIntro eyebrow="The solution" title="One POS System for Sales, Stock, Debtors, Branches and Reports" note="Start with the core POS, then grow into branches, staff control, AI insights and hybrid offline sync." />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {features.map(([title, Icon]) => (
              <article key={String(title)} className="rounded-2xl border border-[#DDEAE0] bg-[#F8FBF8] p-5">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#16A34A]/10 text-[#16A34A]"><Icon size={20} /></span>
                <h3 className="mt-4 text-sm font-black text-[#173324]">{title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1480px] gap-8 px-4 py-16 md:px-7 lg:grid-cols-[0.9fr_1.1fr]" id="hybrid">
        <div>
          <SectionIntro eyebrow="Hybrid POS advantage" title="Keep Selling Even When Connection Drops" note="Biashara Hybrid POS allows sales to be saved offline on the device and synced once the connection returns." />
          <div className="mt-6 grid gap-3">
            {["Save offline sales locally", "View pending sales in Sync Center", "Sync when online", "Prevent duplicate sales", "Track cashier, branch and payment method"].map((item) => (
              <p key={item} className="flex items-center gap-2 text-sm font-bold text-[#60766B]"><CheckCircle2 size={16} className="text-[#16A34A]" /> {item}</p>
            ))}
          </div>
        </div>
        <article className="rounded-3xl bg-[#12311F] p-6 text-white shadow-xl shadow-[#12311F]/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-[#D4A017]">Sync Center</p>
              <h3 className="mt-1 text-2xl font-black">Offline queue ready</h3>
            </div>
            <RefreshCw className="text-[#22C55E]" size={30} />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Metric label="Pending" value="3" />
            <Metric label="Synced" value="18" />
            <Metric label="Failed" value="0" />
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/6 p-4 text-sm text-[#B8C7BD]">
            A cashier can finish a sale while the connection is down. The owner later syncs the pending sale to the cloud database without duplicating records.
          </div>
        </article>
      </section>

      <section className="bg-[#F8FBF8] py-16" id="industries">
        <div className="mx-auto max-w-[1480px] px-4 md:px-7">
          <SectionIntro eyebrow="IndustryOps" title="Built for Different Business Types" note="Use the same reliable POS foundation, adjusted for how your business sells, stocks and reports." />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {industries.map(([name, note]) => (
              <article key={name} className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
                <Layers3 size={18} className="text-[#D4A017]" />
                <h3 className="mt-3 text-sm font-black text-[#173324]">{name}</h3>
                <p className="mt-2 text-xs leading-5 text-[#789083]">{note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 py-16 md:px-7" id="pricing">
        <SectionIntro eyebrow="Packages" title="Choose a Package That Fits Your Business" note="Start with a 14-day free trial, then choose the package that fits your business." />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {packages.map(([name, price, note]) => (
            <article key={name} className={`rounded-3xl border p-5 shadow-sm shadow-[#12311F]/5 ${name === "Business" ? "border-[#16A34A]/45 bg-[#16A34A]/[0.045]" : "border-[#DDEAE0] bg-white"}`}>
              <h3 className="text-lg font-black text-[#173324]">{name}</h3>
              <p className="mt-2 text-2xl font-black text-[#12311F]">{price}</p>
              <p className="mt-3 text-xs leading-5 text-[#789083]">{note}</p>
              <Link href="/signup" className="mt-5 inline-flex rounded-xl bg-[#12311F] px-4 py-3 text-xs font-black text-white hover:bg-[#0E2418]">Start trial</Link>
            </article>
          ))}
        </div>
        <p className="mt-5 rounded-2xl border border-[#D4A017]/35 bg-[#FFF9E8] p-4 text-sm font-bold text-[#8A670C]">
          Hybrid offline sync is available on Custom / Enterprise plans or selected advanced packages.
        </p>
      </section>

      <section className="bg-[#07120D] py-16 text-white">
        <div className="mx-auto grid max-w-[1480px] gap-8 px-4 md:px-7 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-7">
            <Store className="text-[#D4A017]" size={28} />
            <h2 className="mt-4 text-3xl font-black">Perfect for Supermarkets with Multiple Cashiers</h2>
            <p className="mt-3 text-sm leading-7 text-[#B8C7BD]">
              Each cashier logs in separately, sales go to one central system, stock updates centrally, and the owner sees all cashier reports.
            </p>
            <Link href="/supermarket-demo" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#D4A017] px-4 py-3 text-xs font-black text-[#07120D]">
              View Supermarket Demo <ArrowRight size={15} />
            </Link>
          </article>
          <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-7">
            <BrainCircuit className="text-[#22C55E]" size={28} />
            <h2 className="mt-4 text-3xl font-black">AI Business Assistant</h2>
            <p className="mt-3 text-sm leading-7 text-[#B8C7BD]">Ask questions about sales, stock, debtors, expenses, cashiers and reports.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {aiQuestions.map((question) => <span key={question} className="rounded-full bg-white/8 px-3 py-2 text-[11px] font-bold text-[#E8F7EC]">{question}</span>)}
            </div>
            <Link href="/login" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white">
              Try AI Demo <ArrowRight size={15} />
            </Link>
          </article>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1480px] gap-8 px-4 py-16 md:px-7 lg:grid-cols-[0.9fr_1.1fr]" id="request-demo">
        <div>
          <SectionIntro eyebrow="Request demo" title="Ready to See Biashara Cloud POS in Action?" note="Send your business details and the LeadsStacks team will contact you shortly to schedule your POS demo." />
          <div className="mt-6 rounded-3xl border border-[#DDEAE0] bg-white p-5">
            <p className="text-sm font-black text-[#173324]">Contact</p>
            <p className="mt-2 text-sm text-[#789083]">WhatsApp/Phone: +254 700 000 000</p>
            <p className="mt-1 text-sm text-[#789083]">Email: hello@leadsstacks.com</p>
          </div>
        </div>
        <form onSubmit={submitDemoRequest} className="rounded-3xl border border-[#DDEAE0] bg-white p-5 shadow-xl shadow-[#12311F]/8 md:p-7">
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
              <textarea value={form.message} onChange={(event) => updateField("message", event.target.value)} className="mt-2 min-h-28 w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] px-3 py-3 text-sm font-semibold outline-none focus:border-[#16A34A]" placeholder="Tell us what you want to manage with Biashara POS..." />
            </label>
          </div>
          <button disabled={loading} className="mt-5 w-full rounded-xl bg-[#16A34A] py-4 text-sm font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E] disabled:cursor-not-allowed disabled:bg-[#CBD8CF]">
            {loading ? "Submitting..." : "Request Demo"}
          </button>
        </form>
      </section>

      <footer className="border-t border-[#DDEAE0] bg-white">
        <div className="mx-auto flex max-w-[1480px] flex-col justify-between gap-6 px-4 py-8 md:flex-row md:items-center md:px-7">
          <div>
            <p className="text-sm font-black text-[#173324]">Biashara Cloud POS by LeadsStacks</p>
            <p className="mt-1 text-xs text-[#789083]">Copyright 2026 LeadsStacks. Demo environment - do not enter real business data.</p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-black text-[#60766B]">
            <Link href="/login" className="hover:text-[#16A34A]">Login to POS</Link>
            <Link href="/signup" className="hover:text-[#16A34A]">Start Free Trial</Link>
            <a href="#request-demo" className="hover:text-[#16A34A]">Request Demo</a>
            <a href="#pricing" className="hover:text-[#16A34A]">Packages</a>
            <a href="#request-demo" className="hover:text-[#16A34A]">Contact</a>
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
    <article className="relative z-10 rounded-[28px] border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-black/30 backdrop-blur md:p-5">
      <div className="rounded-3xl bg-[#F5FAF6] p-4 text-[#173324]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-[#16A34A]">Owner dashboard</p>
            <h3 className="mt-1 text-lg font-black">Nairobi CBD Store</h3>
          </div>
          <span className="rounded-xl bg-[#12311F] px-3 py-2 text-[10px] font-black text-[#22C55E]">Online + Offline Ready</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <PreviewCard icon={BarChart3} label="Today sales" value="KES 184K" />
          <PreviewCard icon={CreditCard} label="M-Pesa" value="KES 126K" />
          <PreviewCard icon={Database} label="Stock value" value="KES 4.8M" />
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-2xl border border-[#DDEAE0] bg-white p-4">
            <p className="text-xs font-black text-[#173324]">POS checkout tiles</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {["Seed Oil 250ml", "Ugali Beef Stew", "Cement 50kg", "Brake Pads"].map((item) => (
                <div key={item} className="rounded-xl border border-[#E8F0EA] bg-[#F8FBF8] p-3">
                  <p className="text-[11px] font-black text-[#173324]">{item}</p>
                  <p className="mt-1 text-[10px] text-[#789083]">Tap to sell</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-[#12311F] p-4 text-white">
            <p className="text-xs font-black text-[#D4A017]">Sync Center</p>
            <p className="mt-2 text-2xl font-black">3 pending</p>
            <p className="mt-2 text-[11px] leading-5 text-[#B8C7BD]">Offline sales saved locally and ready to sync.</p>
          </div>
        </div>
      </div>
    </article>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-[#B8C7BD]">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
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
