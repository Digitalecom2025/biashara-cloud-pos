"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Crown,
  Gauge,
  LogOut,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
  Users,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";
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
  businessStatus: string;
  usersCount: number | null;
  message: string;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  renewalDate: string | null;
  amount: number;
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
  monthlyRecurringRevenue: number;
};

type AdminData = { summary: AdminSummary; rows: AdminBusinessRow[] };
type AdminTab = "overview" | "pending" | "businesses" | "trials" | "subscriptions" | "suspended" | "settings";
type ActionResponse = { success?: boolean; message?: string; error?: string; business?: unknown };

const sidebarItems: Array<{ id: AdminTab | "logout"; label: string; href?: string; icon: LucideIcon }> = [
  { id: "overview", label: "Overview", href: "/super-admin", icon: Gauge },
  { id: "pending", label: "Pending Approvals", href: "/super-admin/pending-approvals", icon: UserCheck },
  { id: "businesses", label: "Businesses", href: "/super-admin/businesses", icon: Building2 },
  { id: "trials", label: "Trials", href: "/super-admin/trials", icon: CalendarClock },
  { id: "subscriptions", label: "Subscriptions", href: "/super-admin/subscriptions", icon: WalletCards },
  { id: "suspended", label: "Suspended", href: "/super-admin/suspended", icon: AlertTriangle },
  { id: "settings", label: "Settings", href: "/super-admin/settings", icon: Settings },
  { id: "logout", label: "Logout", icon: LogOut },
];

const packageOptions = ["Lite", "Growth", "Business", "Premium", "Custom"];
const allPackageOptions = ["Trial", "Lite", "Growth", "Business", "Premium", "Custom"];
const statusFilters = ["All", "Pending Approval", "Trial Active", "Active Paid", "Expired Trial", "Suspended"];

function formatDate(value?: string | null) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(value);
}

function displayStatus(row: AdminBusinessRow) {
  if (["pending_approval", "pending", "new"].includes(row.approvalStatus) || ["pending_approval", "pending", "new"].includes(row.subscriptionStatus) || row.businessStatus === "pending_approval") return "Pending Approval";
  if (row.subscriptionStatus === "trial") return "Trial Active";
  if (row.subscriptionStatus === "active") return "Active Paid";
  if (row.subscriptionStatus === "expired") return "Expired Trial";
  if (row.subscriptionStatus === "suspended") return "Suspended";
  return row.subscriptionStatus.replaceAll("_", " ");
}

function statusMatches(row: AdminBusinessRow, filter: string) {
  if (filter === "All") return true;
  return displayStatus(row) === filter;
}

