import { NextResponse } from "next/server";
import { getBusinessesForSuperAdmin } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const businesses = await getBusinessesForSuperAdmin();
  return NextResponse.json({ data: businesses }, { headers: { "Cache-Control": "no-store" } });
}
