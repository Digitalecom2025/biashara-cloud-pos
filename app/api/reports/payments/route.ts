import { NextResponse } from "next/server";
import { getPaymentMethodReport } from "@/lib/report-data";

export async function GET() {
  return NextResponse.json({ data: await getPaymentMethodReport() });
}
