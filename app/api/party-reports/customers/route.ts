import { NextResponse } from "next/server";
import { getPartyReports } from "@/lib/report-data";

export async function GET() {
  const data = await getPartyReports();
  return NextResponse.json({ data: { ...data, rows: data.rows.filter((row) => row.type === "Customer") } });
}
