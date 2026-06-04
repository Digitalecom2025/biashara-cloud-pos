import { NextResponse } from "next/server";
import { getProductSalesReport } from "@/lib/report-data";

export async function GET() {
  return NextResponse.json({ data: await getProductSalesReport() });
}
