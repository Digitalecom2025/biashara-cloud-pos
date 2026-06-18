"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Clock3, LockKeyhole, ShieldCheck, Smartphone, type LucideIcon } from "lucide-react";

const businessTypes = [
  "Retail",
  "Supermarket",
  "Restaurant / Small Hotel",
  "Cosmetics / Skin Care",
  "Hardware",
  "Auto Spares",
  "Salon / Barber",
  "Pharmacy / Chemist",
  "Laundry",
  "Car Wash",
  "Wines & Spirits",
  "Butchery",
  "Agrovet",
  "Other",
];

const preferredPackages = ["Not sure yet", "Lite", "Growth", "Business", "Premium", "Custom"];

const signupBenefits: Array<[string, LucideIcon]> = [
  ["14 days to test your business workflow", Clock3],
  ["Works on desktop, tablet and phone", Smartphone],
  ["Products, users and package selection in one setup", ShieldCheck],
  ["Account access is prepared during onboarding", LockKeyhole],
];

type TrialForm = {
  fullName: string;
  businessName: string;
  phone: string;
  email: string;
  businessType: string;
  usersCount: string;
  preferredPackage: string;
  password: string;
  confirmPassword: string;
  message: string;
};

const initialForm: TrialForm = {
  fullName: "",
  businessName: "",
  phone: "",
  email: "",
  businessType: "",
  usersCount: "",
  preferredPackage: "Not sure yet",
  password: "",
  confirmPassword: "",
  message: "",
};

function packageFromQuery() {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("package");
  if (!value) return null;
  return preferredPackages.find((plan) => plan.toLowerCase() === value.trim().toLowerCase()) ?? null;
}

