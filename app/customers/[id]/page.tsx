import { notFound } from "next/navigation";
import { CustomerProfilePage } from "@/components/customer-profile-page";
import { getCustomerProfile } from "@/lib/profile-data";

export const dynamic = "force-dynamic";

export default async function CustomerProfileRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomerProfile(id);
  if (!customer) notFound();
  return <CustomerProfilePage customer={customer} />;
}

