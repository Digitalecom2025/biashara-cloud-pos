import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getDemoBusinessId, mapProductForPage } from "@/lib/db-data";
import { prisma } from "@/lib/prisma";
import { productData } from "@/lib/product-validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const body = await request.json();
  const parsed = productData(body);
  if (parsed.errors) return NextResponse.json({ error: parsed.errors.join(" ") }, { status: 400 });

  try {
    const product = await prisma.product.update({
      where: { id, businessId },
      data: parsed.data,
    });
    return NextResponse.json({ data: mapProductForPage(product), message: "Product updated." });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A product with this code already exists." }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  try {
    const product = await prisma.product.update({
      where: { id, businessId },
      data: { status: "inactive" },
    });
    return NextResponse.json({ data: mapProductForPage(product), message: "Product deactivated." });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to deactivate product." }, { status: 500 });
  }
}
