import Link from "next/link";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { notFound } from "next/navigation";

import { getVehicle } from "@/lib/fleet-data";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
};

function statusClass(status: string) {
  if (status === "Active") return "bg-[#16A34A]/10 text-[#0F8C42]";
  if (status === "Maintenance") return "bg-[#D4A017]/12 text-[#9A7108]";
  return "bg-[#EF4444]/10 text-[#EF4444]";
}

export default async function VehicleProfilePage({ params, searchParams }: Props) {
  const { id } = await params;
  const [vehicle, query] = await Promise.all([getVehicle(id), searchParams]);
  if (!vehicle) notFound();

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Fleet vehicle</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#10271B] md:text-3xl">{vehicle.vehicleName}</h2>
          <p className="mt-1 text-sm text-[#789083]">{vehicle.plateNumber} - {vehicle.vehicleType}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/fleet/vehicles" className="flex w-fit items-center gap-2 rounded-xl border border-[#DDEAE0] bg-white px-4 py-3 text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]"><ArrowLeft size={15} /> Back</Link>
          <Link href={`/fleet/vehicles/${id}/edit`} className="flex w-fit items-center gap-2 rounded-xl border border-[#D4A017]/35 bg-[#FFF9E8] px-4 py-3 text-xs font-black text-[#8A670C] hover:bg-[#FFF2C9]"><Pencil size={15} /> Edit</Link>
          <Link href={`/fleet/vehicles/${id}/delete`} className="flex w-fit items-center gap-2 rounded-xl bg-[#EF4444] px-4 py-3 text-xs font-black text-white hover:bg-[#DC2626]"><Trash2 size={15} /> Delete</Link>
        </div>
      </div>

      {query?.error && <div className="mb-4 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-xs font-bold text-[#EF4444]">{query.error}</div>}

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
          <div className="flex items-start justify-between">
            <div><h3 className="font-black text-[#173324]">Vehicle information</h3><p className="mt-0.5 text-xs text-[#789083]">Registration and operating profile.</p></div>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${statusClass(vehicle.status)}`}>{vehicle.status}</span>
          </div>
          <div className="mt-4 divide-y divide-[#EEF3EF]">
            <InfoRow label="Plate number" value={vehicle.plateNumber} />
            <InfoRow label="Vehicle name" value={vehicle.vehicleName} />
            <InfoRow label="Vehicle type" value={vehicle.vehicleType} />
            <InfoRow label="Make / model" value={[vehicle.make, vehicle.model].filter(Boolean).join(" ") || "-"} />
            <InfoRow label="Year" value={vehicle.year?.toString() ?? "-"} />
            <InfoRow label="Fuel type" value={vehicle.fuelType ?? "-"} />
            <InfoRow label="Mileage" value={`${Number(vehicle.mileage).toLocaleString("en-KE")} km`} />
          </div>
        </article>

        <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
          <h3 className="font-black text-[#173324]">Assignment</h3>
          <p className="mt-0.5 text-xs text-[#789083]">Driver and internal notes.</p>
          <div className="mt-4 divide-y divide-[#EEF3EF]">
            <InfoRow label="Driver" value={vehicle.driver?.fullName ?? "Unassigned"} />
            <InfoRow label="Notes" value={vehicle.notes || "-"} />
          </div>
        </article>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-3">
        <RelatedCard title="Recent fuel" rows={vehicle.fuelRecords.map((item) => `${item.filledAt.toLocaleDateString("en-GB")} - KES ${Number(item.totalCost).toLocaleString("en-KE")}`)} empty="No fuel history yet." />
        <RelatedCard title="Maintenance" rows={vehicle.maintenanceRecords.map((item) => `${item.serviceType} - ${item.status}`)} empty="No maintenance history yet." />
        <RelatedCard title="Trips" rows={vehicle.tripRecords.map((item) => `${item.origin} to ${item.destination}`)} empty="No trip history yet." />
      </section>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 py-3 text-xs"><span className="font-semibold text-[#789083]">{label}</span><span className="max-w-[65%] text-right font-bold text-[#173324]">{value}</span></div>;
}

function RelatedCard({ title, rows, empty }: { title: string; rows: string[]; empty: string }) {
  return (
    <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
      <h3 className="font-black text-[#173324]">{title}</h3>
      <div className="mt-4 space-y-2">
        {rows.length === 0 ? <p className="rounded-xl border border-dashed border-[#DDEAE0] bg-[#F8FBF8] p-4 text-xs font-bold text-[#789083]">{empty}</p> : rows.map((row) => <p key={row} className="rounded-xl border border-[#E8F0EA] p-3 text-xs font-bold text-[#60766B]">{row}</p>)}
      </div>
    </article>
  );
}
