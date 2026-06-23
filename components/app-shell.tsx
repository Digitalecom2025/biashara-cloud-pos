"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeftRight,
  Bell,
  BrainCircuit,
  CalendarCheck,
  ChartNoAxesCombined,
  CircleHelp,
  ContactRound,
  Files,
  Gift,
  HandCoins,
  Landmark,
  LayoutDashboard,
  LogOut,
  Lock,
  Menu,
  MessageSquareText,
  Package,
  ReceiptText,
  RefreshCw,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Store,
  Truck,
  Users,
  WalletCards,
  Warehouse,
  X,
  Zap,
} from "lucide-react";
import { sidebarItems } from "@/lib/navigation";
import { PwaControls } from "@/components/pwa-controls";
import {
  canAccessRoute,
  clearDemoSession,
  getDemoSession,
  isProtectedClientRoute,
  sidebarItemsForRole,
  type DemoSession,
} from "@/lib/demo-auth";
import {
  canBusinessAccessRoute,
  clearBusinessSession,
  getBusinessSession,
  sidebarItemsForBusinessRole,
  type BusinessSession,
} from "@/lib/business-session";
import { featureLabels, getLockedFeatureMessage, getUpgradeTarget, isFeatureActive, routeFeatureMap, type PackageFeature } from "@/lib/package-access";

