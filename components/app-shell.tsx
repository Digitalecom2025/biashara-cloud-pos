"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowLeftRight,
  Bell,
  BrainCircuit,
  CalendarCheck,
  ChartNoAxesCombined,
  ChevronDown,
  CircleHelp,
  ContactRound,
  Files,
  Gift,
  HandCoins,
  Landmark,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  MessageSquareText,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
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

import {
  dashboardItem,
  sidebarGroups,
  sidebarItems,
  type SidebarItem,
} from "@/lib/navigation";

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

import {
  featureLabels,
  getLockedFeatureMessage,
  getUpgradeTarget,
  isFeatureActive,
  routeFeatureMap,
  type PackageFeature,
} from "@/lib/package-access";

type DesktopSidebarMode =
  | "expanded"
  | "compact"
  | "hidden";

const SIDEBAR_MODE_STORAGE_KEY =
  "leadsstacks.desktopSidebarMode";

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

export function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [
    desktopSidebarMode,
    setDesktopSidebarMode,
  ] =
    useState<DesktopSidebarMode>(
      "expanded"
    );

  const [session, setSession] =
    useState<DemoSession | null>(null);

  const [
    businessSession,
    setBusinessSession,
  ] = useState<BusinessSession | null>(
    null
  );

  const [authReady, setAuthReady] =
    useState(false);

  const [
    openGroupOverride,
    setOpenGroupOverride,
  ] = useState<{
    pathname: string;
    label: string | null;
  } | null>(null);

  const bypassShell =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/super-admin") ||
    ["/features", "/pricing", "/solutions", "/blog", "/about", "/contact", "/privacy", "/terms"].some((route) => pathname === route || pathname.startsWith(`${route}/`));

  const protectedRoute =
    isProtectedClientRoute(pathname);

  useEffect(() => {
    if (bypassShell) {
      return;
    }

    const timer = window.setTimeout(
      () => {
        const currentSession =
          getDemoSession();

        const currentBusinessSession =
          getBusinessSession();

        setSession(currentSession);
        setBusinessSession(
          currentBusinessSession
        );
        setAuthReady(true);

        if (
          !currentSession &&
          !currentBusinessSession &&
          protectedRoute
        ) {
          router.replace("/login");
        }
      },
      0
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    bypassShell,
    protectedRoute,
    router,
  ]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        const savedMode =
          window.localStorage.getItem(
            SIDEBAR_MODE_STORAGE_KEY
          );

        if (
          savedMode === "expanded" ||
          savedMode === "compact" ||
          savedMode === "hidden"
        ) {
          setDesktopSidebarMode(
            savedMode
          );
        }
      },
      0
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const visibleSidebarItems =
    useMemo(() => {
      if (businessSession) {
        return sidebarItemsForBusinessRole(
          businessSession.userRole
        );
      }

      if (!session) {
        return sidebarItems;
      }

      return sidebarItemsForRole(
        session.demoUserRole
      );
    }, [businessSession, session]);

  const visibleSidebarItemHrefs =
    useMemo(
      () =>
        new Set(
          visibleSidebarItems.map(
            (item) => item.href
          )
        ),
      [visibleSidebarItems]
    );

  const visibleDashboardItem =
    visibleSidebarItemHrefs.has(
      dashboardItem.href
    )
      ? dashboardItem
      : null;

  const visibleSidebarGroups =
    useMemo(
      () =>
        sidebarGroups
          .map((group) => ({
            ...group,
            items: group.items.filter(
              (item) =>
                visibleSidebarItemHrefs.has(
                  item.href
                )
            ),
          }))
          .filter(
            (group) =>
              group.items.length > 0
          ),
      [visibleSidebarItemHrefs]
    );

  const activeGroupLabel = useMemo(
    () =>
      visibleSidebarGroups.find(
        (group) =>
          group.items.some((item) =>
            isRouteActive(
              pathname,
              item.href
            )
          )
      )?.label ?? null,
    [pathname, visibleSidebarGroups]
  );

  const defaultGroupLabel = useMemo(
    () =>
      visibleSidebarGroups.find(
        (group) =>
          group.defaultOpen
      )?.label ??
      visibleSidebarGroups[0]?.label ??
      null,
    [visibleSidebarGroups]
  );

  const openGroupLabel =
    openGroupOverride?.pathname ===
    pathname
      ? openGroupOverride.label
      : activeGroupLabel ??
        defaultGroupLabel;

  const hasRouteAccess =
    !protectedRoute ||
    (!session && !businessSession) ||
    (businessSession
      ? canBusinessAccessRoute(
          pathname,
          businessSession.userRole
        )
      : session
        ? canAccessRoute(
            pathname,
            session.demoUserRole
          )
        : true);

  const currentPage =
    sidebarItems.find((item) =>
      isRouteActive(
        pathname,
        item.href
      )
    )?.label ?? "Dashboard";

  const businessPlan =
    businessSession?.selectedPlan ??
    businessSession?.packagePlan ??
    null;

  const routeFeature = useMemo(
    () => getRouteFeature(pathname),
    [pathname]
  );

  const packageLocked = Boolean(
    businessSession &&
      routeFeature &&
      !isFeatureActive(
        businessPlan,
        routeFeature
      )
  );

  const expandedDesktop =
    desktopSidebarMode === "expanded";

  const compactDesktop =
    desktopSidebarMode === "compact";

  const hiddenDesktop =
    desktopSidebarMode === "hidden";

  function toggleGroup(
    groupLabel: string
  ) {
    setOpenGroupOverride({
      pathname,
      label:
        openGroupLabel === groupLabel
          ? null
          : groupLabel,
    });
  }

  function cycleDesktopSidebar() {
    const nextMode =
      desktopSidebarMode === "expanded"
        ? "compact"
        : desktopSidebarMode ===
            "compact"
          ? "hidden"
          : "expanded";

    setDesktopSidebarMode(nextMode);

    window.localStorage.setItem(
      SIDEBAR_MODE_STORAGE_KEY,
      nextMode
    );
  }

  function renderSidebarLink(
    item: SidebarItem,
    nested = false
  ) {
    const Icon =
      icons[
        item.icon as keyof typeof icons
      ];

    if (!Icon) {
      return null;
    }

    const active = isRouteActive(
      pathname,
      item.href
    );

    const feature =
      routeFeatureMap[item.href];

    const locked = Boolean(
      businessSession &&
        feature &&
        !isFeatureActive(
          businessPlan,
          feature
        )
    );

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() =>
          setSidebarOpen(false)
        }
        className={`mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] font-semibold transition ${
          nested ? "ml-1" : ""
        } ${
          active
            ? "bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/15"
            : "text-[#B8C7BD] hover:bg-[#0E2418] hover:text-[#F6FFF8]"
        }`}
      >
        <Icon
          size={17}
          strokeWidth={
            active ? 2.4 : 1.8
          }
        />

        <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
          <span className="truncate">
            {item.label}
          </span>

          {locked && (
            <span className="rounded-full border border-[#D4A017]/35 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#D4A017]">
              Lock
            </span>
          )}
        </span>
      </Link>
    );
  }

  function renderCompactSidebarLink(
    item: SidebarItem
  ) {
    const Icon =
      icons[
        item.icon as keyof typeof icons
      ];

    if (!Icon) {
      return null;
    }

    const active = isRouteActive(
      pathname,
      item.href
    );

    const feature =
      routeFeatureMap[item.href];

    const locked = Boolean(
      businessSession &&
        feature &&
        !isFeatureActive(
          businessPlan,
          feature
        )
    );

    return (
      <Link
        key={item.href}
        href={item.href}
        aria-label={item.label}
        title={item.label}
        className={`group relative grid h-11 w-11 place-items-center rounded-xl transition ${
          active
            ? "bg-[#16A34A] text-white shadow-lg shadow-[#16A34A]/20"
            : "text-[#9EB0A5] hover:bg-[#0E2418] hover:text-white"
        }`}
      >
        <Icon
          size={19}
          strokeWidth={
            active ? 2.4 : 1.8
          }
        />

        {locked && (
          <span className="absolute right-0.5 top-0.5 grid h-4 w-4 place-items-center rounded-full border border-[#D4A017]/40 bg-[#07120D] text-[#D4A017]">
            <Lock size={9} />
          </span>
        )}

        <span className="pointer-events-none absolute left-full z-[70] ml-3 hidden whitespace-nowrap rounded-lg border border-[#DDEAE0] bg-white px-3 py-2 text-[11px] font-bold text-[#173324] opacity-0 shadow-xl transition group-hover:opacity-100 lg:block">
          {item.label}
        </span>
      </Link>
    );
  }

  function logout() {
    clearDemoSession();
    clearBusinessSession();

    setSession(null);
    setBusinessSession(null);

    router.replace("/login");
  }

  if (bypassShell) {
    return <>{children}</>;
  }

  if (
    !authReady ||
    (!session &&
      !businessSession &&
      protectedRoute)
  ) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F5FAF6] p-4">
        <div className="rounded-2xl border border-[#DDEAE0] bg-white p-6 text-center shadow-sm shadow-[#12311F]/5">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#12311F] text-lg font-black text-[#22C55E]">
            LS
          </span>

          <p className="mt-4 text-sm font-black text-[#173324]">
            Checking account session...
          </p>

          <p className="mt-1 text-xs text-[#789083]">
            Redirecting to login if
            needed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5FAF6]">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-[#07120D]/55 lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col overflow-visible bg-[#07120D] text-[#F6FFF8] shadow-2xl transition-[width,transform] duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        } ${
          hiddenDesktop
            ? "lg:-translate-x-full"
            : "lg:translate-x-0"
        } ${
          compactDesktop
            ? "lg:w-20"
            : "lg:w-[264px]"
        }`}
      >
        {/* Expanded desktop and mobile header */}
        <div
          className={`flex h-[76px] items-center justify-between border-b border-white/8 px-5 ${
            expandedDesktop
              ? ""
              : "lg:hidden"
          }`}
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
            aria-label="LeadsStacks POS dashboard"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#16A34A] text-lg font-black text-white shadow-lg shadow-[#16A34A]/20">
              LS
            </span>

            <span>
              <span className="block text-[15px] font-black tracking-wide">
                LEADSSTACKS
              </span>

              <span className="block text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4A017]">
                POS
              </span>
            </span>
          </Link>

          <button
            type="button"
            aria-label="Close menu"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="text-[#B8C7BD] hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Compact desktop logo */}
        {compactDesktop && (
          <div className="hidden h-[76px] items-center justify-center border-b border-white/8 lg:flex">
            <Link
              href="/dashboard"
              aria-label="LeadsStacks POS dashboard"
              title="Dashboard"
              className="grid h-11 w-11 place-items-center rounded-2xl bg-[#16A34A] text-sm font-black text-white shadow-lg shadow-[#16A34A]/20"
            >
              LS
            </Link>
          </div>
        )}

        {/* Expanded branch card */}
        <div
          className={`mx-4 mt-4 rounded-xl border border-white/8 bg-[#0E2418] p-3 ${
            expandedDesktop
              ? ""
              : "lg:hidden"
          }`}
        >
          <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-[#B8C7BD]">
            <span>Main branch</span>

            <Store
              size={13}
              className="text-[#22C55E]"
            />
          </div>

          <p className="truncate text-xs font-semibold text-[#F6FFF8]">
            {businessSession?.branchName ??
              session?.demoUserBranch ??
              "Main Branch"}
          </p>
        </div>

        {/* Compact branch icon */}
        {compactDesktop && (
          <div className="hidden justify-center pt-4 lg:flex">
            <div
              title={
                businessSession?.branchName ??
                session?.demoUserBranch ??
                "Main Branch"
              }
              className="group relative grid h-11 w-11 place-items-center rounded-xl border border-white/8 bg-[#0E2418] text-[#22C55E]"
            >
              <Store size={18} />

              <span className="pointer-events-none absolute left-full z-[70] ml-3 whitespace-nowrap rounded-lg border border-[#DDEAE0] bg-white px-3 py-2 text-[11px] font-bold text-[#173324] opacity-0 shadow-xl transition group-hover:opacity-100">
                {businessSession?.branchName ??
                  session?.demoUserBranch ??
                  "Main Branch"}
              </span>
            </div>
          </div>
        )}

        {/* Expanded navigation */}
        <nav
          className={`sidebar-scroll mt-4 flex-1 overflow-y-auto px-3 pb-5 ${
            expandedDesktop
              ? ""
              : "lg:hidden"
          }`}
          aria-label="Main navigation"
        >
          {visibleDashboardItem &&
            renderSidebarLink(
              visibleDashboardItem
            )}

          <div className="mt-3 space-y-1">
            {visibleSidebarGroups.map(
              (group) => {
                const open =
                  openGroupLabel ===
                  group.label;

                const containsActive =
                  group.items.some(
                    (item) =>
                      isRouteActive(
                        pathname,
                        item.href
                      )
                  );

                return (
                  <section
                    key={group.label}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        toggleGroup(
                          group.label
                        )
                      }
                      aria-expanded={
                        open
                      }
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.14em] transition ${
                        containsActive
                          ? "bg-[#0E2418] text-[#22C55E]"
                          : "text-[#789083] hover:bg-[#0E2418] hover:text-[#B8C7BD]"
                      }`}
                    >
                      <span>
                        {group.label}
                      </span>

                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${
                          open
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    {open && (
                      <div className="mt-1 space-y-0.5 border-l border-white/10 pl-1">
                        {group.items.map(
                          (item) =>
                            renderSidebarLink(
                              item,
                              true
                            )
                        )}
                      </div>
                    )}
                  </section>
                );
              }
            )}
          </div>
        </nav>

        {/* Compact navigation */}
        {compactDesktop && (
          <nav
            className="sidebar-scroll hidden flex-1 flex-col items-center overflow-y-auto px-3 py-4 lg:flex"
            aria-label="Compact main navigation"
          >
            {visibleDashboardItem &&
              renderCompactSidebarLink(
                visibleDashboardItem
              )}

            {visibleSidebarGroups.map(
              (group) => (
                <div
                  key={group.label}
                  className="flex w-full flex-col items-center"
                >
                  <div className="my-3 h-px w-9 bg-white/10" />

                  <div className="space-y-2">
                    {group.items.map(
                      (item) =>
                        renderCompactSidebarLink(
                          item
                        )
                    )}
                  </div>
                </div>
              )
            )}
          </nav>
        )}

        {/* Expanded account panel */}
        <div
          className={`border-t border-white/8 p-4 ${
            expandedDesktop
              ? ""
              : "lg:hidden"
          }`}
        >
          <div className="rounded-xl bg-[#0E2418] p-3">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#D4A017]/15 text-[#D4A017]">
                <Zap size={16} />
              </span>

              <div className="min-w-0">
                <p className="truncate text-[11px] font-bold text-[#F6FFF8]">
                  {businessSession?.userName ??
                    session?.demoUserName ??
                    "LeadsStacks POS"}
                </p>

                <p className="truncate text-[10px] text-[#B8C7BD]">
                  {businessSession?.userRole ??
                    session?.demoUserTitle ??
                    "Business User"}{" "}
                  - Active
                </p>

                <p className="truncate text-[10px] text-[#B8C7BD]">
                  Business Plan · Active
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#D4A017]/30 bg-[#D4A017]/10 px-3 py-2.5 text-[11px] font-black text-[#D4A017] hover:bg-[#D4A017]/15"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>

        {/* Compact account controls */}
        {compactDesktop && (
          <div className="hidden flex-col items-center gap-3 border-t border-white/8 px-3 py-4 lg:flex">
            <div
              title={
                businessSession?.userName ??
                session?.demoUserName ??
                "Business User"
              }
              className="group relative grid h-11 w-11 place-items-center rounded-xl bg-[#D4A017]/15 text-xs font-black text-[#D4A017]"
            >
              {(businessSession?.userName ??
                session?.demoUserName)
                ?.split(" ")
                .map(
                  (part) => part[0]
                )
                .slice(0, 2)
                .join("")
                .toUpperCase() ??
                "LS"}

              <span className="pointer-events-none absolute left-full z-[70] ml-3 whitespace-nowrap rounded-lg border border-[#DDEAE0] bg-white px-3 py-2 text-[11px] font-bold text-[#173324] opacity-0 shadow-xl transition group-hover:opacity-100">
                {businessSession?.userName ??
                  session?.demoUserName ??
                  "Business User"}
              </span>
            </div>

            <button
              type="button"
              onClick={logout}
              aria-label="Logout"
              title="Logout"
              className="grid h-11 w-11 place-items-center rounded-xl border border-[#D4A017]/30 bg-[#D4A017]/10 text-[#D4A017] transition hover:bg-[#D4A017]/15"
            >
              <LogOut size={17} />
            </button>
          </div>
        )}
      </aside>

      <div
        className={`transition-[padding] duration-300 ${
          expandedDesktop
            ? "lg:pl-[264px]"
            : compactDesktop
              ? "lg:pl-20"
              : "lg:pl-0"
        }`}
      >
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#DDEAE0] bg-white/95 px-4 backdrop-blur md:px-7">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() =>
                setSidebarOpen(true)
              }
              className="grid h-10 w-10 place-items-center rounded-xl border border-[#DDEAE0] text-[#173324] transition hover:border-[#16A34A] hover:bg-[#F5FAF6] lg:hidden"
            >
              <Menu size={19} />
            </button>

            <button
              type="button"
              onClick={
                cycleDesktopSidebar
              }
              aria-label={
                getSidebarModeLabel(
                  desktopSidebarMode
                )
              }
              title={
                getSidebarModeLabel(
                  desktopSidebarMode
                )
              }
              className="hidden h-10 w-10 place-items-center rounded-xl border border-[#DDEAE0] text-[#173324] transition hover:border-[#16A34A] hover:bg-[#F5FAF6] lg:grid"
            >
              {expandedDesktop ? (
                <PanelLeftClose
                  size={19}
                />
              ) : hiddenDesktop ? (
                <PanelLeftOpen
                  size={19}
                />
              ) : (
                <Menu size={19} />
              )}
            </button>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#789083]">
                Business workspace
              </p>

              <h1 className="text-base font-black text-[#10271B] md:text-lg">
                {currentPage}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <label className="relative hidden xl:block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#789083]"
                size={16}
              />

              <input
                aria-label="Global search"
                placeholder="Search anything..."
                className="w-56 rounded-xl border border-[#DDEAE0] bg-[#F8FBF8] py-2.5 pl-9 pr-3 text-xs outline-none placeholder:text-[#8CA197] focus:border-[#16A34A]"
              />
            </label>

            <Link
              href="/settings"
              className="hidden items-center gap-2 rounded-xl border border-[#D4A017]/35 bg-[#FFF9E8] px-3 py-2.5 text-xs font-bold text-[#8A670C] hover:bg-[#FFF2C9] sm:flex"
            >
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
              type="button"
              aria-label="Notifications"
              disabled
              title="Notifications coming soon"
              className="relative grid h-10 w-10 place-items-center rounded-xl border border-[#DDEAE0] text-[#60766B]"
            >
              <Bell size={18} />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border border-white bg-[#EF4444]" />
            </button>

            <div className="flex items-center gap-2 rounded-xl py-1 pl-1 text-left">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#12311F] text-xs font-black text-[#F6FFF8]">
                {(businessSession?.userName ??
                  session?.demoUserName)
                  ?.split(" ")
                  .map(
                    (part) => part[0]
                  )
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() ??
                  "LS"}
              </span>

              <span className="hidden md:block">
                <span className="block text-xs font-bold text-[#173324]">
                  {businessSession?.userName ??
                    session?.demoUserName ??
                    "Business User"}
                </span>

                <span className="block text-[10px] text-[#789083]">
                  {businessSession?.userRole ??
                    session?.demoUserTitle ??
                    "Business Role"}{" "}
                  -{" "}
                  {businessSession?.till ??
                    session?.demoUserTill ??
                    "Assigned till"}
                </span>
              </span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 rounded-xl border border-[#D4A017]/35 bg-[#FFF9E8] px-2.5 py-2.5 text-[11px] font-black text-[#8A670C] hover:bg-[#FFF2C9] sm:px-3 sm:text-xs"
            >
              <LogOut size={15} />

              <span className="hidden sm:inline">
                Logout
              </span>
            </button>
          </div>
        </header>

        <main className="min-h-[calc(100vh-76px)] p-4 md:p-7">
          {!hasRouteAccess ? (
            <AccessRestricted
              currentPage={currentPage}
              role={
                businessSession?.userRole ??
                session?.demoUserTitle ??
                "Business role"
              }
            />
          ) : packageLocked &&
            routeFeature ? (
            <LockedFeaturePage
              feature={routeFeature}
              plan={
                businessPlan ?? "Lite"
              }
            />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

function getSidebarModeLabel(
  mode: DesktopSidebarMode
) {
  if (mode === "expanded") {
    return "Use compact sidebar";
  }

  if (mode === "compact") {
    return "Use full-screen workspace";
  }

  return "Show expanded sidebar";
}

function isRouteActive(
  pathname: string,
  href: string
) {
  return (
    pathname === href ||
    (href !== "/dashboard" &&
      pathname.startsWith(
        `${href}/`
      ))
  );
}

function getRouteFeature(
  pathname: string
): PackageFeature | undefined {
  const exact =
    routeFeatureMap[pathname];

  if (exact) {
    return exact;
  }

  const firstSegment = `/${
    pathname
      .split("/")
      .filter(Boolean)[0] ?? ""
  }`;

  return routeFeatureMap[firstSegment];
}

function LockedFeaturePage({
  feature,
  plan,
}: {
  feature: PackageFeature;
  plan: string;
}) {
  const target = getUpgradeTarget(
    plan,
    feature
  );

  return (
    <div className="mx-auto grid min-h-[calc(100vh-140px)] max-w-3xl place-items-center">
      <article className="rounded-3xl border border-[#DDEAE0] bg-white p-8 text-center shadow-sm shadow-[#12311F]/5">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#D4A017]/12 text-[#9A7108]">
          <Lock size={24} />
        </span>

        <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-[#D4A017]">
          {plan} package feature
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-tight text-[#173324]">
          {featureLabels[feature]} is
          locked
        </h2>

        <p className="mt-3 text-sm leading-6 text-[#789083]">
          {getLockedFeatureMessage(
            plan,
            feature
          )}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            href="/subscriptions"
            className="rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white hover:bg-[#12883E]"
          >
            Upgrade to {target}
          </Link>

          <Link
            href="/subscriptions"
            className="rounded-xl border border-[#DDEAE0] px-4 py-3 text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]"
          >
            View packages
          </Link>
        </div>
      </article>
    </div>
  );
}

function AccessRestricted({
  currentPage,
  role,
}: {
  currentPage: string;
  role: string;
}) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-140px)] max-w-2xl place-items-center">
      <article className="rounded-3xl border border-[#DDEAE0] bg-white p-8 text-center shadow-sm shadow-[#12311F]/5">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#D4A017]/12 text-[#9A7108]">
          <CircleHelp size={24} />
        </span>

        <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-[#D4A017]">
          Role access
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-tight text-[#173324]">
          Access restricted for this role
        </h2>

        <p className="mt-3 text-sm leading-6 text-[#789083]">
          {role} cannot open{" "}
          {currentPage}. Ask the business
          owner or administrator to update
          your access.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            href="/dashboard"
            className="rounded-xl bg-[#12311F] px-4 py-3 text-xs font-black text-white hover:bg-[#0E2418]"
          >
            Back to dashboard
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-[#DDEAE0] px-4 py-3 text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]"
          >
            Sign in with another account
          </Link>
        </div>
      </article>
    </div>
  );
}
