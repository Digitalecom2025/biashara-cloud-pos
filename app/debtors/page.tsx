import { DebtorsPage } from "@/components/debtors-page";
import { getCustomersForPage, getDebtorsForPage } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function DebtorsRoute() {
  const [debtors, customers] = await Promise.all([getDebtorsForPage(), getCustomersForPage()]);
  return <DebtorsPage initialDebtors={debtors} initialCustomers={customers} />;
}
