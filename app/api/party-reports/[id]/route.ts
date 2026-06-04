import { NextResponse } from "next/server";
import { getPartyDetail } from "@/lib/report-data";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPartyDetail(id);
  if (!data) return NextResponse.json({ error: "Party not found." }, { status: 404 });
  return NextResponse.json({ data });
}
