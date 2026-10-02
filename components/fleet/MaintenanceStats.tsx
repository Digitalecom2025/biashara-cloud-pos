import { CalendarClock, CircleDollarSign, ShieldCheck, Wrench } from "lucide-react";

type MaintenanceRecord = {
  cost: number;
  status: string;
  nextServiceDate: Date | null;
};

type Props = {
  records: MaintenanceRecord[];
};

function money(value: number) {
  return `KES ${Number(value).toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}

export default function MaintenanceStats({ records }: Props) {
  const totalServices = records.length;
  const completedServices = records.filter((record) => record.status === "Completed").length;
  const pendingServices = records.filter((record) => record.status !== "Completed").length;
  const totalCost = records.reduce((sum, record) => sum + Number(record.cost), 0);
  const due = records.filter((record) => record.nextServiceDate && record.nextServiceDate <= new Date()).length;
  const stats = [
    { label: "Total services", value: totalServices, note: "All maintenance records", icon: Wrench, tone: "bg-[#16A34A]/10 text-[#16A34A]" },
    { label: "Completed", value: completedServices, note: "Finished services", icon: ShieldCheck, tone: "bg-[#16A34A]/10 text-[#0F8C42]" },
    { label: "Pending", value: pendingServices, note: "Open or scheduled", icon: CalendarClock, tone: "bg-[#D4A017]/12 text-[#9A7108]" },
    { label: "Due now", value: due, note: "Due or overdue", icon: CalendarClock, tone: "bg-[#EF4444]/10 text-[#EF4444]", danger: due > 0 },
    { label: "Total cost", value: money(totalCost), note: "Recorded spend", icon: CircleDollarSign, tone: "bg-[#D4A017]/12 text-[#A57809]" },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map(({ label, value, note, icon: Icon, tone, danger }) => (
        <article key={label} className="rounded-2xl border border-[#DDEAE0] bg-white p-4 shadow-sm shadow-[#12311F]/5">
          <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon size={18} /></span>
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]">{label}</p>
          <p className={`mt-1 text-lg font-black tracking-tight ${danger ? "text-[#EF4444]" : "text-[#173324]"}`}>{value}</p>
          <p className="mt-1 text-[11px] text-[#789083]">{note}</p>
        </article>
      ))}
    </section>
  );
}
