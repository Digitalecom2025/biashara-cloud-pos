import { NextResponse } from "next/server";
import { getWarehouseProductsForPage, getWarehousesForPage } from "@/lib/db-data";

export async function GET() {
  const [warehouses, products] = await Promise.all([getWarehousesForPage(), getWarehouseProductsForPage()]);
  return NextResponse.json({ data: { warehouses, products } });
}
