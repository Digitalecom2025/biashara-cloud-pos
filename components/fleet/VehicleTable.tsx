import Link from "next/link";
import { Eye, Pencil, Plus, Trash2, Truck } from "lucide-react";

type Vehicle = {
  id: string;
  plateNumber: string;
  vehicleName: string;
  vehicleType: string;
  make: string | null;
  model: string | null;
  mileage: number;
  fuelType: string | null;
  status: string;
  driver: {
    id: string;
    fullName: string;
  } | null;
};

type VehicleTableProps = {
  vehicles: Vehicle[];
  showHeader?: boolean;
};

function statusClass(status: string) {
  if (status === "Active") return "bg-[#16A34A]/10 text-[#0F8C42]";
  if (status === "Maintenance") return "bg-[#D4A017]/12 text-[#9A7108]";
  return "bg-[#EF4444]/10 text-[#EF4444]";
}

export default function VehicleTable({ vehicles, showHeader = true }: VehicleTableProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5">
      {showHeader && (
        <div className="flex flex-col justify-between gap-3 border-b border-[#E8F0EA] p-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-black text-[#173324]">Fleet vehicles</h2>
            <p className="mt-0.5 text-xs text-[#789083]">Vehicle assignment, mileage and operating status.</p>
          </div>
          <Link href="/fleet/vehicles/new" className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E]">
            <Plus size={15} /> Add vehicle
          </Link>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead>
            <tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]">
              <th className="px-4 py-3.5">Plate number</th>
              <th className="px-3 py-3.5">Vehicle</th>
              <th className="px-3 py-3.5">Driver</th>
              <th className="px-3 py-3.5">Mileage</th>
              <th className="px-3 py-3.5">Fuel type</th>
              <th className="px-3 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="border-t border-[#EEF3EF] text-xs text-[#60766B] hover:bg-[#FBFDFB]">
                <td className="px-4 py-3">
                  <p className="font-black text-[#173324]">{vehicle.plateNumber}</p>
                  <p className="mt-0.5 text-[10px] text-[#9AAEA3]">{vehicle.vehicleType}</p>
                </td>
                <td className="px-3 py-3">
                  <p className="font-bold text-[#173324]">{vehicle.vehicleName}</p>
                  <p className="mt-0.5 text-[10px] text-[#789083]">{[vehicle.make, vehicle.model].filter(Boolean).join(" ") || "-"}</p>
                </td>
                <td className="px-3 py-3 font-semibold">{vehicle.driver?.fullName ?? "Unassigned"}</td>
                <td className="px-3 py-3">{Number(vehicle.mileage).toLocaleString("en-KE")} km</td>
                <td className="px-3 py-3">{vehicle.fuelType ?? "-"}</td>
                <td className="px-3 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${statusClass(vehicle.status)}`}>{vehicle.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Link href={`/fleet/vehicles/${vehicle.id}`} aria-label={`View ${vehicle.plateNumber}`} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#16A34A]/10 hover:text-[#16A34A]"><Eye size={15} /></Link>
                    <Link href={`/fleet/vehicles/${vehicle.id}/edit`} aria-label={`Edit ${vehicle.plateNumber}`} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#D4A017]/10 hover:text-[#A57809]"><Pencil size={14} /></Link>
                    <Link href={`/fleet/vehicles/${vehicle.id}/delete`} aria-label={`Delete ${vehicle.plateNumber}`} className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#EF4444]/10 hover:text-[#EF4444]"><Trash2 size={14} /></Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {vehicles.length === 0 && (
        <div className="grid min-h-56 place-items-center border-t border-[#E8F0EA] p-8 text-center">
          <div>
            <Truck className="mx-auto text-[#9AAEA3]" size={32} />
            <p className="mt-3 text-sm font-black text-[#173324]">No vehicles yet</p>
            <p className="mt-1 text-xs text-[#789083]">Add a vehicle to begin tracking trips, fuel and maintenance.</p>
          </div>
        </div>
      )}
    </section>
  );
}
