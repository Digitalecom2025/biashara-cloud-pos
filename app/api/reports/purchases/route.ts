import { NextResponse } from "next/server";
import { getPurchaseReport } from "@/lib/report-data";

export async function GET() {
  return NextResponse.json({ data: await getPurchaseReport() });
}
