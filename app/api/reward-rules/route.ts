import { NextRequest, NextResponse } from "next/server";
import { getBusinessContext } from "@/lib/db-data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function normalizeRule(rule: {
  id: string;
  name: string;
  type: string;
  thresholdAmount: unknown;
  rewardDescription: string;
  startDate: Date;
  endDate: Date | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: rule.id,
    name: rule.name,
    type: rule.type,
    thresholdAmount: Number(rule.thresholdAmount ?? 0),
    rewardDescription: rule.rewardDescription,
    startDate: rule.startDate.toISOString().slice(0, 10),
    endDate: rule.endDate ? rule.endDate.toISOString().slice(0, 10) : "",
    status: rule.status,
    createdAt: rule.createdAt.toISOString(),
    updatedAt: rule.updatedAt.toISOString(),
  };
}

export async function GET() {
  const context = await getBusinessContext();
  if (!context.businessId) return NextResponse.json({ rules: [] });

  const rules = await prisma.rewardRule.findMany({
    where: { businessId: context.businessId },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ rules: rules.map(normalizeRule) });
}

export async function POST(request: NextRequest) {
  const context = await getBusinessContext();
  if (!context.businessId) return NextResponse.json({ error: "Business session required." }, { status: 401 });

  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const type = String(body.type ?? "").trim();
  const rewardDescription = String(body.rewardDescription ?? "").trim();
  const status = String(body.status ?? "active").trim() || "active";
  const thresholdAmount = Number(body.thresholdAmount ?? 0);
  const startDate = body.startDate ? new Date(String(body.startDate)) : new Date();
  const endDate = body.endDate ? new Date(String(body.endDate)) : null;

  if (!name) return NextResponse.json({ error: "Rule name is required." }, { status: 400 });
  if (!type) return NextResponse.json({ error: "Rule type is required." }, { status: 400 });
  if (!Number.isFinite(thresholdAmount) || thresholdAmount < 0) return NextResponse.json({ error: "Threshold amount must be 0 or greater." }, { status: 400 });
  if (!rewardDescription) return NextResponse.json({ error: "Reward description is required." }, { status: 400 });
  if (Number.isNaN(startDate.getTime())) return NextResponse.json({ error: "Start date is invalid." }, { status: 400 });
  if (endDate && Number.isNaN(endDate.getTime())) return NextResponse.json({ error: "End date is invalid." }, { status: 400 });

  const rule = await prisma.rewardRule.create({
    data: {
      businessId: context.businessId,
      name,
      type,
      thresholdAmount,
      rewardDescription,
      startDate,
      endDate,
      status,
    },
  });

  return NextResponse.json({ success: true, message: "Reward rule saved.", rule: normalizeRule(rule) }, { status: 201 });
}

