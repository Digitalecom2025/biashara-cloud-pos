import Link from "next/link";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { notFound } from "next/navigation";

import { getFuelRecord } from "@/lib/fuel-data";

type Props = {
  params: Promise<{ id: string }>;
};

function money(value: number) {
  return `KES ${Number(value).toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}

export default async function FuelDetailPage({ params }: Props) {
  const { id } = await params;
  const record = await getFuelRecord(id);
  if (!record) notFound();

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Fuel record</p><h2 className="mt-1 text-2xl font-black tracking-tight text-[#10271B] md:text-3xl">{record.vehicle.plateNumber}</h2><p className="mt-1 text-sm text-[#789083]">{record.filledAt.toLocaleDateString("en-GB")} - {money(record.totalCost)}</p></div>
        <div className="flex flex-wrap gap-2"><Link href="/fleet/fuel" className="flex w-fit items-center gap-2 rounded-xl border border-[#DDEAE0] bg-white px-4 py-3 text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]"><ArrowLeft size={15} /> Back</Link><Link href={`/fleet/fuel/${id}/edit`} className="flex w-fit items-center gap-2 rounded-xl border border-[#D4A017]/35 bg-[#FFF9E8] px-4 py-3 text-xs font-black text-[#8A670C] hover:bg-[#FFF2C9]"><Pencil size={15} /> Edit</Link><Link href={`/fleet/fuel/${id}/delete`} className="flex w-fit items-center gap-2 rounded-xl bg-[#EF4444] px-4 py-3 text-xs font-black text-white hover:bg-[#DC2626]"><Trash2 size={15} /> Delete</Link></div>
      </div>
      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5"><h3 className="font-black text-[#173324]">Fuel details</h3><div className="mt-4 divide-y divide-[#EEF3EF]"><Info label="Vehicle" value={`${record.vehicle.plateNumber} - ${record.vehicle.vehicleName}`} /><Info label="Driver" value={record.driver?.fullName ?? "Unassigned"} /><Info label="Fuel type" value={record.fuelType ?? "-"} /><Info label="Fuel station" value={record.fuelStation ?? "-"} /><Info label="Receipt" value={record.receiptNumber ?? "-"} /></div></article>
        <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5"><h3 className="font-black text-[#173324]">Cost and odometer</h3><div className="mt-4 divide-y divide-[#EEF3EF]"><Info label="Litres" value={`${Number(record.litres).toLocaleString("en-KE")} L`} /><Info label="Price per litre" value={money(record.pricePerLitre)} /><Info label="Total cost" value={money(record.totalCost)} /><Info label="Odometer" value={`${Number(record.odometer).toLocaleString("en-KE")} km`} /><Info label="Filled at" value={record.filledAt.toLocaleString("en-GB")} /></div></article>
      </section>
      <article className="mt-5 rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5"><h3 className="font-black text-[#173324]">Notes</h3><p className="mt-3 rounded-xl bg-[#F8FBF8] p-4 text-xs font-bold text-[#60766B]">{record.notes || "No notes provided."}</p></article>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 py-3 text-xs"><span className="font-semibold text-[#789083]">{label}</span><span className="max-w-[65%] text-right font-bold text-[#173324]">{value}</span></div>;
}
