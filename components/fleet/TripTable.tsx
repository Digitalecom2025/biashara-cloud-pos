import Link from "next/link";
import { Eye, Pencil, Plus, Route, Trash2 } from "lucide-react";

type Trip = {
  id: string;
  origin: string;
  destination: string;
  distance: number;
  status: string;
  departureTime: Date;
  vehicle: {
    plateNumber: string;
  };
  driver: {
    fullName: string;
  } | null;
};

type Props = {
  records: Trip[];
};

function statusClass(status: string) {
  if (status === "Completed") return "bg-[#16A34A]/10 text-[#0F8C42]";
  if (status === "In Progress") return "bg-[#D4A017]/12 text-[#9A7108]";
  return "bg-[#EF4444]/10 text-[#EF4444]";
}

export default function TripTable({ records }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5">
      <div className="flex flex-col justify-between gap-3 border-b border-[#E8F0EA] p-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-black text-[#173324]">Trip records</h2>
          <p className="mt-0.5 text-xs text-[#789083]">Routes, assigned drivers and odometer distances.</p>
        </div>
        <Link href="/fleet/trips/new" className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E]">
          <Plus size={15} /> Add trip
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead>
            <tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]">
              <th className="px-4 py-3.5">Vehicle</th>
              <th className="px-3 py-3.5">Driver</th>
              <th className="px-3 py-3.5">Route</th>
              <th className="px-3 py-3.5">Distance</th>
              <th className="px-3 py-3.5">Departure</th>
              <th className="px-3 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((trip) => (
              <tr key={trip.id} className="border-t border-[#EEF3EF] text-xs text-[#60766B] hover:bg-[#FBFDFB]">
                <td className="px-4 py-3 font-black text-[#173324]">{trip.vehicle.plateNumber}</td>
                <td className="px-3 py-3">{trip.driver?.fullName ?? "Unassigned"}</td>
                <td className="px-3 py-3">{trip.origin} to {trip.destination}</td>
                <td className="px-3 py-3">{Number(trip.distance).toLocaleString("en-KE")} km</td>
                <td className="px-3 py-3">{trip.departureTime.toLocaleString("en-GB")}</td>
                <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${statusClass(trip.status)}`}>{trip.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Link href={`/fleet/trips/${trip.id}`} aria-label="View trip" className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#16A34A]/10 hover:text-[#16A34A]"><Eye size={15} /></Link>
                    <Link href={`/fleet/trips/${trip.id}/edit`} aria-label="Edit trip" className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#D4A017]/10 hover:text-[#A57809]"><Pencil size={14} /></Link>
                    <Link href={`/fleet/trips/${trip.id}/delete`} aria-label="Delete trip" className="grid h-8 w-8 place-items-center rounded-lg text-[#789083] hover:bg-[#EF4444]/10 hover:text-[#EF4444]"><Trash2 size={14} /></Link>
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
            <Route className="mx-auto text-[#9AAEA3]" size={32} />
            <p className="mt-3 text-sm font-black text-[#173324]">No trips yet</p>
            <p className="mt-1 text-xs text-[#789083]">Record trips to track routes, mileage and fleet activity.</p>
          </div>
        </div>
      )}
    </section>
  );
}
