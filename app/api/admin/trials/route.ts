import { NextResponse } from "next/server";
import { adminTokenFromRequest, verifySuperAdminToken } from "@/lib/super-admin-auth";
import { getAdminBusinesses } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!verifySuperAdminToken(adminTokenFromRequest(request))) {
    return NextResponse.json({ error: "Super Admin login required." }, { status: 401 });
  }

  const data = await getAdminBusinesses();
  return NextResponse.json({
    data: {
      summary: data.summary,
      rows: data.rows.filter((row) => ["pending_approval", "pending", "new", "trial", "expired"].includes(row.subscriptionStatus) || ["pending_approval", "pending", "new"].includes(row.approvalStatus)),
    },
  }, { headers: { "Cache-Control": "no-store" } });
}
