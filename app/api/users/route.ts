import { NextResponse } from "next/server";
import { getUsersForPage } from "@/lib/db-data";

export async function GET() {
  const users = await getUsersForPage();
  return NextResponse.json({ data: users });
}
