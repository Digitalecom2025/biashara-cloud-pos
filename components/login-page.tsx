"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Cloud,
  Lock,
  MonitorSmartphone,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { createDemoSession, findDemoAccount, saveDemoSession } from "@/lib/demo-auth";
import { saveBusinessSession, type BusinessSession } from "@/lib/business-session";
import { saveTrialPreview } from "@/lib/trial-session";

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

const preferredPackages = ["Not sure yet", "Lite", "Growth", "Business", "Enterprise"];

const valuePoints: Array<[string, LucideIcon]> = [
  ["Secure business account access", ShieldCheck],
  ["Sales, stock and reports in one place", BarChart3],
  ["Owner, cashier and manager roles", Users],
  ["Cloud access from phone, tablet and computer", MonitorSmartphone],
];

type SignupForm = {
  fullName: string;
  businessName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  businessType: string;
  preferredPackage: string;
  usersCount: string;
};

const initialSignupForm: SignupForm = {
  fullName: "",
  businessName: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
  businessType: "",
  preferredPackage: "Not sure yet",
  usersCount: "",
};

export function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupForm, setSignupForm] = useState<SignupForm>(initialSignupForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateSignupField(field: keyof SignupForm, value: string) {
    setSignupForm((current) => ({ ...current, [field]: value }));
    setError("");
    setSuccess("");
  }

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const account = findDemoAccount(email, password);
    if (account) {
      saveDemoSession(createDemoSession(account));
      window.setTimeout(() => router.replace("/dashboard"), 250);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = (await response.json()) as {
        data?: {
          user: { id: string; name: string; email: string; role: string; branchName: string };
          business: { id: string; name: string; status: string; packagePlan: string; selectedPlan?: string | null } | null;
          subscription: { status: string; accessStatus?: string; packagePlan: string; trialEndsAt?: string | null } | null;
          permissions: string[];
          trialDaysRemaining: number;
        };
        error?: string;
      };
      if (!response.ok || !payload.data || !payload.data.business) {
        throw new Error(payload.error ?? "Invalid email or password.");
      }

      const session: BusinessSession = {
        businessLoggedIn: true,
        userId: payload.data.user.id,
        businessId: payload.data.business.id,
        businessName: payload.data.business.name,
        businessStatus: payload.data.business.status,
        userName: payload.data.user.name,
        userEmail: payload.data.user.email,
        userRole: payload.data.user.role,
        branchName: payload.data.user.branchName,
        till: payload.data.user.role.toLowerCase().includes("cashier") ? "Till 1" : "Office",
        subscriptionStatus: payload.data.subscription?.status ?? "active",
        packagePlan: payload.data.subscription?.packagePlan ?? payload.data.business.packagePlan,
        selectedPlan: payload.data.business.selectedPlan,
        trialEndsAt: payload.data.subscription?.trialEndsAt,
        trialDaysRemaining: payload.data.trialDaysRemaining,
        permissions: payload.data.permissions,
      };
      saveBusinessSession(session);
      if (payload.data.subscription?.status === "trial" && payload.data.subscription.trialEndsAt) {
        saveTrialPreview({
          businessId: payload.data.business.id,
          businessName: payload.data.business.name,
          fullName: payload.data.user.name,
          selectedPlan: payload.data.business.selectedPlan ?? payload.data.subscription.packagePlan,
          status: "trial",
          trialStartedAt: new Date().toISOString(),
          trialEndsAt: payload.data.subscription.trialEndsAt,
        });
      }
      router.replace(payload.data.subscription?.accessStatus === "expired" ? "/subscriptions" : "/dashboard");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  async function submitSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (signupForm.password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      setError("Password and confirm password must match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/trial-signups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupForm),
      });
      const payload = (await response.json()) as {
        data?: {
          businessId: string;
          trialEndsAt: string | null;
          selectedPlan: string;
          user: { id: string; name: string; email: string; role: string; branchName: string };
          business: { id: string; name: string; status: string; packagePlan: string; selectedPlan: string };
          subscription: { status: string; packagePlan: string; trialEndsAt: string | null };
          permissions: string[];
          trialDaysRemaining: number;
          redirectTo?: string;
        };
        error?: string;
        message?: string;
      };
      if (!response.ok || !payload.data) throw new Error(payload.error ?? "Trial account could not be created.");

      const session: BusinessSession = {
        businessLoggedIn: true,
        userId: payload.data.user.id,
        businessId: payload.data.business.id,
        businessName: payload.data.business.name,
        businessStatus: payload.data.business.status,
        userName: payload.data.user.name,
        userEmail: payload.data.user.email,
        userRole: payload.data.user.role,
        branchName: payload.data.user.branchName,
        till: "Office",
        subscriptionStatus: payload.data.subscription.status,
        packagePlan: payload.data.subscription.packagePlan,
        selectedPlan: payload.data.business.selectedPlan,
        trialEndsAt: payload.data.subscription.trialEndsAt,
        trialDaysRemaining: payload.data.trialDaysRemaining,
        permissions: payload.data.permissions,
      };
      saveBusinessSession(session);
      if (payload.data.subscription.trialEndsAt) {
        saveTrialPreview({
          businessId: payload.data.business.id,
          businessName: payload.data.business.name,
          fullName: payload.data.user.name,
          selectedPlan: payload.data.business.selectedPlan,
          status: "trial",
          trialStartedAt: new Date().toISOString(),
          trialEndsAt: payload.data.subscription.trialEndsAt,
        });
      }
      setSuccess(payload.message ?? "Your 14-day free trial is active. You can now start adding products, customers and sales.");
      setSignupForm(initialSignupForm);
      router.replace(payload.data.redirectTo || "/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Trial account could not be created.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07120D] p-4 text-[#F6FFF8] md:p-6">
      <section className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1480px] overflow-hidden rounded-[30px] border border-white/10 bg-[#0E2418] shadow-2xl shadow-black/25 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="relative order-2 overflow-hidden p-6 md:p-10 xl:p-12 lg:order-1">
          <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#16A34A]/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-[#D4A017]/16 blur-3xl" />

          <div className="relative z-10">
            <Link href="/" className="flex w-fit items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#16A34A] text-sm font-black text-white shadow-lg shadow-[#16A34A]/20">LS</span>
              <span>
                <span className="block text-lg font-black tracking-wide">LEADSSTACKS</span>
                <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-[#D4A017]">POS</span>
              </span>
            </Link>

            <div className="mt-12 max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#22C55E]">Cloud POS account</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
                Manage Your Business Easily With LeadsStacks POS
              </h1>
              <p className="mt-4 text-base leading-7 text-[#B8C7BD]">
                Run sales, track stock, manage customers, monitor debtors and view reports from one simple POS system built for Kenyan businesses.
              </p>
            </div>

            <LoginVisual />

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {valuePoints.map(([point, Icon]) => (
                <div key={point} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                  <Icon className="mt-0.5 shrink-0 text-[#D4A017]" size={17} />
                  <p className="text-sm font-semibold leading-5 text-[#E8F7EC]">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="order-1 bg-[#F5FAF6] p-4 text-[#173324] md:p-8 xl:p-10 lg:order-2">
          <div className="mx-auto max-w-xl rounded-[26px] border border-[#DDEAE0] bg-white p-5 shadow-xl shadow-[#12311F]/10 md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#16A34A]">LeadsStacks POS</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight">{activeTab === "signin" ? "Welcome Back" : "Start Your Free 14-Day Trial"}</h2>
                <p className="mt-1 text-sm leading-6 text-[#789083]">
                  {activeTab === "signin"
                    ? "Sign in to access your trial account or active subscription."
                    : "Create your business account and test LeadsStacks POS before choosing a package."}
                </p>
              </div>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#12311F] text-[#22C55E]">
                <ShieldCheck size={20} />
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 rounded-2xl border border-[#DDEAE0] bg-[#F8FBF8] p-1">
              <button type="button" onClick={() => { setActiveTab("signin"); setError(""); setSuccess(""); }} className={`rounded-xl py-3 text-xs font-black ${activeTab === "signin" ? "bg-[#12311F] text-white shadow-sm" : "text-[#60766B]"}`}>
                Sign In
              </button>
              <button type="button" onClick={() => { setActiveTab("signup"); setError(""); setSuccess(""); }} className={`rounded-xl py-3 text-xs font-black ${activeTab === "signup" ? "bg-[#16A34A] text-white shadow-sm" : "text-[#60766B]"}`}>
                Sign Up
              </button>
            </div>

            {(error || success) && (
              <div className={`mt-4 rounded-xl border px-4 py-3 text-xs font-bold ${error ? "border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]" : "border-[#16A34A]/20 bg-[#16A34A]/10 text-[#0F8C42]"}`}>
                {error || success}
              </div>
            )}

            {activeTab === "signin" ? (
              <form onSubmit={submitLogin} className="mt-5 space-y-4">
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Email or phone</span>
                  <span className="relative mt-2 block">
                    <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-[#789083]" size={16} />
                    <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] py-3 pl-10 pr-3 text-sm font-semibold outline-none focus:border-[#16A34A]" placeholder="you@business.co.ke" />
                  </span>
                </label>
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Password</span>
                  <span className="relative mt-2 block">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#789083]" size={16} />
                    <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] py-3 pl-10 pr-3 text-sm font-semibold outline-none focus:border-[#16A34A]" placeholder="Enter password" />
                  </span>
                </label>
                <div className="flex items-center justify-between gap-3">
                  <Link href="/signup" className="text-xs font-black text-[#16A34A] hover:text-[#12883E]">Start free trial</Link>
                  <button type="button" className="text-xs font-black text-[#789083]">Forgot Password?</button>
                </div>
                <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#16A34A] py-3.5 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E] disabled:cursor-not-allowed disabled:bg-[#CBD8CF]">
                  {loading ? "Signing in..." : "Sign In"} <ArrowRight size={15} />
                </button>
                <p className="text-center text-xs font-semibold text-[#789083]">
                  Don&apos;t have an account?{" "}
                  <button type="button" onClick={() => setActiveTab("signup")} className="font-black text-[#16A34A]">Start free trial</button>
                </p>
              </form>
            ) : (
              <form onSubmit={submitSignup} className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Owner full name" value={signupForm.fullName} onChange={(value) => updateSignupField("fullName", value)} required />
                <Field label="Business name" value={signupForm.businessName} onChange={(value) => updateSignupField("businessName", value)} required />
                <Field label="Phone number" value={signupForm.phone} onChange={(value) => updateSignupField("phone", value)} required />
                <Field label="Email" type="email" value={signupForm.email} onChange={(value) => updateSignupField("email", value)} required />
                <Field label="Password" type="password" value={signupForm.password} onChange={(value) => updateSignupField("password", value)} required />
                <Field label="Confirm password" type="password" value={signupForm.confirmPassword} onChange={(value) => updateSignupField("confirmPassword", value)} required />
                <label>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Business type</span>
                  <select value={signupForm.businessType} onChange={(event) => updateSignupField("businessType", event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] px-3 py-3 text-sm font-semibold outline-none focus:border-[#16A34A]" required>
                    <option value="">Select business type</option>
                    {businessTypes.map((type) => <option key={type}>{type}</option>)}
                  </select>
                </label>
                <label>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Preferred package</span>
                  <select value={signupForm.preferredPackage} onChange={(event) => updateSignupField("preferredPackage", event.target.value)} className="mt-2 w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] px-3 py-3 text-sm font-semibold outline-none focus:border-[#16A34A]">
                    {preferredPackages.map((plan) => <option key={plan}>{plan}</option>)}
                  </select>
                </label>
                <Field label="Number of users/cashiers optional" type="number" value={signupForm.usersCount} onChange={(value) => updateSignupField("usersCount", value)} />
                <div className="flex items-center rounded-xl border border-[#D4A017]/35 bg-[#FFF9E8] px-4 py-3 text-xs font-bold leading-5 text-[#8A670C]">
                  No payment required. Your free trial runs for 14 days.
                </div>
                <button disabled={loading} className="flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] py-3.5 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E] disabled:cursor-not-allowed disabled:bg-[#CBD8CF] md:col-span-2">
                  {loading ? "Creating account..." : "Start Free Trial"} <ArrowRight size={15} />
                </button>
              </form>
            )}
          </div>

          <footer className="mx-auto mt-5 max-w-xl text-center text-[11px] font-semibold leading-5 text-[#789083]">
            LeadsStacks POS by Integrated Revenue Solutions. Copyright 2026 LeadsStacks.
          </footer>
        </div>
      </section>
    </main>
  );
}

function LoginVisual() {
  return (
    <div role="img" aria-label="LeadsStacks POS dashboard with sales chart, products, phone access and cloud controls" className="mt-8 rounded-[26px] border border-white/10 bg-white/[0.055] p-4 shadow-2xl shadow-black/20 backdrop-blur">
      <div className="rounded-3xl bg-[#F5FAF6] p-4 text-[#173324]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-[#16A34A]">Business dashboard</p>
            <h3 className="mt-1 text-lg font-black">Sales, stock and reports</h3>
          </div>
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#12311F] text-[#D4A017]">
            <Cloud size={21} />
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <MiniMetric icon={ShoppingCart} label="Sales" value="KES 84K" />
          <MiniMetric icon={PackageCheck} label="Products" value="1,245" />
          <MiniMetric icon={BarChart3} label="Reports" value="Live" />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_0.8fr]">
          <div className="rounded-2xl border border-[#DDEAE0] bg-white p-4">
            <p className="text-xs font-black text-[#173324]">Today&apos;s sales trend</p>
            <div className="mt-4 flex h-24 items-end gap-2">
              {[36, 52, 45, 70, 58, 88, 76].map((height, index) => (
                <span key={index} style={{ height: `${height}%` }} className="flex-1 rounded-t-lg bg-[#16A34A]" />
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-[#12311F] p-4 text-white">
            <MonitorSmartphone size={20} className="text-[#D4A017]" />
            <p className="mt-3 text-sm font-black">Phone + tablet access</p>
            <p className="mt-2 text-[11px] leading-5 text-[#B8C7BD]">Monitor your shop from anywhere with secure cloud access.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniMetric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
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
