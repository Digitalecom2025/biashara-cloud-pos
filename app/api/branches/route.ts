import { NextResponse } from "next/server";
import { branchData, type BranchInput } from "@/lib/branch-validation";
import { getBranchesForPage, getDemoBusinessId, mapBranchForPage } from "@/lib/db-data";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const branches = await getBranchesForPage();
  return NextResponse.json({ data: branches });
}

export async function POST(request: Request) {
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const body = (await request.json()) as BranchInput;
  const parsed = branchData(body);
  if (parsed.errors) return NextResponse.json({ error: parsed.errors.join(" ") }, { status: 400 });

  try {
    const branch = await prisma.branch.create({
      data: { businessId, ...parsed.data },
      include: { users: true, products: true, sales: true },
    });
    return NextResponse.json({ data: mapBranchForPage(branch), message: "Branch created." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create branch." }, { status: 500 });
  }
}
