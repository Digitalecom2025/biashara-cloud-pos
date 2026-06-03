import { BranchesPage } from "@/components/branches-page";
import { getBranchesForPage } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function BranchesRoute() {
  const branches = await getBranchesForPage();
  return <BranchesPage initialBranches={branches} />;
}
