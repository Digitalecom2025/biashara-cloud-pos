import { WarehousePage } from "@/components/warehouse-page";
import { getWarehouseProductsForPage, getWarehousesForPage } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function WarehouseRoute() {
  const [warehouses, products] = await Promise.all([getWarehousesForPage(), getWarehouseProductsForPage()]);
  return <WarehousePage initialWarehouses={warehouses} initialProducts={products} />;
}
