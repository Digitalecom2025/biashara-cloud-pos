import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createFuelRecord } from "./actions";
import { getDrivers } from "@/lib/driver-data";
import { getVehicles } from "@/lib/fleet-data";

type Props = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function NewFuelPage({ searchParams }: Props) {
  const [vehicles, drivers, query] = await Promise.all([
    getVehicles(),
    getDrivers(),
    searchParams,
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Fuel records</p><h2 className="mt-1 text-2xl font-black tracking-tight text-[#10271B] md:text-3xl">Add Fuel Record</h2><p className="mt-1 text-sm text-[#789083]">Record a vehicle fuel purchase and odometer reading.</p></div>
        <Link href="/fleet/fuel" className="flex w-fit items-center gap-2 rounded-xl border border-[#DDEAE0] bg-white px-4 py-3 text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]"><ArrowLeft size={15} /> Back</Link>
      </div>
      {query?.error && <div className="mb-4 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-xs font-bold text-[#EF4444]">{query.error}</div>}
      <form action={createFuelRecord} className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
        <div className="grid gap-4 md:grid-cols-2">
          <Select name="vehicleId" label="Vehicle" required options={vehicles.map((vehicle) => ({ value: vehicle.id, label: `${vehicle.plateNumber} - ${vehicle.vehicleName}` }))} />
          <Select name="driverId" label="Driver" options={[{ value: "", label: "Unassigned" }, ...drivers.map((driver) => ({ value: driver.id, label: driver.fullName }))]} />
          <Field name="fuelStation" label="Fuel station" placeholder="Station name" />
          <Field name="receiptNumber" label="Receipt number" placeholder="Receipt or invoice" />
          <Field name="fuelType" label="Fuel type" placeholder="Diesel" />
          <Field name="litres" label="Litres" type="number" min="0.01" step="0.01" required />
          <Field name="pricePerLitre" label="Price per litre" type="number" min="0.01" step="0.01" required />
          <Field name="odometer" label="Odometer" type="number" min="0" step="1" required />
          <Field name="filledAt" label="Fill date" type="date" />
          <label className="md:col-span-2"><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Notes</span><textarea name="notes" rows={4} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]" /></label>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Link href="/fleet/fuel" className="rounded-xl border border-[#DDEAE0] px-4 py-3 text-center text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]">Cancel</Link><button className="rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E]">Save fuel record</button></div>
      </form>
    </div>
  );
}

function Field({ name, label, type = "text", min, step, placeholder, required }: { name: string; label: string; type?: string; min?: string; step?: string; placeholder?: string; required?: boolean }) {
  return <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}{required ? " *" : ""}</span><input name={name} required={required} type={type} min={min} step={step} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs font-bold text-[#173324] outline-none placeholder:text-[#9AAEA3] focus:border-[#16A34A]" /></label>;
}

function Select({ name, label, options, required }: { name: string; label: string; options: { value: string; label: string }[]; required?: boolean }) {
  return <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}{required ? " *" : ""}</span><select name={name} required={required} className="mt-2 w-full rounded-xl border border-[#DDEAE0] bg-white px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]">{options.map((option) => <option key={`${name}-${option.value}`} value={option.value}>{option.label}</option>)}</select></label>;
}
