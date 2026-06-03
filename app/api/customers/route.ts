import { NextResponse } from "next/server";
import { getCustomersForPage } from "@/lib/db-data";

export async function GET() {
  const customers = await getCustomersForPage();
  return NextResponse.json({ data: customers });
}
