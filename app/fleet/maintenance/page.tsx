import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import MaintenanceStats from "@/components/fleet/MaintenanceStats";
import MaintenanceTable from "@/components/fleet/MaintenanceTable";
import { getMaintenanceRecords } from "@/lib/maintenance-data";

export default async function MaintenancePage() {
  const records = await getMaintenanceRecords();

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Fleet operations</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#10271B] md:text-3xl">Fleet Maintenance</h2>
          <p className="mt-1 text-sm text-[#789083]">Manage vehicle servicing, costs and upcoming maintenance dates.</p>
        </div>
        <Link href="/fleet" className="flex w-fit items-center gap-2 rounded-xl border border-[#DDEAE0] bg-white px-4 py-3 text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]"><ArrowLeft size={15} /> Fleet dashboard</Link>
      </div>
      <MaintenanceStats records={records} />
      <div className="mt-5"><MaintenanceTable records={records} /></div>
    </div>
  );
}
