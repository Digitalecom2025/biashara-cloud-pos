import { NextResponse } from "next/server";
import { getSalesReport } from "@/lib/report-data";

export async function GET() {
  return NextResponse.json({ data: await getSalesReport() });
}
