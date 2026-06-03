import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getDemoBusinessId, mapUserForPage } from "@/lib/db-data";
import { prisma } from "@/lib/prisma";
import { userData } from "@/lib/user-validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const parsed = userData(await request.json());
  if (parsed.errors) return NextResponse.json({ error: parsed.errors.join(" ") }, { status: 400 });

  const existing = await prisma.user.findFirst({ where: { id, businessId } });
  if (!existing) return NextResponse.json({ error: "User not found." }, { status: 404 });

  if (parsed.data.branchId) {
    const branch = await prisma.branch.findFirst({ where: { id: parsed.data.branchId, businessId } });
    if (!branch) return NextResponse.json({ error: "Selected branch was not found." }, { status: 404 });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: parsed.data,
      include: { branch: true },
    });
    return NextResponse.json({ data: mapUserForPage(user), message: "User updated." });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update user." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const existing = await prisma.user.findFirst({ where: { id, businessId } });
  if (!existing) return NextResponse.json({ error: "User not found." }, { status: 404 });

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { status: "Inactive" },
      include: { branch: true },
    });
    return NextResponse.json({ data: mapUserForPage(user), message: "User deactivated." });
  } catch {
    return NextResponse.json({ error: "Failed to deactivate user." }, { status: 500 });
  }
}
