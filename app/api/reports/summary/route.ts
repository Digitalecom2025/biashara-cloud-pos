import { NextResponse } from "next/server";
import { getReportsSummary } from "@/lib/report-data";

export async function GET() {
  return NextResponse.json({ data: await getReportsSummary() });
}
