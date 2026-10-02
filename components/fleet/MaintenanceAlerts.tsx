import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";

type MaintenanceAlert = {
  id: string;
  serviceType: string;
  nextServiceDate: Date | null;
  status: string;
  vehicle: { plateNumber: string; vehicleName: string } | null;
  driver: { fullName: string } | null;
};

type Props = {
  records: MaintenanceAlert[];
};

export default function MaintenanceAlerts({ records }: Props) {
  const today = new Date();

  return (
    <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-black text-[#173324]">Maintenance alerts</h3>
          <p className="mt-0.5 text-xs text-[#789083]">Upcoming and overdue services.</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#EF4444]/10 text-[#EF4444]">
          <ShieldAlert size={18} />
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {records.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#DDEAE0] bg-[#F8FBF8] p-4 text-xs font-bold text-[#789083]">No maintenance alerts. Add next service dates to track due work.</p>
        ) : (
          records.map((record) => {
            const overdue = record.nextServiceDate ? record.nextServiceDate < today : false;
            return (
              <div key={record.id} className="rounded-xl border border-[#E8F0EA] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-[#173324]">{record.vehicle?.plateNumber ?? "Vehicle"} - {record.serviceType}</p>
                    <p className="mt-0.5 text-[10px] text-[#789083]">{record.driver?.fullName ?? "Unassigned"} - {record.vehicle?.vehicleName ?? "Fleet vehicle"}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${overdue ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#D4A017]/12 text-[#9A7108]"}`}>
                    {overdue ? "Overdue" : "Due"}
                  </span>
                </div>
                <p className="mt-2 text-[10px] font-semibold text-[#789083]">
                  {record.nextServiceDate ? record.nextServiceDate.toLocaleDateString("en-GB") : "No date"}
                </p>
              </div>
            );
          })
        )}
      </div>

      <Link href="/fleet/maintenance" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#16A34A] hover:text-[#0F8C42]">
        View maintenance <ArrowRight size={14} />
      </Link>
    </article>
  );
}
