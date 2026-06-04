import { NextResponse } from "next/server";
import { getStockReport } from "@/lib/report-data";

export async function GET() {
  return NextResponse.json({ data: await getStockReport() });
}
