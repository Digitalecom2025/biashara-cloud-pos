import { SuperAdminPage } from "@/components/super-admin-page";
import { getBusinessesForSuperAdmin } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function SuperAdminRoute() {
  const businesses = await getBusinessesForSuperAdmin();
  return <SuperAdminPage initialBusinesses={businesses} />;
}
