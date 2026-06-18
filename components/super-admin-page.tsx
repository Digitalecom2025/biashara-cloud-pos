"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Building2, CalendarClock, CheckCircle2, Crown, LogOut, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { clearSuperAdminSession, getSuperAdminSession, type SuperAdminSession } from "@/lib/super-admin-session";

type AdminBusinessRow = {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  businessType: string;
  packageSelected: string;
  subscriptionStatus: string;
  approvalStatus: string;
  usersCount: number | null;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  daysRemaining: number;
  createdAt: string;
};

type AdminSummary = {
  totalBusinesses: number;
  pendingApprovals: number;
  trialBusinesses: number;
  activeTrials: number;
  activePaidAccounts: number;
  activeSubscriptions: number;
  expiredTrials: number;
  suspendedAccounts: number;
  selectedPackages: number;
  recentSignups: number;
};

type AdminData = { summary: AdminSummary; rows: AdminBusinessRow[] };
type AdminTab = "overview" | "businesses" | "trials" | "subscriptions";

const tabs: Array<[AdminTab, string, string]> = [
  ["overview", "Overview", "/super-admin"],
  ["businesses", "Businesses", "/super-admin/businesses"],
  ["trials", "Trials", "/super-admin/trials"],
  ["subscriptions", "Subscriptions", "/super-admin/subscriptions"],
];

const packageOptions = ["Trial", "Lite", "Growth", "Business", "Premium", "Custom"];

