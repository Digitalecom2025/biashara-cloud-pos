import { NextResponse } from "next/server";
import { getBranchReport } from "@/lib/report-data";

export async function GET() {
  return NextResponse.json({ data: await getBranchReport() });
}
