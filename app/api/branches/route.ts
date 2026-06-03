import { NextResponse } from "next/server";
import { getBranchesForPage } from "@/lib/db-data";

export async function GET() {
  const branches = await getBranchesForPage();
  return NextResponse.json({ data: branches });
}