function formatDate(value?: string | null) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function SuperAdminPage({ initialTab = "overview" }: { initialTab?: AdminTab }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<SuperAdminSession | null>(null);
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [packageSelections, setPackageSelections] = useState<Record<string, string>>({});

  const activeTab = useMemo<AdminTab>(() => {
    if (pathname.endsWith("/businesses")) return "businesses";
    if (pathname.endsWith("/trials")) return "trials";
    if (pathname.endsWith("/subscriptions")) return "subscriptions";
    return initialTab;
  }, [initialTab, pathname]);

  const loadData = useCallback(async (currentSession: SuperAdminSession) => {
    setLoading(true);
    setError("");
    try {
      const endpoint = activeTab === "trials" ? "/api/admin/trials" : "/api/admin/businesses";
      const response = await fetch(endpoint, { headers: { "x-super-admin-token": currentSession.token } });
      const json = (await response.json()) as { data?: AdminData; error?: string };
      if (!response.ok || !json.data) throw new Error(json.error ?? "Admin data could not be loaded.");
      setData(json.data);
      setPackageSelections(Object.fromEntries(json.data.rows.map((row) => [row.id, row.packageSelected || "Trial"])));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Admin data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const currentSession = getSuperAdminSession();
      if (!currentSession) {
        router.replace("/super-admin/login");
        return;
      }
      setSession(currentSession);
      void loadData(currentSession);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadData, router]);

  function logout() {
    clearSuperAdminSession();
    router.replace("/super-admin/login");
  }

  async function runAction(businessId: string, action: string) {
    if (!session) return;
    setSavingId(`${businessId}:${action}`);
    setFeedback("");
    setError("");
    try {
      const endpoint =
        action === "approve_trial"
          ? `/api/admin/businesses/${businessId}/approve-trial`
          : action === "suspend"
          ? `/api/admin/businesses/${businessId}/suspend`
          : `/api/admin/businesses/${businessId}/subscription`;
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-super-admin-token": session.token },
        body: JSON.stringify({ action, packagePlan: packageSelections[businessId] }),
      });
      const json = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(json.error ?? "Subscription update failed.");
      setFeedback(json.message ?? "Subscription updated.");
      await loadData(session);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Subscription update failed.");
    } finally {
      setSavingId("");
    }
  }

  const rows = data?.rows ?? [];
  const trialRows = rows.filter((row) => ["pending_approval", "trial", "expired"].includes(row.subscriptionStatus) || row.approvalStatus === "pending_approval");
  const visibleRows = activeTab === "trials" ? trialRows : rows;

  if (!session && loading) {
    return <div className="grid min-h-screen place-items-center bg-[#F5FAF6] p-4"><p className="rounded-2xl border border-[#DDEAE0] bg-white p-5 text-sm font-black text-[#173324]">Checking Super Admin session...</p></div>;
  }

  return (
    <main className="min-h-screen bg-[#F5FAF6] text-[#173324]">
      <header className="border-b border-[#DDEAE0] bg-[#07120D] text-[#F6FFF8]">
        <div className="mx-auto flex max-w-[1700px] flex-col justify-between gap-4 px-4 py-5 md:flex-row md:items-center md:px-7">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#D4A017] text-sm font-black text-[#07120D]">SA</span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D4A017]">Internal admin</p>
              <h1 className="text-xl font-black">LeadsStacks / Biashara Super Admin</h1>
              <p className="text-xs text-[#B8C7BD]">Internal LeadsStacks/Biashara admin area. Not visible to POS clients.</p>
            </div>
          </div>
          <button onClick={logout} className="flex w-fit items-center gap-2 rounded-xl border border-[#D4A017]/35 bg-[#D4A017]/10 px-4 py-3 text-xs font-black text-[#D4A017]">
            <LogOut size={15} /> Logout
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-[1700px] px-4 py-6 md:px-7">
        <div className="mb-5 flex gap-2 overflow-x-auto rounded-2xl border border-[#DDEAE0] bg-white p-1">
          {tabs.map(([id, label, href]) => (
            <Link key={id} href={href} className={`shrink-0 rounded-xl px-4 py-3 text-xs font-black ${activeTab === id ? "bg-[#12311F] text-white" : "text-[#60766B] hover:bg-[#F8FBF8]"}`}>
              {label}
            </Link>
          ))}
        </div>

        {(feedback || error) && <p className={`mb-5 rounded-xl px-4 py-3 text-xs font-black ${error ? "border border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]" : "border border-[#16A34A]/20 bg-[#16A34A]/10 text-[#0F8C42]"}`}>{error || feedback}</p>}

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
          <Summary icon={Building2} label="Total businesses" value={data?.summary.totalBusinesses ?? 0} />
          <Summary icon={CalendarClock} label="Pending approvals" value={data?.summary.pendingApprovals ?? 0} gold />
          <Summary icon={CalendarClock} label="Active trials" value={data?.summary.activeTrials ?? 0} gold />
          <Summary icon={CheckCircle2} label="Active paid accounts" value={data?.summary.activePaidAccounts ?? 0} />
          <Summary icon={AlertTriangle} label="Expired trials" value={data?.summary.expiredTrials ?? 0} danger />
          <Summary icon={ShieldCheck} label="Suspended accounts" value={data?.summary.suspendedAccounts ?? 0} danger />
          <Summary icon={Crown} label="Selected packages" value={data?.summary.selectedPackages ?? 0} gold />
          <Summary icon={Users} label="Recent signups" value={data?.summary.recentSignups ?? 0} />
        </section>

        <section className="mt-5 overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white">
          <div className="flex flex-col justify-between gap-3 border-b border-[#E8F0EA] p-4 md:flex-row md:items-center">
            <div>
              <h2 className="font-black text-[#173324]">{activeTab === "trials" ? "Pending Trial Requests" : activeTab === "subscriptions" ? "Subscription management" : "Businesses"}</h2>
              <p className="text-xs text-[#789083]">Review new signups, approve trials and manage account status.</p>
            </div>
            <button onClick={() => session && loadData(session)} className="flex w-fit items-center gap-2 rounded-xl border border-[#DDEAE0] px-4 py-3 text-xs font-black text-[#60766B]">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {loading ? <p className="p-5 text-sm font-bold text-[#789083]">Loading businesses...</p> : null}
          {!loading && visibleRows.length === 0 ? <p className="p-5 text-sm font-bold text-[#789083]">No records found.</p> : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1450px] text-left">
              <thead>
                <tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-wider text-[#789083]">
                  {["Business name", "Contact person", "Phone", "Email", "Business type", "Preferred package", "Users/cashiers", "Status", "Trial start", "Trial end", "Days", "Signup date", "Actions"].map((heading) => <th key={heading} className="px-4 py-3.5">{heading}</th>)}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr key={row.id} className="border-t border-[#EEF3EF] text-xs text-[#60766B]">
                    <td className="px-4 py-3 font-black text-[#173324]">{row.name}</td>
                    <td className="px-4 py-3">{row.contactPerson}</td>
                    <td className="px-4 py-3">{row.phone}</td>
                    <td className="px-4 py-3">{row.email}</td>
                    <td className="px-4 py-3">{row.businessType}</td>
                    <td className="px-4 py-3">
                      <select value={packageSelections[row.id] ?? row.packageSelected} onChange={(event) => setPackageSelections((current) => ({ ...current, [row.id]: event.target.value }))} className="rounded-lg border border-[#DDEAE0] bg-white px-2 py-2 text-xs font-bold text-[#173324]">
                        {packageOptions.map((option) => <option key={option}>{option}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">{row.usersCount ?? "Not set"}</td>
                    <td className="px-4 py-3"><Status value={row.subscriptionStatus} /></td>
                    <td className="px-4 py-3">{formatDate(row.trialStartedAt)}</td>
                    <td className="px-4 py-3">{formatDate(row.trialEndsAt)}</td>
                    <td className="px-4 py-3 font-black">{row.daysRemaining}</td>
                    <td className="px-4 py-3">{formatDate(row.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {row.subscriptionStatus === "pending_approval" || row.approvalStatus === "pending_approval" ? <Action disabled={savingId === `${row.id}:approve_trial`} onClick={() => runAction(row.id, "approve_trial")}>Approve Trial</Action> : null}
                        <Action disabled={savingId === `${row.id}:mark_active`} onClick={() => runAction(row.id, "mark_active")}>Active</Action>
                        <Action disabled={savingId === `${row.id}:suspend`} onClick={() => runAction(row.id, "suspend")}>Suspend</Action>
                        <Action disabled={savingId === `${row.id}:mark_expired`} onClick={() => runAction(row.id, "mark_expired")}>Expire</Action>
                        <Action disabled={savingId === `${row.id}:extend_7`} onClick={() => runAction(row.id, "extend_7")}>+7 days</Action>
                        <Action disabled={savingId === `${row.id}:extend_14`} onClick={() => runAction(row.id, "extend_14")}>+14 days</Action>
                        <Action disabled={savingId === `${row.id}:change_package`} onClick={() => runAction(row.id, "change_package")}>Change plan</Action>
                        <Action onClick={() => setFeedback(`${row.name}: ${row.contactPerson}, ${row.phone}, ${row.email}, ${row.businessType}, ${row.packageSelected}`)}>View</Action>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

function Summary({ icon: Icon, label, value, gold, danger }: { icon: typeof Building2; label: string; value: number; gold?: boolean; danger?: boolean }) {
  const tone = danger ? "bg-[#EF4444]/10 text-[#EF4444]" : gold ? "bg-[#D4A017]/12 text-[#A57809]" : "bg-[#16A34A]/10 text-[#16A34A]";
  return (
    <article className="rounded-2xl border border-[#DDEAE0] bg-white p-4 shadow-sm shadow-[#12311F]/5">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon size={18} /></span>
      <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}</p>
      <p className="mt-1 text-xl font-black text-[#173324]">{value.toLocaleString()}</p>
    </article>
  );
}

function Status({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const tone = normalized === "active" ? "bg-[#16A34A]/10 text-[#0F8C42]" : normalized === "trial" ? "bg-[#D4A017]/12 text-[#8A670C]" : "bg-[#EF4444]/10 text-[#EF4444]";
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-black capitalize ${tone}`}>{value}</span>;
}

function Action({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return <button disabled={disabled} onClick={onClick} className="rounded-lg border border-[#DDEAE0] bg-white px-2.5 py-1.5 text-[10px] font-black text-[#60766B] hover:bg-[#F8FBF8] disabled:opacity-50">{children}</button>;
}
