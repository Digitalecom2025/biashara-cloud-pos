import { NextResponse } from "next/server";
import { getPartyReports } from "@/lib/report-data";

export async function GET() {
  return NextResponse.json({ data: await getPartyReports() });
}
