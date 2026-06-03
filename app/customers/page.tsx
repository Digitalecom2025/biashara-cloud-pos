import { CustomersPage } from "@/components/customers-page";
import { getCustomersForPage } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function CustomersRoute() {
  const customers = await getCustomersForPage();
  return <CustomersPage initialCustomers={customers} />;
}