export function TrialSignupPage() {
  const [form, setForm] = useState<TrialForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [selectedPackageNotice, setSelectedPackageNotice] = useState("");
  const [queryPackage, setQueryPackage] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const selected = packageFromQuery();
      if (!selected || selected === "Not sure yet") return;
      setQueryPackage(selected);
      setSelectedPackageNotice(`You selected the ${selected} package. You can still change it during or after your free trial.`);
      setForm((current) => ({ ...current, preferredPackage: selected }));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function updateField(field: keyof TrialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  async function submitTrial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setFeedback("");
    setError("");

    if (form.password && form.password.length < 6) {
      setLoading(false);
      setError("Password should be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setLoading(false);
      setError("Password and confirm password must match.");
      return;
    }

    try {
      const response = await fetch("/api/trial-signups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as {
        data?: { businessId: string; userId: string; trialEndsAt: string | null; selectedPlan: string; redirectTo: string };
        message?: string;
        error?: string;
      };

      if (!response.ok || !payload.data) throw new Error(payload.error ?? "Trial account could not be created.");

      setFeedback(payload.message ?? "Your trial request has been received. Our team will review and approve your account before your 14-day trial starts.");
      setForm({ ...initialForm, preferredPackage: queryPackage ?? "Not sure yet" });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Trial account could not be created.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5FAF6] text-[#173324]">
      <header className="border-b border-[#DDEAE0] bg-white/95">
        <nav className="mx-auto flex max-w-[1380px] items-center justify-between gap-4 px-4 py-4 md:px-7">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#16A34A] text-sm font-black text-white shadow-lg shadow-[#16A34A]/20">LS</span>
            <span>
              <span className="block text-sm font-black tracking-wide">LEADSSTACKS</span>
              <span className="block text-[10px] font-black uppercase tracking-[0.25em] text-[#D4A017]">POS</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-xl border border-[#DDEAE0] bg-white px-3 py-2.5 text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]">Sign In</Link>
            <Link href="/#request-setup" className="rounded-xl bg-[#12311F] px-3 py-2.5 text-xs font-black text-white hover:bg-[#0E2418]">Talk to Support</Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto grid max-w-[1380px] gap-8 px-4 py-10 md:px-7 lg:grid-cols-[0.92fr_1.08fr] lg:py-16">
        <div className="rounded-[28px] bg-[#07120D] p-6 text-[#F6FFF8] shadow-2xl shadow-[#12311F]/12 md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#22C55E]">Free trial</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">Start Your Free 14-Day Biashara POS Trial</h1>
          <p className="mt-5 text-sm leading-7 text-[#B8C7BD]">
            Set up your business profile and test the POS for 14 days before choosing your package.
          </p>
          <div className="mt-7 grid gap-3">
            {signupBenefits.map(([label, Icon]) => (
              <p key={String(label)} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-sm font-bold text-[#E8F7EC]">
                <Icon className="text-[#D4A017]" size={18} /> {label}
              </p>
            ))}
          </div>
          <div className="mt-7 rounded-2xl border border-[#D4A017]/30 bg-[#D4A017]/10 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-[#F7D783]">Trial access</p>
            <p className="mt-2 text-sm leading-6 text-[#E8F7EC]">
              You can start with a small product list and test the system before completing full setup.
            </p>
          </div>
        </div>

        <form onSubmit={submitTrial} className="rounded-[28px] border border-[#DDEAE0] bg-white p-5 shadow-xl shadow-[#12311F]/8 md:p-7">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#16A34A]">Create trial account</p>
            <h2 className="mt-2 text-2xl font-black text-[#10271B]">Business details</h2>
            <p className="mt-1 text-sm text-[#789083]">We use this to prepare products, users/cashiers, package selection and onboarding support.</p>
          </div>

          {selectedPackageNotice && (
            <div className="mb-4 rounded-xl border border-[#D4A017]/35 bg-[#FFF9E8] px-4 py-3 text-xs font-black text-[#8A670C]">
              {selectedPackageNotice}
            </div>
          )}

          {(feedback || error) && (
            <div className={`mb-4 rounded-xl px-4 py-3 text-xs font-bold ${error ? "border border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]" : "border border-[#16A34A]/20 bg-[#16A34A]/10 text-[#0F8C42]"}`}>
              {error || feedback}
              {feedback && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/login" className="rounded-lg bg-[#12311F] px-3 py-2 text-[11px] font-black text-white">Go to Login</Link>
                  <Link href="/subscriptions" className="rounded-lg border border-[#16A34A]/30 bg-white px-3 py-2 text-[11px] font-black text-[#0F8C42]">View packages after login</Link>
                </div>
              )}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full name" value={form.fullName} onChange={(value) => updateField("fullName", value)} required />
            <Field label="Business name" value={form.businessName} onChange={(value) => updateField("businessName", value)} required />
            <Field label="Phone number" value={form.phone} onChange={(value) => updateField("phone", value)} required />
            <Field label="Email" type="email" value={form.email} onChange={(value) => updateField("email", value)} required />
            <label>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Business type</span>
              <select value={form.businessType} onChange={(event) => updateField("businessType", event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] px-3 py-3 text-sm font-semibold outline-none focus:border-[#16A34A]" required>
                <option value="">Select business type</option>
                {businessTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <Field label="Number of users/cashiers" type="number" value={form.usersCount} onChange={(value) => updateField("usersCount", value)} />
            <label>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Preferred package</span>
              <select value={form.preferredPackage} onChange={(event) => updateField("preferredPackage", event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] px-3 py-3 text-sm font-semibold outline-none focus:border-[#16A34A]">
                {preferredPackages.map((plan) => <option key={plan}>{plan}</option>)}
              </select>
            </label>
            <Field label="Password" type="password" value={form.password} onChange={(value) => updateField("password", value)} required />
            <Field label="Confirm password" type="password" value={form.confirmPassword} onChange={(value) => updateField("confirmPassword", value)} required />
            <label className="md:col-span-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Message optional</span>
              <textarea value={form.message} onChange={(event) => updateField("message", event.target.value)} className="mt-2 min-h-28 w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] px-3 py-3 text-sm font-semibold outline-none focus:border-[#16A34A]" placeholder="Tell us what you want to manage with Biashara POS..." />
            </label>
          </div>

          <button disabled={loading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#16A34A] py-4 text-sm font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E] disabled:cursor-not-allowed disabled:bg-[#CBD8CF]">
            {loading ? "Creating trial..." : "Start Free Trial"} {!loading && <ArrowRight size={16} />}
          </button>
          <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#789083]">
            <CheckCircle2 className="mt-0.5 shrink-0 text-[#16A34A]" size={15} />
            No payment required. Try Biashara POS for 14 days, then choose the package that fits your business.
          </p>
        </form>
      </section>
    </main>
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
