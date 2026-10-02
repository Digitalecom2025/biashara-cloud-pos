import { CheckCircle2, Clock3, Gauge, Route } from "lucide-react";

type Props = {
  records: {
    status: string;
    distance: number;
  }[];
};

export default function TripStats({ records }: Props) {
  const totalTrips = records.length;
  const completed = records.filter((record) => record.status === "Completed").length;
  const inProgress = records.filter((record) => record.status === "In Progress").length;
  const totalDistance = records.reduce((sum, record) => sum + Number(record.distance), 0);
  const stats = [
    { label: "Total trips", value: totalTrips, note: "All recorded routes", icon: Route, tone: "bg-[#16A34A]/10 text-[#16A34A]" },
    { label: "Completed", value: completed, note: "Finished trips", icon: CheckCircle2, tone: "bg-[#16A34A]/10 text-[#0F8C42]" },
    { label: "In progress", value: inProgress, note: "Currently active", icon: Clock3, tone: "bg-[#D4A017]/12 text-[#9A7108]" },
    { label: "Distance", value: `${totalDistance.toLocaleString("en-KE")} km`, note: "Total travelled", icon: Gauge, tone: "bg-[#12311F]/10 text-[#12311F]" },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, note, icon: Icon, tone }) => (
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
