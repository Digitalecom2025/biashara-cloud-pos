import { CircleDollarSign, Fuel, Gauge, ReceiptText } from "lucide-react";

type FuelRecord = {
  litres: number;
  totalCost: number;
};

type Props = {
  records: FuelRecord[];
};

function money(value: number) {
  return `KES ${Number(value).toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}

export default function FuelStats({ records }: Props) {
  const totalLitres = records.reduce((sum, record) => sum + Number(record.litres), 0);
  const totalCost = records.reduce((sum, record) => sum + Number(record.totalCost), 0);
  const averageCost = totalLitres > 0 ? totalCost / totalLitres : 0;
  const stats = [
    { label: "Fuel records", value: records.length, note: "Recorded purchases", icon: ReceiptText, tone: "bg-[#16A34A]/10 text-[#16A34A]" },
    { label: "Total litres", value: `${totalLitres.toLocaleString("en-KE")} L`, note: "Fuel volume", icon: Fuel, tone: "bg-[#D4A017]/12 text-[#A57809]" },
    { label: "Fuel cost", value: money(totalCost), note: "Total spend", icon: CircleDollarSign, tone: "bg-[#16A34A]/10 text-[#0F8C42]" },
    { label: "Average cost/litre", value: money(averageCost), note: "Blended rate", icon: Gauge, tone: "bg-[#D4A017]/12 text-[#9A7108]" },
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
