import { notFound } from "next/navigation";
import { ProductProfilePage } from "@/components/product-profile-page";
import { getProductProfile } from "@/lib/profile-data";

export const dynamic = "force-dynamic";

export default async function ProductProfileRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductProfile(id);
  if (!product) notFound();
  return <ProductProfilePage product={product} />;
}

