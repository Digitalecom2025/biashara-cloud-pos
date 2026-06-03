import { NextResponse } from "next/server";
import { getDebtorsForPage } from "@/lib/db-data";

export async function GET() {
  const debtors = await getDebtorsForPage();
  return NextResponse.json({ data: debtors });
}
