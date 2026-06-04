import { NextResponse } from "next/server";
import { getExpenseReport } from "@/lib/report-data";

export async function GET() {
  return NextResponse.json({ data: await getExpenseReport() });
}
