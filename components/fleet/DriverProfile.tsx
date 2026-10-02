type Driver = {
  fullName: string;
  phoneNumber: string | null;
  email: string | null;
  nationalId: string | null;
  licenseNumber: string;
  licenseExpiry: Date | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  address: string | null;
  notes: string | null;
  status: string;
};

type DriverProfileProps = {
  driver: Driver;
};

function statusClass(status: string) {
  return status === "Active" ? "bg-[#16A34A]/10 text-[#0F8C42]" : "bg-[#EF4444]/10 text-[#EF4444]";
}

export default function DriverProfile({ driver }: DriverProfileProps) {
  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
        <div className="flex items-start justify-between">
          <div><h3 className="font-black text-[#173324]">Driver information</h3><p className="mt-0.5 text-xs text-[#789083]">Contact and licence profile.</p></div>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${statusClass(driver.status)}`}>{driver.status}</span>
        </div>
        <div className="mt-4 divide-y divide-[#EEF3EF]">
          <InfoRow label="Phone number" value={driver.phoneNumber ?? "-"} />
          <InfoRow label="Email" value={driver.email ?? "-"} />
          <InfoRow label="National ID" value={driver.nationalId ?? "-"} />
          <InfoRow label="Driving licence" value={driver.licenseNumber} />
          <InfoRow label="Licence expiry" value={driver.licenseExpiry ? driver.licenseExpiry.toLocaleDateString("en-GB") : "-"} />
        </div>
      </article>

      <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
        <h3 className="font-black text-[#173324]">Emergency and notes</h3>
        <p className="mt-0.5 text-xs text-[#789083]">Support details for operations.</p>
        <div className="mt-4 divide-y divide-[#EEF3EF]">
          <InfoRow label="Emergency contact" value={driver.emergencyContact ?? "-"} />
          <InfoRow label="Emergency phone" value={driver.emergencyPhone ?? "-"} />
          <InfoRow label="Address" value={driver.address ?? "-"} />
          <InfoRow label="Notes" value={driver.notes ?? "-"} />
        </div>
      </article>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 py-3 text-xs"><span className="font-semibold text-[#789083]">{label}</span><span className="max-w-[65%] text-right font-bold text-[#173324]">{value}</span></div>;
}
