import { PurchasesPage } from "@/components/purchases-page";
import { getProductsForPage, getPurchasesForPage, getSuppliersForPage } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function PurchasesRoute() {
  const [purchases, suppliers, products] = await Promise.all([getPurchasesForPage(), getSuppliersForPage(), getProductsForPage()]);
  return <PurchasesPage initialPurchases={purchases} initialSuppliers={suppliers} initialProducts={products} />;
}
