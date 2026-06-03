import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getDemoBusinessId, getProductsForPage, mapProductForPage } from "@/lib/db-data";
import { productData, type ProductInput } from "@/lib/product-validation";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await getProductsForPage();
  return NextResponse.json({ data: products });
}

export async function POST(request: Request) {
  const businessId = await getDemoBusinessId();
  if (!businessId) return NextResponse.json({ error: "Demo business has not been seeded." }, { status: 500 });

  const body = (await request.json()) as ProductInput;
  const parsed = productData(body);
  if (parsed.errors) return NextResponse.json({ error: parsed.errors.join(" ") }, { status: 400 });

  try {
    const product = await prisma.product.create({
      data: {
        businessId,
        ...parsed.data,
      },
    });
    return NextResponse.json({ data: mapProductForPage(product), message: "Product created." }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A product with this code already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
  }
}
