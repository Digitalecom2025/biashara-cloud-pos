"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, ShieldCheck, UserRound } from "lucide-react";
import { saveSuperAdminSession } from "@/lib/super-admin-session";

export function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = (await response.json()) as { data?: { email: string; token: string }; error?: string };
      if (!response.ok || !json.data) throw new Error(json.error ?? "Super Admin login failed.");
      saveSuperAdminSession({
        superAdminLoggedIn: true,
        email: json.data.email,
        token: json.data.token,
        loggedInAt: new Date().toISOString(),
      });
      router.replace("/super-admin");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Super Admin login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#07120D] p-4 text-[#F6FFF8]">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-[#0E2418] shadow-2xl shadow-black/30 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="p-7 md:p-10">
          <Link href="/" className="flex w-fit items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#D4A017] text-sm font-black text-[#07120D]">SA</span>
            <span>
              <span className="block text-lg font-black tracking-wide">LEADSSTACKS</span>
              <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-[#D4A017]">SUPER ADMIN</span>
            </span>
          </Link>
          <h1 className="mt-12 text-4xl font-black tracking-tight">Internal Super Admin</h1>
          <p className="mt-4 text-sm leading-7 text-[#B8C7BD]">
            Manage trial businesses, subscriptions and internal account status. This area is not visible to POS clients.
          </p>
          <div className="mt-8 rounded-2xl border border-[#D4A017]/30 bg-[#D4A017]/10 p-4 text-xs font-bold leading-6 text-[#F7D783]">
            Access is checked on the server using `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD`.
          </div>
        </div>

        <div className="bg-[#F5FAF6] p-5 text-[#173324] md:p-10">
          <form onSubmit={submit} className="mx-auto max-w-md rounded-3xl border border-[#DDEAE0] bg-white p-6 shadow-xl shadow-[#12311F]/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#16A34A]">Secure internal login</p>
                <h2 className="mt-1 text-2xl font-black">Super Admin Login</h2>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#12311F] text-[#D4A017]"><ShieldCheck size={20} /></span>
            </div>

            {error && <p className="mt-4 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-xs font-black text-[#EF4444]">{error}</p>}

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Email</span>
                <span className="relative mt-2 block">
                  <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-[#789083]" size={16} />
                  <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] py-3 pl-10 pr-3 text-sm font-semibold outline-none focus:border-[#16A34A]" />
                </span>
              </label>
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Password</span>
                <span className="relative mt-2 block">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#789083]" size={16} />
                  <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] py-3 pl-10 pr-3 text-sm font-semibold outline-none focus:border-[#16A34A]" />
                </span>
              </label>
              <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#16A34A] py-3.5 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E] disabled:opacity-60">
                {loading ? "Signing in..." : "Login"} <ArrowRight size={15} />
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
