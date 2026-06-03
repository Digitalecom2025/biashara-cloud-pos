import { ProductList } from "@/components/product-list";
import { getProductsForPage } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getProductsForPage();
  return <ProductList initialProducts={products} />;
}
