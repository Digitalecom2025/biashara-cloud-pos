import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { getDriver } from "@/lib/driver-data";
import { updateDriver } from "./actions";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
};

function dateInput(value?: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export default async function EditDriverPage({ params, searchParams }: Props) {
  const { id } = await params;
  const [driver, query] = await Promise.all([getDriver(id), searchParams]);
  if (!driver) notFound();

  async function action(formData: FormData) {
    "use server";
    await updateDriver(id, formData);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Fleet drivers</p><h2 className="mt-1 text-2xl font-black tracking-tight text-[#10271B] md:text-3xl">Edit Driver</h2><p className="mt-1 text-sm text-[#789083]">{driver.fullName}</p></div>
        <Link href={`/fleet/drivers/${id}`} className="flex w-fit items-center gap-2 rounded-xl border border-[#DDEAE0] bg-white px-4 py-3 text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]"><ArrowLeft size={15} /> Back</Link>
      </div>
      {query?.error && <div className="mb-4 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-xs font-bold text-[#EF4444]">{query.error}</div>}
      <form action={action} className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field name="fullName" label="Full name" defaultValue={driver.fullName} required />
          <Field name="phoneNumber" label="Phone number" defaultValue={driver.phoneNumber ?? ""} />
          <Field name="email" label="Email" type="email" defaultValue={driver.email ?? ""} />
          <Field name="nationalId" label="National ID" defaultValue={driver.nationalId ?? ""} />
          <Field name="licenseNumber" label="Driving licence" defaultValue={driver.licenseNumber} required />
          <Field name="licenseExpiry" label="Licence expiry" type="date" defaultValue={dateInput(driver.licenseExpiry)} />
          <Field name="emergencyContact" label="Emergency contact" defaultValue={driver.emergencyContact ?? ""} />
          <Field name="emergencyPhone" label="Emergency phone" defaultValue={driver.emergencyPhone ?? ""} />
          <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Status</span><select name="status" defaultValue={driver.status} className="mt-2 w-full rounded-xl border border-[#DDEAE0] bg-white px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]"><option>Active</option><option>Inactive</option></select></label>
          <label className="md:col-span-2"><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Address</span><textarea name="address" rows={3} defaultValue={driver.address ?? ""} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]" /></label>
          <label className="md:col-span-2"><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Notes</span><textarea name="notes" rows={4} defaultValue={driver.notes ?? ""} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]" /></label>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Link href={`/fleet/drivers/${id}`} className="rounded-xl border border-[#DDEAE0] px-4 py-3 text-center text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]">Cancel</Link><button className="rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E]">Update driver</button></div>
      </form>
    </div>
  );
}

function Field({ name, label, type = "text", defaultValue, required }: { name: string; label: string; type?: string; defaultValue: string; required?: boolean }) {
  return <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}{required ? " *" : ""}</span><input name={name} required={required} type={type} defaultValue={defaultValue} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]" /></label>;
}
