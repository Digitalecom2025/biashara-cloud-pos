import { SuppliersPage } from "@/components/suppliers-page";
import { getSuppliersForPage } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function SuppliersRoute() {
  const suppliers = await getSuppliersForPage();
  return <SuppliersPage initialSuppliers={suppliers} />;
}
