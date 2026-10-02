import Link from "next/link";

import { notFound } from "next/navigation";
import { getDrivers } from "@/lib/driver-data";
import { getVehicles } from "@/lib/fleet-data";
import { getMaintenanceRecord } from "@/lib/maintenance-data";
import { updateMaintenance } from "./actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{ error?: string }>;
};

export default async function EditMaintenancePage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const query = await searchParams;

  const record = await getMaintenanceRecord(id);

  if (!record) {
    notFound();
  }

  const [vehicles, drivers] = await Promise.all([getVehicles(), getDrivers()]);

  async function update(formData: FormData) {
    "use server";
    await updateMaintenance(id, formData);
  }

  return (
    <div className="mx-auto max-w-5xl p-6">

      <div className="mb-8 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Edit Maintenance Record
          </h1>

          <p className="mt-2 text-gray-500">
            Update this maintenance record.
          </p>
        </div>

        <Link
          href={`/fleet/maintenance/${id}`}
          className="rounded-lg border px-4 py-2 hover:bg-gray-100"
        >
          ← Back
        </Link>

      </div>

      {query?.error && (
        <div className="mb-4 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-xs font-bold text-[#EF4444]">
          {query.error}
        </div>
      )}

      <form action={update} className="space-y-6">

        <div className="grid gap-6 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-medium">
              Vehicle
            </label>

            <select
              name="vehicleId"
              defaultValue={record.vehicleId}
              className="w-full rounded-lg border p-3"
            >
              {vehicles.map((vehicle) => (
                <option
                  key={vehicle.id}
                  value={vehicle.id}
                >
                  {vehicle.plateNumber} - {vehicle.vehicleName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Driver
            </label>

            <select
              name="driverId"
              defaultValue={record.driverId ?? ""}
              className="w-full rounded-lg border p-3"
            >
              <option value="">
                Unassigned
              </option>

              {drivers.map((driver) => (
                <option
                  key={driver.id}
                  value={driver.id}
                >
                  {driver.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Service Type
            </label>

            <input
              name="serviceType"
              required
              defaultValue={record.serviceType}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Garage
            </label>

            <input
              name="garage"
              defaultValue={record.garage ?? ""}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Mechanic
            </label>

            <input
              name="mechanic"
              defaultValue={record.mechanic ?? ""}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Cost
            </label>

            <input
              name="cost"
              type="number"
              min="0"
              step="0.01"
              defaultValue={record.cost}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Odometer
            </label>

            <input
              name="odometer"
              type="number"
              min="0"
              step="1"
              defaultValue={record.odometer}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Service Date
            </label>

            <input
              name="serviceDate"
              type="date"
              defaultValue={
                record.serviceDate.toISOString().split("T")[0]
              }
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Next Service Date
            </label>

            <input
              name="nextServiceDate"
              type="date"
              defaultValue={
                record.nextServiceDate
                  ? record.nextServiceDate.toISOString().split("T")[0]
                  : ""
              }
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Status
            </label>

            <select
              name="status"
              defaultValue={record.status}
              className="w-full rounded-lg border p-3"
            >
              <option>Completed</option>
              <option>Pending</option>
              <option>Scheduled</option>
            </select>
          </div>

        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Notes
          </label>

          <textarea
            name="notes"
            rows={4}
            defaultValue={record.notes ?? ""}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div className="flex justify-end">
          <button type="submit" className="rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E]">
            Update Maintenance
          </button>
        </div>

      </form>
    </div>
  );
}
