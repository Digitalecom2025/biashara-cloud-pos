"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";

// Keep public and authentication routes outside the operational workspace entirely.
const publicRoutes = ["/", "/features", "/pricing", "/solutions", "/blog", "/guides", "/resources", "/about", "/contact", "/privacy", "/terms"];
const explicitPublicProductRoutes = ["/products/crm", "/products/leads-store"];
const authRoutes = ["/login", "/signup"];

function matchesRoute(pathname: string, route: string) {
  return pathname === route || (route !== "/" && pathname.startsWith(`${route}/`));
}

export function RouteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublic = publicRoutes.some((route) => matchesRoute(pathname, route)) || explicitPublicProductRoutes.includes(pathname);
  const isAuth = authRoutes.some((route) => matchesRoute(pathname, route));
  const isSuperAdmin = matchesRoute(pathname, "/super-admin");

  if (isPublic || isAuth || isSuperAdmin) return <>{children}</>;
  return <AppShell>{children}</AppShell>;
}
