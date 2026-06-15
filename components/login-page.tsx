"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Cloud,
  Lock,
  MonitorSmartphone,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { createDemoSession, demoAccounts, findDemoAccount, saveDemoSession, type DemoAccount } from "@/lib/demo-auth";

const valuePoints = [
  "Cloud POS for desktop, tablet and phone",
  "Works as installable PWA app",
  "Sales, stock, debtors, reports and branches",
  "Hybrid offline sales queue and sync center",
  "AI business insights",
  "Built for supermarkets, restaurants, cosmetics, hardware, auto spares and retail shops",
];

export function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<DemoAccount>(demoAccounts[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function selectRole(account: DemoAccount) {
    setSelectedRole(account);
    setEmail(account.email);
    setPassword(account.password);
    setError("");
  }

  function loginWithAccount(account: DemoAccount) {
    setLoading(true);
    saveDemoSession(createDemoSession(account));
    window.setTimeout(() => router.replace("/dashboard"), 250);
  }

  function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const account = findDemoAccount(email, password);
    if (!account) {
      window.setTimeout(() => {
        setLoading(false);
        setError("Invalid email or password. For presentation access, open Internal Demo Access below.");
      }, 250);
      return;
    }
    saveDemoSession(createDemoSession(account));
    window.setTimeout(() => router.replace("/dashboard"), 250);
  }

  return (
    <main className="min-h-screen bg-[#07120D] p-4 text-[#F6FFF8] md:p-6">
      <section className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1500px] overflow-hidden rounded-[28px] border border-white/10 bg-[#0E2418] shadow-2xl shadow-black/25 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative overflow-hidden p-6 md:p-10 xl:p-12">
          <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#16A34A]/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-[#D4A017]/16 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#16A34A] text-xl font-black text-white shadow-lg shadow-[#16A34A]/20">B</span>
              <div>
                <p className="text-lg font-black tracking-wide">BIASHARA</p>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4A017]">Cloud POS</p>
              </div>
            </div>

            <div className="mt-12 max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#22C55E]">Account access</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Login to Biashara POS</h1>
              <p className="mt-4 text-base leading-7 text-[#B8C7BD]">
                Access your trial account, active subscription or internal demo account.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {valuePoints.map((point) => (
                <div key={point} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-[#22C55E]" size={17} />
                  <p className="text-sm font-semibold leading-5 text-[#E8F7EC]">{point}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <ValueMetric icon={MonitorSmartphone} label="PWA ready" value="Installable" />
              <ValueMetric icon={RefreshCw} label="Hybrid sync" value="Offline queue" />
              <ValueMetric icon={BrainCircuit} label="AI demo" value="Rule insights" />
            </div>
          </div>
        </div>

        <div className="bg-[#F5FAF6] p-4 text-[#173324] md:p-8 xl:p-10">
          <div className="mx-auto max-w-xl rounded-[24px] border border-[#DDEAE0] bg-white p-5 shadow-xl shadow-[#12311F]/10 md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#16A34A]">Secure login</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight">Welcome back</h2>
                <p className="mt-1 text-sm text-[#789083]">Use your trial, subscription or internal demo account credentials.</p>
              </div>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#12311F] text-[#22C55E]">
                <ShieldCheck size={20} />
              </span>
            </div>

            {error && <div className="mt-4 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-xs font-bold text-[#EF4444]">{error}</div>}

            <form onSubmit={submitLogin} className="mt-5 space-y-4">
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Email</span>
                <span className="relative mt-2 block">
                  <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-[#789083]" size={16} />
                  <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] py-3 pl-10 pr-3 text-sm font-semibold outline-none focus:border-[#16A34A]" placeholder="you@business.co.ke" />
                </span>
              </label>
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Password</span>
                <span className="relative mt-2 block">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#789083]" size={16} />
                  <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] py-3 pl-10 pr-3 text-sm font-semibold outline-none focus:border-[#16A34A]" placeholder="Enter password" />
                </span>
              </label>

              <div className="grid gap-2">
                <button disabled={loading} className="flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] py-3.5 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E] disabled:cursor-not-allowed disabled:bg-[#CBD8CF]">
                  {loading ? "Logging in..." : "Login"} <ArrowRight size={15} />
                </button>
              </div>
            </form>

            <details className="mt-6 rounded-2xl border border-[#D4A017]/35 bg-[#FFF9E8] p-4">
              <summary className="cursor-pointer text-sm font-black text-[#8A670C]">Internal Demo Access</summary>
              <p className="mt-2 text-xs leading-5 text-[#8A670C]">For internal presentations only. Use any listed email with password <b>demo123</b>. Double-click a role card to log in faster.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {demoAccounts.map((account) => (
                  <button key={`quick-${account.email}`} type="button" disabled={loading} onClick={() => loginWithAccount(account)} className="rounded-xl border border-[#DDEAE0] bg-white px-3 py-2.5 text-[10px] font-black text-[#60766B] hover:border-[#16A34A]/40 hover:bg-[#16A34A]/[0.035] disabled:cursor-not-allowed">
                    Login as {account.title.replace("Business Owner / ", "")}
                  </button>
                ))}
              </div>
              <div className="mt-3 grid gap-2">
                {demoAccounts.map((account) => (
                  <button key={account.email} type="button" onClick={() => selectRole(account)} onDoubleClick={() => loginWithAccount(account)} className={`rounded-2xl border p-3 text-left transition ${selectedRole.role === account.role ? "border-[#16A34A]/60 bg-[#16A34A]/[0.045]" : "border-[#E8F0EA] bg-white hover:bg-[#F8FBF8]"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black text-[#173324]">{account.title}</p>
                        <p className="mt-1 text-[11px] font-semibold text-[#789083]">{account.email}</p>
                      </div>
                      <span className="rounded-full bg-[#12311F] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#22C55E]">{account.till}</span>
                    </div>
                    <p className="mt-2 text-[10px] leading-4 text-[#60766B]">{account.access.slice(0, 3).join(" · ")}</p>
                  </button>
                ))}
              </div>
            </details>
          </div>

          <footer className="mx-auto mt-5 max-w-xl text-center text-[11px] font-semibold leading-5 text-[#789083]">
            Demo environment — production login and user permissions will be connected during deployment.
          </footer>
        </div>
      </section>
    </main>
  );
}

function ValueMetric({ icon: Icon, label, value }: { icon: typeof Cloud; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#07120D]/45 p-4">
      <Icon size={18} className="text-[#D4A017]" />
      <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-[#B8C7BD]">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}
