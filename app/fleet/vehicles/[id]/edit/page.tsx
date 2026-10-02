import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { getDrivers } from "@/lib/driver-data";
import { getVehicle } from "@/lib/fleet-data";
import { updateVehicle } from "./actions";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
};

export default async function EditVehiclePage({ params, searchParams }: Props) {
  const { id } = await params;
  const [vehicle, drivers, query] = await Promise.all([getVehicle(id), getDrivers(), searchParams]);
  if (!vehicle) notFound();
  const error = query?.error;

  async function action(formData: FormData) {
    "use server";
    await updateVehicle(id, formData);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Fleet vehicles</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#10271B] md:text-3xl">Edit Vehicle</h2>
          <p className="mt-1 text-sm text-[#789083]">{vehicle.plateNumber} - {vehicle.vehicleName}</p>
        </div>
        <Link href={`/fleet/vehicles/${id}`} className="flex w-fit items-center gap-2 rounded-xl border border-[#DDEAE0] bg-white px-4 py-3 text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]"><ArrowLeft size={15} /> Back</Link>
      </div>

      {error && <div className="mb-4 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-xs font-bold text-[#EF4444]">{error}</div>}

      <form action={action} className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field name="plateNumber" label="Plate number" defaultValue={vehicle.plateNumber} required />
          <Field name="vehicleName" label="Vehicle name" defaultValue={vehicle.vehicleName} required />
          <Field name="vehicleType" label="Vehicle type" defaultValue={vehicle.vehicleType} required />
          <Field name="make" label="Make" defaultValue={vehicle.make ?? ""} />
          <Field name="model" label="Model" defaultValue={vehicle.model ?? ""} />
          <Field name="year" label="Year" type="number" min="1950" step="1" defaultValue={vehicle.year?.toString() ?? ""} />
          <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Assigned driver</span><select name="driverId" defaultValue={vehicle.driverId ?? ""} className="mt-2 w-full rounded-xl border border-[#DDEAE0] bg-white px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]"><option value="">Unassigned</option>{drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.fullName}</option>)}</select></label>
          <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Fuel type</span><select name="fuelType" defaultValue={vehicle.fuelType ?? "Diesel"} className="mt-2 w-full rounded-xl border border-[#DDEAE0] bg-white px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]"><option>Diesel</option><option>Petrol</option><option>Electric</option><option>Hybrid</option></select></label>
          <Field name="mileage" label="Current mileage" type="number" min="0" step="1" defaultValue={String(vehicle.mileage)} />
          <label><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Status</span><select name="status" defaultValue={vehicle.status} className="mt-2 w-full rounded-xl border border-[#DDEAE0] bg-white px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]"><option>Active</option><option>Maintenance</option><option>Inactive</option></select></label>
          <label className="md:col-span-2"><span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">Notes</span><textarea name="notes" rows={4} defaultValue={vehicle.notes ?? ""} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]" /></label>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link href={`/fleet/vehicles/${id}`} className="rounded-xl border border-[#DDEAE0] px-4 py-3 text-center text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]">Cancel</Link>
          <button className="rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E]">Update vehicle</button>
        </div>
      </form>
    </div>
  );
}

function Field({ name, label, type = "text", defaultValue, required, min, step }: { name: string; label: string; type?: string; defaultValue: string; required?: boolean; min?: string; step?: string }) {
  return (
    <label>
      <span className="text-[10px] font-black uppercase tracking-wider text-[#789083]">{label}{required ? " *" : ""}</span>
      <input name={name} required={required} type={type} min={min} step={step} defaultValue={defaultValue} className="mt-2 w-full rounded-xl border border-[#DDEAE0] px-3 py-3 text-xs font-bold text-[#173324] outline-none focus:border-[#16A34A]" />
    </label>
  );
}
