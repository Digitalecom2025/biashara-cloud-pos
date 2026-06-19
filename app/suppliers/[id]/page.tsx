import { notFound } from "next/navigation";
import { SupplierProfilePage } from "@/components/supplier-profile-page";
import { getSupplierProfile } from "@/lib/profile-data";

export const dynamic = "force-dynamic";

export default async function SupplierProfileRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supplier = await getSupplierProfile(id);
  if (!supplier) notFound();
  return <SupplierProfilePage supplier={supplier} />;
}

