import Link from "next/link";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { notFound } from "next/navigation";

import DriverProfile from "@/components/fleet/DriverProfile";
import { getDriver } from "@/lib/driver-data";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
};

export default async function DriverProfilePage({ params, searchParams }: Props) {
  const { id } = await params;
  const [driver, query] = await Promise.all([getDriver(id), searchParams]);
  if (!driver) notFound();

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Fleet driver</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#10271B] md:text-3xl">{driver.fullName}</h2>
          <p className="mt-1 text-sm text-[#789083]">Licence {driver.licenseNumber}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/fleet/drivers" className="flex w-fit items-center gap-2 rounded-xl border border-[#DDEAE0] bg-white px-4 py-3 text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]"><ArrowLeft size={15} /> Back</Link>
          <Link href={`/fleet/drivers/${id}/edit`} className="flex w-fit items-center gap-2 rounded-xl border border-[#D4A017]/35 bg-[#FFF9E8] px-4 py-3 text-xs font-black text-[#8A670C] hover:bg-[#FFF2C9]"><Pencil size={15} /> Edit</Link>
          <Link href={`/fleet/drivers/${id}/delete`} className="flex w-fit items-center gap-2 rounded-xl bg-[#EF4444] px-4 py-3 text-xs font-black text-white hover:bg-[#DC2626]"><Trash2 size={15} /> Delete</Link>
        </div>
      </div>
      {query?.error && <div className="mb-4 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-xs font-bold text-[#EF4444]">{query.error}</div>}
      <DriverProfile driver={driver} />
    </div>
  );
}