const icons = {
  ArrowLeftRight,
  BrainCircuit,
  CalendarCheck,
  ChartNoAxesCombined,
  ContactRound,
  Files,
  Gift,
  HandCoins,
  Landmark,
  LayoutDashboard,
  MessageSquareText,
  Package,
  ReceiptText,
  RefreshCw,
  Settings,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Store,
  Truck,
  Users,
  WalletCards,
  Warehouse,
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [session, setSession] = useState<DemoSession | null>(null);
  const [businessSession, setBusinessSession] = useState<BusinessSession | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const bypassShell = pathname === "/" || pathname === "/login" || pathname === "/signup" || pathname.startsWith("/super-admin");
  const protectedRoute = isProtectedClientRoute(pathname);

  useEffect(() => {
    if (bypassShell) return;

    const timer = window.setTimeout(() => {
      const currentSession = getDemoSession();
      const currentBusinessSession = getBusinessSession();
      setSession(currentSession);
      setBusinessSession(currentBusinessSession);
      setAuthReady(true);
      if (!currentSession && !currentBusinessSession && protectedRoute) router.replace("/login");
    }, 0);

    return () => window.clearTimeout(timer);
  }, [bypassShell, protectedRoute, router]);

  const visibleSidebarItems = useMemo(() => {
    if (businessSession) return sidebarItemsForBusinessRole(businessSession.userRole);
    if (!session) return sidebarItems;
    return sidebarItemsForRole(session.demoUserRole);
  }, [businessSession, session]);

  const hasRouteAccess =
    !protectedRoute ||
    (!session && !businessSession) ||
    (businessSession ? canBusinessAccessRoute(pathname, businessSession.userRole) : session ? canAccessRoute(pathname, session.demoUserRole) : true);

  const currentPage =
    sidebarItems.find((item) => item.href === pathname)?.label ?? "Dashboard";
  const businessPlan = businessSession?.selectedPlan ?? businessSession?.packagePlan ?? null;
  const routeFeature = useMemo(() => getRouteFeature(pathname), [pathname]);
  const packageLocked = Boolean(businessSession && routeFeature && !isFeatureActive(businessPlan, routeFeature));

  function logout() {
    clearDemoSession();
    clearBusinessSession();
    setSession(null);
    setBusinessSession(null);
    router.replace("/login");
  }

  if (bypassShell) return <>{children}</>;

  if (!authReady || (!session && !businessSession && protectedRoute)) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F5FAF6] p-4">
        <div className="rounded-2xl border border-[#DDEAE0] bg-white p-6 text-center shadow-sm shadow-[#12311F]/5">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#12311F] text-lg font-black text-[#22C55E]">LS</span>
          <p className="mt-4 text-sm font-black text-[#173324]">Checking account session...</p>
          <p className="mt-1 text-xs text-[#789083]">Redirecting to login if needed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5FAF6]">
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-[#07120D]/55 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col bg-[#07120D] text-[#F6FFF8] shadow-2xl transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-white/8 px-5">
          <Link href="/dashboard" className="flex items-center gap-3" aria-label="LeadsStacks POS dashboard">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#16A34A] text-lg font-black text-white shadow-lg shadow-[#16A34A]/20">
              LS
            </span>
            <span>
              <span className="block text-[15px] font-black tracking-wide">LEADSSTACKS</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4A017]">
                POS
              </span>
            </span>
          </Link>
          <button
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            className="text-[#B8C7BD] hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mx-4 mt-4 rounded-xl border border-white/8 bg-[#0E2418] p-3">
          <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-[#B8C7BD]">
            <span>Main branch</span>
            <Store size={13} className="text-[#22C55E]" />
          </div>
          <p className="truncate text-xs font-semibold text-[#F6FFF8]">{businessSession?.branchName ?? session?.demoUserBranch ?? "Main Branch"}</p>
        </div>

        <nav className="sidebar-scroll mt-4 flex-1 overflow-y-auto px-3 pb-5" aria-label="Main navigation">
          {visibleSidebarItems.map((item) => {
            const Icon = icons[item.icon as keyof typeof icons];
            const active = item.href === pathname;
            const feature = routeFeatureMap[item.href];
            const locked = Boolean(businessSession && feature && !isFeatureActive(businessPlan, feature));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`mb-0.5 flex items-center gap-3 rounded-lg px-3 py-[9px] text-[12px] font-semibold ${
                  active
                    ? "bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/15"
                    : "text-[#B8C7BD] hover:bg-[#0E2418] hover:text-[#F6FFF8]"
                }`}
              >
                <Icon size={16} strokeWidth={active ? 2.4 : 1.8} />
                <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                  <span className="truncate">{item.label}</span>
                  {locked && <span className="rounded-full border border-[#D4A017]/35 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#D4A017]">Lock</span>}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/8 p-4">
          <div className="rounded-xl bg-[#0E2418] p-3">
            <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#D4A017]/15 text-[#D4A017]">
              <Zap size={16} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold text-[#F6FFF8]">{businessSession?.userName ?? session?.demoUserName ?? "LeadsStacks POS"}</p>
              <p className="truncate text-[10px] text-[#B8C7BD]">{businessSession?.userRole ?? session?.demoUserTitle ?? "Business User"} - Active</p>
              <p className="truncate text-[10px] text-[#B8C7BD]">Business Plan · Active</p>
            </div>
          </div>
        </div>
        </div>
        <div className="px-4 pb-4">
          <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#D4A017]/30 bg-[#D4A017]/10 px-3 py-2.5 text-[11px] font-black text-[#D4A017] hover:bg-[#D4A017]/15">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#DDEAE0] bg-white/95 px-4 backdrop-blur md:px-7">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-[#DDEAE0] text-[#173324] lg:hidden"
            >
              <Menu size={19} />
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#789083]">
                Business workspace
              </p>
              <h1 className="text-base font-black text-[#10271B] md:text-lg">{currentPage}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <label className="relative hidden xl:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#789083]" size={16} />
              <input
                aria-label="Global search"
                placeholder="Search anything..."
                className="w-56 rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] py-2.5 pl-9 pr-3 text-xs outline-none placeholder:text-[#8CA197] focus:border-[#16A34A]"
              />
            </label>

            <Link href="/settings" className="hidden items-center gap-2 rounded-xl border border-[#D4A017]/35 bg-[#FFF9E8] px-3 py-2.5 text-xs font-bold text-[#8A670C] hover:bg-[#FFF2C9] sm:flex">
              <Zap size={15} />
              <span>Setup 72%</span>
            </Link>

            <PwaControls />

            <a
              href="mailto:admin@integratedrevenue.co.ke?subject=LeadsStacks%20POS%20Support"
              aria-label="Help"
              className="hidden h-10 w-10 place-items-center rounded-xl border border-[#DDEAE0] text-[#60766B] hover:bg-[#F5FAF6] md:grid"
            >
              <CircleHelp size={18} />
            </a>

            <button
              aria-label="Notifications"
              disabled
              title="Notifications coming soon"
              className="relative grid h-10 w-10 place-items-center rounded-xl border border-[#DDEAE0] text-[#60766B] hover:bg-[#F5FAF6]"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border border-white bg-[#EF4444]" />
            </button>

            <div className="flex items-center gap-2 rounded-xl py-1 pl-1 text-left">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#12311F] text-xs font-black text-[#F6FFF8]">
                {(businessSession?.userName ?? session?.demoUserName)?.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase() ?? "LS"}
              </span>
              <span className="hidden md:block">
                <span className="block text-xs font-bold text-[#173324]">{businessSession?.userName ?? session?.demoUserName ?? "Business User"}</span>
                <span className="block text-[10px] text-[#789083]">{businessSession?.userRole ?? session?.demoUserTitle ?? "Business Role"} - {businessSession?.till ?? session?.demoUserTill ?? "Assigned till"}</span>
              </span>
            </div>

            <button onClick={logout} className="flex items-center gap-2 rounded-xl border border-[#D4A017]/35 bg-[#FFF9E8] px-2.5 py-2.5 text-[11px] font-black text-[#8A670C] hover:bg-[#FFF2C9] sm:px-3 sm:text-xs">
              <LogOut size={15} /> Logout
            </button>
          </div>
        </header>

        <main className="min-h-[calc(100vh-76px)] p-4 md:p-7">
          {!hasRouteAccess ? (
            <AccessRestricted currentPage={currentPage} role={businessSession?.userRole ?? session?.demoUserTitle ?? "Business role"} />
          ) : packageLocked && routeFeature ? (
            <LockedFeaturePage feature={routeFeature} plan={businessPlan ?? "Lite"} />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

function getRouteFeature(pathname: string): PackageFeature | undefined {
  const exact = routeFeatureMap[pathname];
  if (exact) return exact;
  const firstSegment = `/${pathname.split("/").filter(Boolean)[0] ?? ""}`;
  return routeFeatureMap[firstSegment];
}

function LockedFeaturePage({ feature, plan }: { feature: PackageFeature; plan: string }) {
  const target = getUpgradeTarget(plan, feature);
  return (
    <div className="mx-auto grid min-h-[calc(100vh-140px)] max-w-3xl place-items-center">
      <article className="rounded-3xl border border-[#DDEAE0] bg-white p-8 text-center shadow-sm shadow-[#12311F]/5">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#D4A017]/12 text-[#9A7108]">
          <Lock size={24} />
        </span>
        <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-[#D4A017]">{plan} package feature</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-[#173324]">{featureLabels[feature]} is locked</h2>
        <p className="mt-3 text-sm leading-6 text-[#789083]">{getLockedFeatureMessage(plan, feature)}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/subscriptions" className="rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white hover:bg-[#12883E]">Upgrade to {target}</Link>
          <Link href="/subscriptions" className="rounded-xl border border-[#DDEAE0] px-4 py-3 text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]">View packages</Link>
        </div>
      </article>
    </div>
  );
}

function AccessRestricted({ currentPage, role }: { currentPage: string; role: string }) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-140px)] max-w-2xl place-items-center">
      <article className="rounded-3xl border border-[#DDEAE0] bg-white p-8 text-center shadow-sm shadow-[#12311F]/5">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#D4A017]/12 text-[#9A7108]">
          <CircleHelp size={24} />
        </span>
        <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-[#D4A017]">Role access</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-[#173324]">Access restricted for this role</h2>
        <p className="mt-3 text-sm leading-6 text-[#789083]">
          {role} cannot open {currentPage}. Ask the business owner or administrator to update your access.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/dashboard" className="rounded-xl bg-[#12311F] px-4 py-3 text-xs font-black text-white hover:bg-[#0E2418]">Back to dashboard</Link>
          <Link href="/login" className="rounded-xl border border-[#DDEAE0] px-4 py-3 text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]">Sign in with another account</Link>
        </div>
      </article>
    </div>
  );
}
