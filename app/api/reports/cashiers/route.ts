import { NextResponse } from "next/server";
import { getCashierReport } from "@/lib/report-data";

export async function GET() {
  return NextResponse.json({ data: await getCashierReport() });
}
