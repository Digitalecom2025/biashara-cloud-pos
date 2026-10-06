import { NextResponse, type NextRequest } from "next/server";

const privatePrefixes = ["/login", "/signup", "/dashboard", "/sales", "/products", "/customers", "/debtors", "/suppliers", "/purchases", "/warehouse", "/branches", "/hrm", "/finance", "/reports", "/fleet", "/settings", "/subscriptions", "/super-admin", "/transfer", "/stock-adjustments", "/payment-types", "/party-reports", "/sync-center", "/rewards", "/tax-settings", "/sms-marketing", "/ai-assistant"];

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  if (privatePrefixes.some((prefix) => request.nextUrl.pathname === prefix || request.nextUrl.pathname.startsWith(`${prefix}/`))) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
