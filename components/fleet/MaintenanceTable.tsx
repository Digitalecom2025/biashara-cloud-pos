import Link from "next/link";
import { Eye, Pencil, Plus, Trash2, Wrench } from "lucide-react";

type MaintenanceRecord = {
  id: string;
  serviceType: string;
  cost: number;
  odometer: number;
  status: string;
  serviceDate: Date;
  nextServiceDate: Date | null;
  vehicle: {
    plateNumber: string;
    vehicleName: string;
  };
  driver: {
    fullName: string;
  } | null;
};

type Props = {
  records: MaintenanceRecord[];
};

function money(value: number) {
  return `KES ${Number(value).toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}

function statusClass(status: string) {
  if (status === "Completed") return "bg-[#16A34A]/10 text-[#0F8C42]";
  if (status === "Pending" || status === "Scheduled") return "bg-[#D4A017]/12 text-[#9A7108]";
  return "bg-[#EF4444]/10 text-[#EF4444]";
}

export default function MaintenanceTable({ records }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5">
      <div className="flex flex-col justify-between gap-3 border-b border-[#E8F0EA] p-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-black text-[#173324]">Maintenance records</h2>
          <p className="mt-0.5 text-xs text-[#789083]">Completed, pending and scheduled vehicle services.</p>
        </div>
        <Link href="/fleet/maintenance/new" className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E]">
          <Plus size={15} /> Add maintenance
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse text-left">
          <thead>
            <tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]">
              <th className="px-4 py-3.5">Vehicle</th>
              <th className="px-3 py-3.5">Driver</th>
              <th className="px-3 py-3.5">Service</th>
              <th className="px-3 py-3.5">Cost</th>
              <th className="px-3 py-3.5">Odometer</th>
              <th className="px-3 py-3.5">Next service</th>
              <th className="px-3 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-t border-[#EEF3EF] text-xs text-[#60766B] hover:bg-[#FBFDFB]">
                <td className="px-4 py-3"><p className="font-black text-[#173324]">{record.vehicle.plateNumber}</p><p className="mt-0.5 text-[10px] text-[#789083]">{record.vehicle.vehicleName}</p></td>
                <td className="px-3 py-3">{record.driver?.fullName ?? "Unassigned"}</td>
                <td className="px-3 py-3 font-semibold">{record.serviceType}</td>
                <td className="px-3 py-3 font-black text-[#173324]">{money(record.cost)}</td>
                <td className="px-3 py-3">{Number(record.odometer).toLocaleString("en-KE")} km</td>
                <td className="px-3 py-3">{record.nextServiceDate ? record.nextServiceDate.toLocaleDateString("en-GB") : "-"}</td>
                <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${statusClass(record.status)}`}>{record.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Link href={`/fleet/maintenance/${record.id}`} aria-label="View maintenance" className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#16A34A]/10 hover:text-[#16A34A]"><Eye size={15} /></Link>
                    <Link href={`/fleet/maintenance/${record.id}/edit`} aria-label="Edit maintenance" className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#D4A017]/10 hover:text-[#A57809]"><Pencil size={14} /></Link>
                    <Link href={`/fleet/maintenance/${record.id}/delete`} aria-label="Delete maintenance" className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#EF4444]/10 hover:text-[#EF4444]"><Trash2 size={14} /></Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {records.length === 0 && (
        <div className="grid min-h-56 place-items-center border-t border-[#E8F0EA] p-8 text-center">
          <div>
            <Wrench className="mx-auto text-[#9AAEA3]" size={32} />
            <p className="mt-3 text-sm font-black text-[#173324]">No maintenance records yet</p>
            <p className="mt-1 text-xs text-[#789083]">Add service records to monitor cost and upcoming work.</p>
          </div>
        </div>
      )}
    </section>
  );
}
