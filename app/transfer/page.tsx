import { TransfersPage } from "@/components/transfers-page";
import { getProductsForPage, getTransfersForPage, getWarehousesForPage } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function TransferRoute() {
  const [transfers, products, warehouses] = await Promise.all([getTransfersForPage(), getProductsForPage(), getWarehousesForPage()]);
  return <TransfersPage initialTransfers={transfers} initialProducts={products} initialWarehouses={warehouses} />;
}
