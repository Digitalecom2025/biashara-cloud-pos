import { Fuel, Route, ShieldAlert, Truck, UserRound, type LucideIcon } from "lucide-react";

type FleetStatsProps = {
  totalVehicles: number;
  activeDrivers: number;
  activeTrips: number;
  fuelCost: number;
  maintenanceDue: number;
};

function money(value: number) {
  return `KES ${Number(value).toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}

export default function FleetStats({
  totalVehicles,
  activeDrivers,
  activeTrips,
  fuelCost,
  maintenanceDue,
}: FleetStatsProps) {
  const cards: {
    label: string;
    value: string | number;
    note: string;
    icon: LucideIcon;
    tone: string;
    danger?: boolean;
  }[] = [
    {
      label: "Total vehicles",
      value: totalVehicles,
      note: "Registered fleet assets",
      icon: Truck,
      tone: "bg-[#16A34A]/10 text-[#16A34A]",
    },
    {
      label: "Active drivers",
      value: activeDrivers,
      note: "Available driver records",
      icon: UserRound,
      tone: "bg-[#D4A017]/12 text-[#A57809]",
    },
    {
      label: "Active trips",
      value: activeTrips,
      note: "Currently in progress",
      icon: Route,
      tone: "bg-[#16A34A]/10 text-[#0F8C42]",
    },
    {
      label: "Fuel this month",
      value: money(fuelCost),
      note: "Recorded fuel spend",
      icon: Fuel,
      tone: "bg-[#D4A017]/12 text-[#9A7108]",
    },
    {
      label: "Maintenance due",
      value: maintenanceDue,
      note: "Due or overdue services",
      icon: ShieldAlert,
      tone: "bg-[#EF4444]/10 text-[#EF4444]",
      danger: maintenanceDue > 0,
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(({ label, value, note, icon: Icon, tone, danger }) => (
        <article key={label} className="rounded-2xl border border-[#DDEAE0] bg-white p-4 shadow-sm shadow-[#12311F]/5">
          <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>
            <Icon size={18} />
          </span>
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]">{label}</p>
          <p className={`mt-1 text-lg font-black tracking-tight ${danger ? "text-[#EF4444]" : "text-[#173324]"}`}>{value}</p>
          <p className="mt-1 text-[11px] text-[#789083]">{note}</p>
        </article>
      ))}
    </section>
  );
}
