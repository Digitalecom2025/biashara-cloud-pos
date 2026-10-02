import Link from "next/link";
import { ArrowRight, Fuel } from "lucide-react";

type FuelRecord = {
  id: string;
  litres: number;
  totalCost: number;
  filledAt: Date;
  vehicle: { plateNumber: string } | null;
};

type Props = {
  records: FuelRecord[];
};

function money(value: number) {
  return `KES ${Number(value).toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}

export default function FuelSummary({ records }: Props) {
  const totalCost = records.reduce((sum, record) => sum + Number(record.totalCost), 0);
  const totalLitres = records.reduce((sum, record) => sum + Number(record.litres), 0);

  return (
    <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-black text-[#173324]">Fuel summary</h3>
          <p className="mt-0.5 text-xs text-[#789083]">Latest recorded fuel purchases.</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#D4A017]/12 text-[#9A7108]">
          <Fuel size={18} />
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-[#F8FBF8] p-3 text-[10px]">
        <span><b className="block text-[#789083]">Entries</b><strong className="mt-1 block text-[#173324]">{records.length}</strong></span>
        <span><b className="block text-[#789083]">Litres</b><strong className="mt-1 block text-[#173324]">{totalLitres.toLocaleString("en-KE")}</strong></span>
        <span><b className="block text-[#789083]">Cost</b><strong className="mt-1 block text-[#173324]">{money(totalCost)}</strong></span>
      </div>

      <div className="mt-4 space-y-3">
        {records.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#DDEAE0] bg-[#F8FBF8] p-4 text-xs font-bold text-[#789083]">No fuel records yet.</p>
        ) : (
          records.slice(0, 3).map((record) => (
            <div key={record.id} className="flex items-center justify-between rounded-xl border border-[#E8F0EA] p-3 text-xs">
              <div>
                <p className="font-black text-[#173324]">{record.vehicle?.plateNumber ?? "Vehicle"}</p>
                <p className="mt-0.5 text-[10px] text-[#789083]">{record.filledAt.toLocaleDateString("en-GB")}</p>
              </div>
              <span className="font-black text-[#173324]">{money(record.totalCost)}</span>
            </div>
          ))
        )}
      </div>

      <Link href="/fleet/fuel" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#16A34A] hover:text-[#0F8C42]">
        View fuel records <ArrowRight size={14} />
      </Link>
    </article>
  );
}
