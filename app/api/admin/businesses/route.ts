import { NextResponse } from "next/server";
import { adminTokenFromRequest, verifySuperAdminToken } from "@/lib/super-admin-auth";
import { getAdminBusinesses } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!verifySuperAdminToken(adminTokenFromRequest(request))) {
    return NextResponse.json({ error: "Super Admin login required." }, { status: 401 });
  }

  const data = await getAdminBusinesses();
  return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
}
