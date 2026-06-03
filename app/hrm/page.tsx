import { HrmPage } from "@/components/hrm-page";
import { getBranchesForPage, getUsersForPage } from "@/lib/db-data";

export const dynamic = "force-dynamic";

export default async function HrmRoute() {
  const [users, branches] = await Promise.all([getUsersForPage(), getBranchesForPage()]);
  return <HrmPage initialUsers={users} initialBranches={branches} />;
}
