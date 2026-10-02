import Link from "next/link";

type Vehicle = {
  id: string;
  plateNumber: string;
  vehicleName: string;
};

type Driver = {
  id: string;
  fullName: string;
};

type Trip = {
  vehicleId: string;
  driverId: string | null;
  origin: string;
  destination: string;
  purpose: string | null;
  departureTime: Date;
  arrivalTime: Date | null;
  startOdometer: number;
  endOdometer: number | null;
  status: string;
  notes: string | null;
};

type Props = {
  title: string;
  description: string;
  action: (formData: FormData) => void | Promise<void>;
  vehicles: Vehicle[];
  drivers: Driver[];
  trip?: Trip;
  submitLabel: string;
  backHref: string;
  error?: string;
};

function formatDateTimeLocal(date?: Date | null) {
  if (!date) return "";

  const d = new Date(date);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${d.getFullYear()}-${pad(
    d.getMonth() + 1
  )}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function TripForm({
  title,
  description,
  action,
  vehicles,
  drivers,
  trip,
  submitLabel,
  backHref,
  error,
}: Props) {
  return (
    <div className="mx-auto max-w-6xl p-6">

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            {title}
          </h1>

          <p className="mt-2 text-gray-500">
            {description}
          </p>

        </div>

        <Link
          href={backHref}
          className="rounded-lg border px-4 py-2 hover:bg-gray-100"
        >
          ← Back
        </Link>

      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-xs font-bold text-[#EF4444]">
          {error}
        </div>
      )}

      <form action={action} className="space-y-6">

        <div className="grid gap-6 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-medium">
              Vehicle
            </label>

            <select
              name="vehicleId"
              required
              defaultValue={trip?.vehicleId}
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
              defaultValue={trip?.driverId ?? ""}
              className="w-full rounded-lg border p-3"
            >
              <option value="">Unassigned</option>

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
            <label>Origin</label>

            <input
              name="origin"
              required
              defaultValue={trip?.origin}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label>Destination</label>

            <input
              name="destination"
              required
              defaultValue={trip?.destination}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label>Purpose</label>

            <input
              name="purpose"
              defaultValue={trip?.purpose ?? ""}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label>Departure</label>

            <input
              type="datetime-local"
              name="departureTime"
              required
              defaultValue={formatDateTimeLocal(
                trip?.departureTime
              )}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label>Arrival</label>

            <input
              type="datetime-local"
              name="arrivalTime"
              defaultValue={formatDateTimeLocal(
                trip?.arrivalTime
              )}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label>Start Odometer</label>

            <input
              name="startOdometer"
              type="number"
              min="0"
              step="1"
              required
              defaultValue={trip?.startOdometer}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label>End Odometer</label>

            <input
              name="endOdometer"
              type="number"
              min="0"
              step="1"
              required
              defaultValue={trip?.endOdometer ?? ""}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label>Status</label>

            <select
              name="status"
              defaultValue={trip?.status ?? "In Progress"}
              className="w-full rounded-lg border p-3"
            >
              <option>In Progress</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>

        </div>

        <div>
          <label>Notes</label>

          <textarea
            rows={4}
            name="notes"
            defaultValue={trip?.notes ?? ""}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div className="flex justify-end">

          <button type="submit" className="rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E]">
            {submitLabel}
          </button>

        </div>

      </form>

    </div>
  );
}
