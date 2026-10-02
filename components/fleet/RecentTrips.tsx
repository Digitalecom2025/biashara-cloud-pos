import Link from "next/link";
import { ArrowRight, Route } from "lucide-react";

type Trip = {
  id: string;
  origin: string;
  destination: string;
  distance: number;
  status: string;
  departureTime: Date;
  vehicle: { plateNumber: string } | null;
  driver: { fullName: string } | null;
};

type Props = {
  records: Trip[];
};

function statusClass(status: string) {
  if (status === "Completed") return "bg-[#16A34A]/10 text-[#0F8C42]";
  if (status === "In Progress") return "bg-[#D4A017]/12 text-[#9A7108]";
  return "bg-[#EF4444]/10 text-[#EF4444]";
}

export default function RecentTrips({ records }: Props) {
  return (
    <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5 xl:col-span-2">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-black text-[#173324]">Recent trips</h3>
          <p className="mt-0.5 text-xs text-[#789083]">Latest movements recorded by the fleet team.</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#16A34A]/10 text-[#16A34A]">
          <Route size={18} />
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        {records.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#DDEAE0] bg-[#F8FBF8] p-4 text-xs font-bold text-[#789083]">No trips recorded yet.</p>
        ) : (
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]">
                <th className="px-3 py-3">Vehicle</th>
                <th className="px-3 py-3">Route</th>
                <th className="px-3 py-3">Driver</th>
                <th className="px-3 py-3">Distance</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((trip) => (
                <tr key={trip.id} className="border-t border-[#EEF3EF] text-xs text-[#60766B]">
                  <td className="px-3 py-3 font-black text-[#173324]">{trip.vehicle?.plateNumber ?? "-"}</td>
                  <td className="px-3 py-3">{trip.origin} to {trip.destination}</td>
                  <td className="px-3 py-3">{trip.driver?.fullName ?? "Unassigned"}</td>
                  <td className="px-3 py-3">{Number(trip.distance).toLocaleString("en-KE")} km</td>
                  <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${statusClass(trip.status)}`}>{trip.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Link href="/fleet/trips" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#16A34A] hover:text-[#0F8C42]">
        View all trips <ArrowRight size={14} />
      </Link>
    </article>
  );
}
