import Link from "next/link";
import { Eye, Pencil, Plus, Trash2, UserRound } from "lucide-react";

type Driver = {
  id: string;
  fullName: string;
  phoneNumber: string | null;
  licenseNumber: string;
  status: string;
};

type Props = {
  drivers: Driver[];
};

function statusClass(status: string) {
  return status === "Active" ? "bg-[#16A34A]/10 text-[#0F8C42]" : "bg-[#EF4444]/10 text-[#EF4444]";
}

export default function DriverTable({ drivers }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5">
      <div className="flex flex-col justify-between gap-3 border-b border-[#E8F0EA] p-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-black text-[#173324]">Fleet drivers</h2>
          <p className="mt-0.5 text-xs text-[#789083]">Driver contacts, licences and availability.</p>
        </div>
        <Link href="/fleet/drivers/new" className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E]">
          <Plus size={15} /> Add driver
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead>
            <tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]">
              <th className="px-4 py-3.5">Driver</th>
              <th className="px-3 py-3.5">Phone</th>
              <th className="px-3 py-3.5">Licence</th>
              <th className="px-3 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.id} className="border-t border-[#EEF3EF] text-xs text-[#60766B] hover:bg-[#FBFDFB]">
                <td className="px-4 py-3 font-black text-[#173324]">{driver.fullName}</td>
                <td className="px-3 py-3">{driver.phoneNumber ?? "-"}</td>
                <td className="px-3 py-3 font-semibold">{driver.licenseNumber}</td>
                <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${statusClass(driver.status)}`}>{driver.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Link href={`/fleet/drivers/${driver.id}`} aria-label={`View ${driver.fullName}`} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#16A34A]/10 hover:text-[#16A34A]"><Eye size={15} /></Link>
                    <Link href={`/fleet/drivers/${driver.id}/edit`} aria-label={`Edit ${driver.fullName}`} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#D4A017]/10 hover:text-[#A57809]"><Pencil size={14} /></Link>
                    <Link href={`/fleet/drivers/${driver.id}/delete`} aria-label={`Delete ${driver.fullName}`} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#EF4444]/10 hover:text-[#EF4444]"><Trash2 size={14} /></Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {drivers.length === 0 && (
        <div className="grid min-h-56 place-items-center border-t border-[#E8F0EA] p-8 text-center">
          <div>
            <UserRound className="mx-auto text-[#9AAEA3]" size={32} />
            <p className="mt-3 text-sm font-black text-[#173324]">No drivers yet</p>
            <p className="mt-1 text-xs text-[#789083]">Add drivers before assigning vehicles or recording trips.</p>
          </div>
        </div>
      )}
    </section>
  );
}
