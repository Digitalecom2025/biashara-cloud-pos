import { SalesRegister } from "@/components/sales-register";
import { getCustomersForPage, getRecentSalesForPage, getSalesProductsForPage } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const [products, customers, sales] = await Promise.all([getSalesProductsForPage(), getCustomersForPage(), getRecentSalesForPage()]);
  return <SalesRegister initialProducts={products} initialCustomers={customers} initialSales={sales} />;
}
