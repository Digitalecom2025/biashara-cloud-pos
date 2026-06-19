import { notFound } from "next/navigation";
import { BranchDashboardPage } from "@/components/branch-profile-page";
import { getBranchProfile } from "@/lib/profile-data";

export const dynamic = "force-dynamic";

export default async function BranchDashboardRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const branch = await getBranchProfile(id);
  if (!branch) notFound();
  return <BranchDashboardPage branch={branch} />;
}

