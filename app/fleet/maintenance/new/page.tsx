import Link from "next/link";

import { getDrivers } from "@/lib/driver-data";
import { getVehicles } from "@/lib/fleet-data";
import { createMaintenance } from "./actions";

type Props = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function NewMaintenancePage({ searchParams }: Props) {
  const [vehicles, drivers, query] = await Promise.all([getVehicles(), getDrivers(), searchParams]);

  return (
    <div className="mx-auto max-w-5xl p-6">

      {/* Header */}

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Add Maintenance Record
          </h1>

          <p className="mt-2 text-muted-foreground">
            Record vehicle servicing and repairs.
          </p>

        </div>

        <Link
          href="/fleet/maintenance"
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

      {/* Form */}

      <form
        action={createMaintenance}
        className="space-y-6"
      >

        <div className="grid gap-6 md:grid-cols-2">

          <div>

            <label className="mb-2 block text-sm font-medium">
              Vehicle
            </label>

            <select
              name="vehicleId"
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
              Driver (Optional)
            </label>

            <select
              name="driverId"
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
              className="w-full rounded-lg border p-3"
              placeholder="Oil Change"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Garage
            </label>

            <input
              name="garage"
              className="w-full rounded-lg border p-3"
              placeholder="ABC Motors"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Mechanic
            </label>

            <input
              name="mechanic"
              className="w-full rounded-lg border p-3"
              placeholder="John Mwangi"
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
              className="w-full rounded-lg border p-3"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Status
            </label>

            <select
              name="status"
              className="w-full rounded-lg border p-3"
            >
              <option>Completed</option>
              <option>Scheduled</option>
              <option>Pending</option>
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
            className="w-full rounded-lg border p-3"
          />

        </div>

        <div className="flex justify-end">

          <button type="submit" className="rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E]">
            Save Maintenance Record
          </button>

        </div>

      </form>

    </div>
  );
}
