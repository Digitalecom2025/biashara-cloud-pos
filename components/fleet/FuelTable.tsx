import Link from "next/link";
import { Eye, Fuel, Pencil, Plus, Trash2 } from "lucide-react";

type FuelRecord = {
  id: string;
  litres: number;
  pricePerLitre: number;
  totalCost: number;
  odometer: number;
  filledAt: Date;
  vehicle: {
    plateNumber: string;
  } | null;
  driver: {
    fullName: string;
  } | null;
};

type FuelTableProps = {
  fuelRecords: FuelRecord[];
};

function money(value: number) {
  return `KES ${Number(value).toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}

export default function FuelTable({ fuelRecords }: FuelTableProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5">
      <div className="flex flex-col justify-between gap-3 border-b border-[#E8F0EA] p-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-black text-[#173324]">Fuel records</h2>
          <p className="mt-0.5 text-xs text-[#789083]">Vehicle fuel purchases and odometer readings.</p>
        </div>
        <Link href="/fleet/fuel/new" className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E]">
          <Plus size={15} /> Add fuel record
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead>
            <tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]">
              <th className="px-4 py-3.5">Vehicle</th>
              <th className="px-3 py-3.5">Driver</th>
              <th className="px-3 py-3.5">Litres</th>
              <th className="px-3 py-3.5">Price/litre</th>
              <th className="px-3 py-3.5">Total</th>
              <th className="px-3 py-3.5">Odometer</th>
              <th className="px-3 py-3.5">Date</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fuelRecords.map((record) => (
              <tr key={record.id} className="border-t border-[#EEF3EF] text-xs text-[#60766B] hover:bg-[#FBFDFB]">
                <td className="px-4 py-3 font-black text-[#173324]">{record.vehicle?.plateNumber ?? "-"}</td>
                <td className="px-3 py-3">{record.driver?.fullName ?? "Unassigned"}</td>
                <td className="px-3 py-3">{Number(record.litres).toLocaleString("en-KE")} L</td>
                <td className="px-3 py-3">{money(record.pricePerLitre)}</td>
                <td className="px-3 py-3 font-black text-[#173324]">{money(record.totalCost)}</td>
                <td className="px-3 py-3">{Number(record.odometer).toLocaleString("en-KE")} km</td>
                <td className="px-3 py-3">{record.filledAt.toLocaleDateString("en-GB")}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Link href={`/fleet/fuel/${record.id}`} aria-label="View fuel record" className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#16A34A]/10 hover:text-[#16A34A]"><Eye size={15} /></Link>
                    <Link href={`/fleet/fuel/${record.id}/edit`} aria-label="Edit fuel record" className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#D4A017]/10 hover:text-[#A57809]"><Pencil size={14} /></Link>
                    <Link href={`/fleet/fuel/${record.id}/delete`} aria-label="Delete fuel record" className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#EF4444]/10 hover:text-[#EF4444]"><Trash2 size={14} /></Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {fuelRecords.length === 0 && (
        <div className="grid min-h-56 place-items-center border-t border-[#E8F0EA] p-8 text-center">
          <div>
            <Fuel className="mx-auto text-[#9AAEA3]" size={32} />
            <p className="mt-3 text-sm font-black text-[#173324]">No fuel records yet</p>
            <p className="mt-1 text-xs text-[#789083]">Record a purchase to track consumption and cost.</p>
          </div>
        </div>
      )}
    </section>
  );
}
