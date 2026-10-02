import { CircleDollarSign, Fuel, Gauge, Route, Truck, UserRound, Wrench } from "lucide-react";

type Props = {
  overview: {
    totalVehicles: number;
    totalDrivers: number;
    totalTrips: number;
    totalFuelRecords: number;
    totalMaintenanceRecords: number;
    totalMaintenanceCost: number;
  };
  totalDistance: number;
};

function money(value: number) {
  return `KES ${Number(value).toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}

export default function FleetReportStats({ overview, totalDistance }: Props) {
  const cards = [
    { label: "Vehicles", value: overview.totalVehicles, note: "Registered assets", icon: Truck, tone: "bg-[#16A34A]/10 text-[#16A34A]" },
    { label: "Drivers", value: overview.totalDrivers, note: "Fleet drivers", icon: UserRound, tone: "bg-[#D4A017]/12 text-[#A57809]" },
    { label: "Trips", value: overview.totalTrips, note: "Recorded trips", icon: Route, tone: "bg-[#16A34A]/10 text-[#0F8C42]" },
    { label: "Fuel records", value: overview.totalFuelRecords, note: "Fuel purchases", icon: Fuel, tone: "bg-[#D4A017]/12 text-[#9A7108]" },
    { label: "Maintenance", value: overview.totalMaintenanceRecords, note: "Service records", icon: Wrench, tone: "bg-[#EF4444]/10 text-[#EF4444]" },
    { label: "Distance", value: `${Number(totalDistance).toLocaleString("en-KE")} km`, note: "Total travelled", icon: Gauge, tone: "bg-[#12311F]/10 text-[#12311F]" },
    { label: "Maintenance cost", value: money(overview.totalMaintenanceCost), note: "Recorded service spend", icon: CircleDollarSign, tone: "bg-[#D4A017]/12 text-[#A57809]" },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
      {cards.map(({ label, value, note, icon: Icon, tone }) => (
        <article key={label} className="rounded-2xl border border-[#DDEAE0] bg-white p-4 shadow-sm shadow-[#12311F]/5">
          <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon size={18} /></span>
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]">{label}</p>
          <p className="mt-1 text-lg font-black tracking-tight text-[#173324]">{value}</p>
          <p className="mt-1 text-[11px] text-[#789083]">{note}</p>
        </article>
      ))}
    </section>
  );
}
