import { NextResponse } from "next/server";
import { branchData } from "@/lib/branch-validation";
import { getDemoBusinessId, mapBranchForPage } from "@/lib/db-data";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const parsed = branchData(await request.json());
  if (parsed.errors) return NextResponse.json({ error: parsed.errors.join(" ") }, { status: 400 });

  const existing = await prisma.branch.findFirst({ where: { id, businessId } });
  if (!existing) return NextResponse.json({ error: "Branch not found." }, { status: 404 });

  try {
    const branch = await prisma.branch.update({
      where: { id },
      data: parsed.data,
      include: { users: true, products: true, sales: true },
    });
    return NextResponse.json({ data: mapBranchForPage(branch), message: "Branch updated." });
  } catch {
    return NextResponse.json({ error: "Failed to update branch." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const existing = await prisma.branch.findFirst({ where: { id, businessId } });
  if (!existing) return NextResponse.json({ error: "Branch not found." }, { status: 404 });

  try {
    const branch = await prisma.branch.update({
      where: { id },
      data: { status: "Inactive" },
      include: { users: true, products: true, sales: true },
    });
    return NextResponse.json({ data: mapBranchForPage(branch), message: "Branch deactivated." });
  } catch {
    return NextResponse.json({ error: "Failed to deactivate branch." }, { status: 500 });
  }
}
