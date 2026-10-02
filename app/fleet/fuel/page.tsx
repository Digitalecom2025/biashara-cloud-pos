import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import FuelStats from "@/components/fleet/FuelStats";
import FuelTable from "@/components/fleet/FuelTable";
import { getFuelRecords } from "@/lib/fuel-data";

export default async function FuelPage() {
  const fuelRecords = await getFuelRecords();

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Fleet operations</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#10271B] md:text-3xl">Fuel Management</h2>
          <p className="mt-1 text-sm text-[#789083]">Track fuel purchases, consumption and operating cost.</p>
        </div>
        <Link href="/fleet" className="flex w-fit items-center gap-2 rounded-xl border border-[#DDEAE0] bg-white px-4 py-3 text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]"><ArrowLeft size={15} /> Fleet dashboard</Link>
      </div>
      <FuelStats records={fuelRecords} />
      <div className="mt-5"><FuelTable fuelRecords={fuelRecords} /></div>
    </div>
  );
}
