import { NextResponse } from "next/server";
import { getFinanceSummaryData } from "@/lib/finance-data";

export async function GET() {
  const data = await getFinanceSummaryData();
  return NextResponse.json({ data });
}
