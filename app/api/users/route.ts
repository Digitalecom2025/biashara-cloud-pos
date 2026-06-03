import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getDemoBusinessId, getUsersForPage, mapUserForPage } from "@/lib/db-data";
import { prisma } from "@/lib/prisma";
import { userData, type UserInput } from "@/lib/user-validation";

export async function GET() {
  const users = await getUsersForPage();
  return NextResponse.json({ data: users });
}

export async function POST(request: Request) {
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const body = (await request.json()) as UserInput;
  const parsed = userData(body);
  if (parsed.errors) return NextResponse.json({ error: parsed.errors.join(" ") }, { status: 400 });

  if (parsed.data.branchId) {
    const branch = await prisma.branch.findFirst({ where: { id: parsed.data.branchId, businessId } });
    if (!branch) return NextResponse.json({ error: "Selected branch was not found." }, { status: 404 });
  }

  try {
    const user = await prisma.user.create({
      data: { businessId, ...parsed.data },
      include: { branch: true },
    });
    return NextResponse.json({ data: mapUserForPage(user), message: "User created." }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create user." }, { status: 500 });
  }
}
