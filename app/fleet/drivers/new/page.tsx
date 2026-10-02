import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createDriver } from "./actions";

type Props = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function NewDriverPage({ searchParams }: Props) {
  const error = (await searchParams)?.error;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Fleet drivers</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#10271B] md:text-3xl">Add Driver</h2>
          <p className="mt-1 text-sm text-[#789083]">Register a driver for vehicle assignments and trip records.</p>
        </div>
        <Link href="/fleet/drivers" className="flex w-fit items-center gap-2 rounded-xl border border-[#DDEAE0] bg-white px-4 py-3 text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]"><ArrowLeft size={15} /> Back</Link>
      </div>

      {error && <div className="mb-4 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-xs font-bold text-[#EF4444]">{error}</div>}

      <form action={createDriver} className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field name="fullName" label="Full name" placeholder="John Kamau" required />
          <Field name="phoneNumber" label="Phone number" placeholder="+254712345678" />
          <Field name="email" label="Email" type="email" placeholder="driver@email.com" />
          <Field name="nationalId" label="National ID" placeholder="12345678" />
          <Field name="licenseNumber" label="Driving licence" placeholder="DL123456" required />
          <Field name="licenseExpiry" label="Licence expiry" type="date" />
          <Field name="emergencyContact" label="Emergency contact" />
          <Field name="emergencyPhone" label="Emergency phone" />
          <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Status</span><select name="status" className="mt-2 w-full rounded-xl border border-[#DDEAE0] bg-white px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]"><option>Active</option><option>Inactive</option></select></label>
          <label className="md:col-span-2"><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Address</span><textarea name="address" rows={3} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]" /></label>
          <label className="md:col-span-2"><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Notes</span><textarea name="notes" rows={4} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]" /></label>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link href="/fleet/drivers" className="rounded-xl border border-[#DDEAE0] px-4 py-3 text-center text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]">Cancel</Link>
          <button className="rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E]">Save driver</button>
        </div>
      </form>
    </div>
  );
}

function Field({ name, label, type = "text", placeholder, required }: { name: string; label: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <label>
      <span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}{required ? " *" : ""}</span>
      <input name={name} required={required} type={type} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs font-bold text-[#173324] outline-none placeholder:text-[#9AAEA3] focus:border-[#16A34A]" />
    </label>
  );
}
