import { NextResponse } from "next/server";
import { adminTokenFromRequest, verifySuperAdminToken } from "@/lib/super-admin-auth";
import { getAdminBusinesses } from "@/lib/admin-data";

export async function GET(request: Request) {
  if (!verifySuperAdminToken(adminTokenFromRequest(request))) {
    return NextResponse.json({ error: "Super Admin login required." }, { status: 401 });
  }

  const data = await getAdminBusinesses();
  return NextResponse.json({
    data: {
      summary: data.summary,
      rows: data.rows.filter((row) => ["pending_approval", "trial", "expired"].includes(row.subscriptionStatus) || row.approvalStatus === "pending_approval"),
    },
  });
}
