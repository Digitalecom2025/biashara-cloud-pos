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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const context = await getBusinessContext();
  if (!context.businessId) return NextResponse.json({ error: "Business session required." }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.rewardRule.findFirst({ where: { id, businessId: context.businessId } });
  if (!existing) return NextResponse.json({ error: "Reward rule not found." }, { status: 404 });

  const body = await request.json();
  const thresholdAmount = body.thresholdAmount === undefined ? undefined : Number(body.thresholdAmount);
  const startDate = body.startDate ? new Date(String(body.startDate)) : undefined;
  const endDate = body.endDate ? new Date(String(body.endDate)) : body.endDate === "" ? null : undefined;

  if (thresholdAmount !== undefined && (!Number.isFinite(thresholdAmount) || thresholdAmount < 0)) {
    return NextResponse.json({ error: "Threshold amount must be 0 or greater." }, { status: 400 });
  }
  if (startDate && Number.isNaN(startDate.getTime())) return NextResponse.json({ error: "Start date is invalid." }, { status: 400 });
  if (endDate instanceof Date && Number.isNaN(endDate.getTime())) return NextResponse.json({ error: "End date is invalid." }, { status: 400 });

  const rule = await prisma.rewardRule.update({
    where: { id },
    data: {
      name: body.name === undefined ? undefined : String(body.name).trim(),
      type: body.type === undefined ? undefined : String(body.type).trim(),
      thresholdAmount,
      rewardDescription: body.rewardDescription === undefined ? undefined : String(body.rewardDescription).trim(),
      startDate,
      endDate,
      status: body.status === undefined ? undefined : String(body.status).trim(),
    },
  });

  return NextResponse.json({ success: true, message: "Reward rule updated.", rule: normalizeRule(rule) });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const context = await getBusinessContext();
  if (!context.businessId) return NextResponse.json({ error: "Business session required." }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.rewardRule.findFirst({ where: { id, businessId: context.businessId } });
  if (!existing) return NextResponse.json({ error: "Reward rule not found." }, { status: 404 });

  await prisma.rewardRule.delete({ where: { id } });
  return NextResponse.json({ success: true, message: "Reward rule deleted." });
}

