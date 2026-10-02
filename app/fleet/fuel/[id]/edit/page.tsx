import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { getDrivers } from "@/lib/driver-data";
import { getVehicles } from "@/lib/fleet-data";
import { getFuelRecord } from "@/lib/fuel-data";
import { updateFuelRecord } from "./actions";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
};

function dateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

export default async function EditFuelPage({ params, searchParams }: Props) {
  const { id } = await params;
  const [record, vehicles, drivers, query] = await Promise.all([getFuelRecord(id), getVehicles(), getDrivers(), searchParams]);
  if (!record) notFound();

  async function action(formData: FormData) {
    "use server";
    await updateFuelRecord(id, formData);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Fuel records</p><h2 className="mt-1 text-2xl font-black tracking-tight text-[#10271B] md:text-3xl">Edit Fuel Record</h2><p className="mt-1 text-sm text-[#789083]">{record.vehicle.plateNumber}</p></div>
        <Link href={`/fleet/fuel/${id}`} className="flex w-fit items-center gap-2 rounded-xl border border-[#DDEAE0] bg-white px-4 py-3 text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]"><ArrowLeft size={15} /> Back</Link>
      </div>
      {query?.error && <div className="mb-4 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-xs font-bold text-[#EF4444]">{query.error}</div>}
      <form action={action} className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
        <div className="grid gap-4 md:grid-cols-2">
          <Select name="vehicleId" label="Vehicle" defaultValue={record.vehicleId} required options={vehicles.map((vehicle) => ({ value: vehicle.id, label: `${vehicle.plateNumber} - ${vehicle.vehicleName}` }))} />
          <Select name="driverId" label="Driver" defaultValue={record.driverId ?? ""} options={[{ value: "", label: "Unassigned" }, ...drivers.map((driver) => ({ value: driver.id, label: driver.fullName }))]} />
          <Field name="fuelStation" label="Fuel station" defaultValue={record.fuelStation ?? ""} />
          <Field name="receiptNumber" label="Receipt number" defaultValue={record.receiptNumber ?? ""} />
          <Field name="fuelType" label="Fuel type" defaultValue={record.fuelType ?? ""} />
          <Field name="litres" label="Litres" type="number" min="0.01" step="0.01" defaultValue={String(record.litres)} required />
          <Field name="pricePerLitre" label="Price per litre" type="number" min="0.01" step="0.01" defaultValue={String(record.pricePerLitre)} required />
          <Field name="odometer" label="Odometer" type="number" min="0" step="1" defaultValue={String(record.odometer)} required />
          <Field name="filledAt" label="Fill date" type="date" defaultValue={dateInput(record.filledAt)} />
          <label className="md:col-span-2"><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Notes</span><textarea name="notes" rows={4} defaultValue={record.notes ?? ""} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]" /></label>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Link href={`/fleet/fuel/${id}`} className="rounded-xl border border-[#DDEAE0] px-4 py-3 text-center text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]">Cancel</Link><button className="rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E]">Update fuel record</button></div>
      </form>
    </div>
  );
}

function Field({ name, label, type = "text", min, step, defaultValue, required }: { name: string; label: string; type?: string; min?: string; step?: string; defaultValue: string; required?: boolean }) {
  return <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}{required ? " *" : ""}</span><input name={name} required={required} type={type} min={min} step={step} defaultValue={defaultValue} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]" /></label>;
}

function Select({ name, label, options, defaultValue, required }: { name: string; label: string; options: { value: string; label: string }[]; defaultValue: string; required?: boolean }) {
  return <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}{required ? " *" : ""}</span><select name={name} required={required} defaultValue={defaultValue} className="mt-2 w-full rounded-xl border border-[#DDEAE0] bg-white px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]">{options.map((option) => <option key={`${name}-${option.value}`} value={option.value}>{option.label}</option>)}</select></label>;
}