function tabFromPath(pathname: string, fallback: AdminTab): AdminTab {
  if (pathname.endsWith("/pending-approvals")) return "pending";
  if (pathname.endsWith("/businesses")) return "businesses";
  if (pathname.endsWith("/trials")) return "trials";
  if (pathname.endsWith("/subscriptions")) return "subscriptions";
  if (pathname.endsWith("/suspended")) return "suspended";
  if (pathname.endsWith("/settings")) return "settings";
  return fallback;
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [packageSelections, setPackageSelections] = useState<Record<string, string>>({});
  const [selectedBusiness, setSelectedBusiness] = useState<AdminBusinessRow | null>(null);

  const activeTab = useMemo(() => tabFromPath(pathname, initialTab), [initialTab, pathname]);

  const loadData = useCallback(async (currentSession: SuperAdminSession) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/businesses", { cache: "no-store", headers: { "x-super-admin-token": currentSession.token } });
      const json = (await response.json()) as { data?: AdminData; error?: string };
      if (!response.ok || !json.data) throw new Error(json.error ?? "Admin data could not be loaded.");
      setData(json.data);
      setPackageSelections(Object.fromEntries(json.data.rows.map((row) => [row.id, row.packageSelected || "Trial"])));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Admin data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

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

  async function runAction(businessId: string, action: string, options: { days?: number; packagePlan?: string } = {}) {
    if (!session) return;
    if (action === "suspend" && !window.confirm("Suspend this account? The business user will not be able to login.")) return;

    setSavingId(`${businessId}:${action}:${options.days ?? ""}:${options.packagePlan ?? ""}`);
    setFeedback("");
    setError("");
    try {
      const endpoint =
        action === "approve"
          ? `/api/admin/businesses/${businessId}/approve-trial`
          : action === "suspend"
          ? `/api/admin/businesses/${businessId}/suspend`
          : action === "extend"
          ? `/api/admin/businesses/${businessId}/extend-trial`
          : action === "activate"
          ? `/api/admin/businesses/${businessId}/activate-package`
          : action === "change_package"
          ? `/api/admin/businesses/${businessId}/change-package`
          : `/api/admin/businesses/${businessId}/subscription`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-super-admin-token": session.token },
        body: JSON.stringify({
          action,
          days: options.days,
          packagePlan: options.packagePlan ?? packageSelections[businessId],
        }),
      });
      const json = (await response.json()) as ActionResponse;
      if (!response.ok) throw new Error(json.error ?? "Admin action failed.");
      setFeedback(json.message ?? "Admin action completed.");
      await loadData(session);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Admin action failed.");
    } finally {
      setSavingId("");
    }
  }

  const rows = useMemo(() => data?.rows ?? [], [data]);
  const rowsForTab = useMemo(() => {
    if (activeTab === "pending") return rows.filter((row) => displayStatus(row) === "Pending Approval");
    if (activeTab === "trials") return rows.filter((row) => ["Trial Active", "Expired Trial"].includes(displayStatus(row)));
    if (activeTab === "subscriptions") return rows.filter((row) => ["Trial Active", "Active Paid", "Expired Trial", "Suspended"].includes(displayStatus(row)));
    if (activeTab === "suspended") return rows.filter((row) => displayStatus(row) === "Suspended");
    return rows;
  }, [activeTab, rows]);

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rowsForTab.filter((row) => {
      const searchable = `${row.name} ${row.contactPerson} ${row.phone} ${row.email} ${row.businessType} ${row.packageSelected}`.toLowerCase();
      return (!query || searchable.includes(query)) && statusMatches(row, statusFilter);
    });
  }, [rowsForTab, search, statusFilter]);

  if (!session && loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F5FAF6] p-4">
        <p className="rounded-2xl border border-[#DDEAE0] bg-white p-5 text-sm font-black text-[#173324]">Checking Super Admin session...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5FAF6] text-[#173324]">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="bg-[#07120D] p-4 text-[#F6FFF8] lg:min-h-screen">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0E2418] p-4">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#D4A017] text-sm font-black text-[#07120D]">SA</span>
            <div>
              <p className="text-sm font-black">Super Admin</p>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#D4A017]">Control center</p>
            </div>
          </div>

          <nav className="mt-5 grid gap-1" aria-label="Super Admin navigation">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              if (item.id === "logout") {
                return (
                  <button key={item.id} onClick={logout} className="mt-4 flex items-center gap-3 rounded-xl border border-[#D4A017]/25 bg-[#D4A017]/10 px-3 py-3 text-left text-xs font-black text-[#D4A017]">
                    <Icon size={16} /> {item.label}
                  </button>
                );
              }

              const active = activeTab === item.id;
              return (
                <Link key={item.id} href={item.href ?? "/super-admin"} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-black ${active ? "bg-[#16A34A] text-white" : "text-[#B8C7BD] hover:bg-[#0E2418] hover:text-white"}`}>
                  <Icon size={16} /> {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">
          <header className="border-b border-[#DDEAE0] bg-white px-4 py-5 md:px-7">
            <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D4A017]">LeadsStacks / Biashara POS control center</p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-[#10271B]">Super Admin</h1>
                <p className="mt-1 text-sm text-[#789083]">Internal SaaS dashboard for managing POS clients, trials and subscriptions.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] px-3 py-2 text-xs font-bold text-[#60766B]">
                  {session?.email ?? "Super Admin"}
                </span>
                <button onClick={logout} className="flex items-center gap-2 rounded-xl border border-[#D4A017]/35 bg-[#FFF9E8] px-3 py-2 text-xs font-black text-[#8A670C]">
                  <LogOut size={15} /> Logout
                </button>
              </div>
            </div>
          </header>

          <div className="p-4 md:p-7">
            {(feedback || error) && (
              <p className={`mb-5 rounded-xl px-4 py-3 text-xs font-black ${error ? "border border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]" : "border border-[#16A34A]/20 bg-[#16A34A]/10 text-[#0F8C42]"}`}>
                {error || feedback}
              </p>
            )}

            <OverviewCards summary={data?.summary} />

            {activeTab === "settings" ? (
              <SettingsPanel session={session} />
            ) : (
              <AdminTable
                activeTab={activeTab}
                loading={loading}
                rows={visibleRows}
                search={search}
                statusFilter={statusFilter}
                packageSelections={packageSelections}
                savingId={savingId}
                onSearch={setSearch}
                onStatusFilter={setStatusFilter}
                onPackageChange={(id, plan) => setPackageSelections((current) => ({ ...current, [id]: plan }))}
                onRefresh={() => session && loadData(session)}
                onView={setSelectedBusiness}
                onAction={runAction}
              />
            )}
          </div>
        </section>
      </div>

      {selectedBusiness ? <DetailsPanel row={selectedBusiness} onClose={() => setSelectedBusiness(null)} /> : null}
    </main>
  );
}

function OverviewCards({ summary }: { summary?: AdminSummary }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Summary icon={Building2} label="Total businesses" value={summary?.totalBusinesses ?? 0} />
      <Summary icon={UserCheck} label="Pending approvals" value={summary?.pendingApprovals ?? 0} gold />
      <Summary icon={CalendarClock} label="Active trials" value={summary?.activeTrials ?? 0} gold />
      <Summary icon={CheckCircle2} label="Active paid clients" value={summary?.activePaidAccounts ?? 0} />
      <Summary icon={AlertTriangle} label="Expired trials" value={summary?.expiredTrials ?? 0} danger />
      <Summary icon={ShieldCheck} label="Suspended accounts" value={summary?.suspendedAccounts ?? 0} danger />
      <Summary icon={Crown} label="MRR estimate" value={formatMoney(summary?.monthlyRecurringRevenue ?? 0)} />
      <Summary icon={Users} label="New signups this week" value={summary?.recentSignups ?? 0} />
    </section>
  );
}

function AdminTable({
  activeTab,
  loading,
  rows,
  search,
  statusFilter,
  packageSelections,
  savingId,
  onSearch,
  onStatusFilter,
  onPackageChange,
  onRefresh,
  onView,
  onAction,
}: {
  activeTab: AdminTab;
  loading: boolean;
  rows: AdminBusinessRow[];
  search: string;
  statusFilter: string;
  packageSelections: Record<string, string>;
  savingId: string;
  onSearch: (value: string) => void;
  onStatusFilter: (value: string) => void;
  onPackageChange: (id: string, plan: string) => void;
  onRefresh: () => void;
  onView: (row: AdminBusinessRow) => void;
  onAction: (businessId: string, action: string, options?: { days?: number; packagePlan?: string }) => void;
}) {
  const title =
    activeTab === "pending"
      ? "Pending Trial Requests"
      : activeTab === "trials"
      ? "Trial Management"
      : activeTab === "subscriptions"
      ? "Subscription Management"
      : activeTab === "suspended"
      ? "Suspended Accounts"
      : "Businesses";
  const emptyMessage =
    activeTab === "pending"
      ? "No pending approvals yet."
      : activeTab === "trials"
      ? "No active trials yet."
      : activeTab === "suspended"
      ? "No suspended accounts yet."
      : activeTab === "subscriptions"
      ? "No subscription records found."
      : "No businesses found.";

  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5">
      <div className="border-b border-[#E8F0EA] p-4">
        <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
          <div>
            <h2 className="font-black text-[#173324]">{title}</h2>
            <p className="text-xs text-[#789083]">Approve trials, manage package status and monitor client accounts.</p>
          </div>
          <button onClick={onRefresh} className="flex w-fit items-center gap-2 rounded-xl border border-[#DDEAE0] px-4 py-3 text-xs font-black text-[#60766B]">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_220px]">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#789083]" size={16} />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search business, contact, phone or email..."
              className="w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] py-3 pl-10 pr-3 text-sm font-semibold outline-none focus:border-[#16A34A]"
            />
          </label>
          <label className="relative block">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-[#789083]" size={16} />
            <select value={statusFilter} onChange={(event) => onStatusFilter(event.target.value)} className="w-full rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] py-3 pl-10 pr-3 text-sm font-bold outline-none focus:border-[#16A34A]">
              {statusFilters.map((filter) => <option key={filter}>{filter}</option>)}
            </select>
          </label>
        </div>
      </div>

      {loading ? <p className="p-5 text-sm font-bold text-[#789083]">Loading Super Admin records...</p> : null}
      {!loading && rows.length === 0 ? (
        <div className="p-6">
          <div className="rounded-2xl border border-dashed border-[#DDEAE0] bg-[#F8FBF8] p-6 text-center">
            <p className="text-sm font-black text-[#173324]">{emptyMessage}</p>
            <p className="mt-1 text-xs text-[#789083]">
              Super Admin now shows database records only. New public signups will appear here after `/signup` creates a pending approval.
            </p>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1500px] text-left">
          <thead>
            <tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-wider text-[#789083]">
              {["Business name", "Contact", "Phone", "Email", "Business type", "Package", "Status", "Days", "Users/cashiers", "Renewal", "Amount", "Created", "Actions"].map((heading) => <th key={heading} className="px-4 py-3.5">{heading}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const selectedPlan = packageSelections[row.id] ?? row.packageSelected;
              return (
                <tr key={row.id} className="border-t border-[#EEF3EF] text-xs text-[#60766B]">
                  <td className="px-4 py-3 font-black text-[#173324]">{row.name}</td>
                  <td className="px-4 py-3">{row.contactPerson}</td>
                  <td className="px-4 py-3">{row.phone}</td>
                  <td className="px-4 py-3">{row.email}</td>
                  <td className="px-4 py-3">{row.businessType}</td>
                  <td className="px-4 py-3">
                    <select value={selectedPlan} onChange={(event) => onPackageChange(row.id, event.target.value)} className="rounded-lg border border-[#DDEAE0] bg-white px-2 py-2 text-xs font-bold text-[#173324]">
                      {allPackageOptions.map((option) => <option key={option}>{option}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3"><Status row={row} /></td>
                  <td className="px-4 py-3 font-black">{row.daysRemaining}</td>
                  <td className="px-4 py-3">{row.usersCount ?? "Not set"}</td>
                  <td className="px-4 py-3">{formatDate(row.renewalDate)}</td>
                  <td className="px-4 py-3 font-black">{formatMoney(row.amount)}</td>
                  <td className="px-4 py-3">{formatDate(row.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {displayStatus(row) === "Pending Approval" ? <Action disabled={savingId.startsWith(`${row.id}:approve`)} onClick={() => onAction(row.id, "approve")}>Approve Trial</Action> : null}
                      <Action disabled={savingId.startsWith(`${row.id}:suspend`)} onClick={() => onAction(row.id, "suspend")}>Suspend</Action>
                      <Action disabled={savingId.startsWith(`${row.id}:extend`)} onClick={() => onAction(row.id, "extend", { days: 7 })}>+7 days</Action>
                      <Action disabled={savingId.startsWith(`${row.id}:extend`)} onClick={() => onAction(row.id, "extend", { days: 14 })}>+14 days</Action>
                      <Action disabled={savingId.startsWith(`${row.id}:activate`)} onClick={() => onAction(row.id, "activate", { packagePlan: selectedPlan === "Trial" ? "Lite" : selectedPlan })}>Mark Paid</Action>
                      <Action disabled={savingId.startsWith(`${row.id}:change_package`)} onClick={() => onAction(row.id, "change_package", { packagePlan: selectedPlan })}>Change Package</Action>
                      <Action onClick={() => onView(row)}>View</Action>
                    </div>
                    {activeTab === "subscriptions" ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {packageOptions.map((plan) => (
                          <Action key={plan} disabled={savingId.startsWith(`${row.id}:activate:${plan}`)} onClick={() => onAction(row.id, "activate", { packagePlan: plan })}>
                            {plan}
                          </Action>
                        ))}
                      </div>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SettingsPanel({ session }: { session: SuperAdminSession | null }) {
  return (
    <section className="mt-5 grid gap-4 xl:grid-cols-2">
      <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#D4A017]">Security</p>
        <h2 className="mt-1 text-xl font-black text-[#173324]">Super Admin access</h2>
        <p className="mt-3 text-sm leading-6 text-[#789083]">
          Super Admin login is isolated from normal business sessions and validated through server-side environment variables.
        </p>
        <div className="mt-4 rounded-xl bg-[#F8FBF8] p-4 text-xs font-bold leading-6 text-[#60766B]">
          Current admin: <span className="font-black text-[#173324]">{session?.email ?? "Not signed in"}</span><br />
          Required env keys: <span className="font-black text-[#173324]">SUPER_ADMIN_EMAIL</span> and <span className="font-black text-[#173324]">SUPER_ADMIN_PASSWORD</span>
        </div>
      </article>
      <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#16A34A]">Operational note</p>
        <h2 className="mt-1 text-xl font-black text-[#173324]">MVP controls</h2>
        <p className="mt-3 text-sm leading-6 text-[#789083]">
          Package activation, suspension and trial extension are live database actions. Email notifications and payment reconciliation are still manual for this MVP.
        </p>
      </article>
    </section>
  );
}

function DetailsPanel({ row, onClose }: { row: AdminBusinessRow; onClose: () => void }) {
  const details = [
    ["Business name", row.name],
    ["Contact person", row.contactPerson],
    ["Phone", row.phone],
    ["Email", row.email],
    ["Business type", row.businessType],
    ["Preferred package", row.packageSelected],
    ["Users/cashiers", row.usersCount?.toString() ?? "Not set"],
    ["Signup date", formatDate(row.createdAt)],
    ["Current status", displayStatus(row)],
    ["Trial started", formatDate(row.trialStartedAt)],
    ["Trial ends", formatDate(row.trialEndsAt)],
    ["Renewal date", formatDate(row.renewalDate)],
    ["Amount", formatMoney(row.amount)],
    ["Message", row.message || "No message provided."],
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#07120D]/55 p-4">
      <aside className="ml-auto flex h-full w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/20">
        <header className="flex items-start justify-between gap-4 border-b border-[#E8F0EA] p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#D4A017]">Business details</p>
            <h2 className="mt-1 text-xl font-black text-[#173324]">{row.name}</h2>
          </div>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-[#DDEAE0] text-[#60766B]">
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid gap-3">
            {details.map(([label, value]) => (
              <div key={label} className="rounded-xl border border-[#EEF3EF] bg-[#F8FBF8] p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}</p>
                <p className="mt-1 text-sm font-bold text-[#173324]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function Summary({ icon: Icon, label, value, gold, danger }: { icon: LucideIcon; label: string; value: number | string; gold?: boolean; danger?: boolean }) {
  const tone = danger ? "bg-[#EF4444]/10 text-[#EF4444]" : gold ? "bg-[#D4A017]/12 text-[#A57809]" : "bg-[#16A34A]/10 text-[#16A34A]";
  return (
    <article className="rounded-2xl border border-[#DDEAE0] bg-white p-4 shadow-sm shadow-[#12311F]/5">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon size={18} /></span>
      <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}</p>
      <p className="mt-1 text-xl font-black text-[#173324]">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </article>
  );
}

function Status({ row }: { row: AdminBusinessRow }) {
  const value = displayStatus(row);
  const tone =
    value === "Active Paid"
      ? "bg-[#16A34A]/10 text-[#0F8C42]"
      : value === "Trial Active"
      ? "bg-[#D4A017]/12 text-[#8A670C]"
      : value === "Pending Approval"
      ? "bg-[#3B82F6]/10 text-[#2563EB]"
      : "bg-[#EF4444]/10 text-[#EF4444]";
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${tone}`}>{value}</span>;
}

function Action({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button disabled={disabled} onClick={onClick} className="inline-flex items-center gap-1 rounded-lg border border-[#DDEAE0] bg-white px-2.5 py-1.5 text-[10px] font-black text-[#60766B] hover:bg-[#F8FBF8] disabled:opacity-50">
      {children} <ChevronRight size={11} />
    </button>
  );
}
