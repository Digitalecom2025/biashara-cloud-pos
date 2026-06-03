import { StockAdjustmentsPage } from "@/components/stock-adjustments-page";
import { getProductsForPage, getStockAdjustmentsForPage, getWarehousesForPage } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function StockAdjustmentsRoute() {
  const [adjustments, products, warehouses] = await Promise.all([getStockAdjustmentsForPage(), getProductsForPage(), getWarehousesForPage()]);
  return <StockAdjustmentsPage initialAdjustments={adjustments} initialProducts={products} initialWarehouses={warehouses} />;
}
