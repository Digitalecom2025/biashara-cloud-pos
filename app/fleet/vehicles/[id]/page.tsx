import { notFound } from "next/navigation";
import { getVehicle } from "@/lib/fleet-data";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VehicleProfilePage({
  params,
}: Props) {
  const { id } = await params;

  const vehicle = await getVehicle(id);

  if (!vehicle) {
    notFound();
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {vehicle.vehicleName}
            </h1>

            <p className="mt-2 text-gray-500">
              {vehicle.plateNumber}
            </p>
          </div>

          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              vehicle.status === "Active"
                ? "bg-green-100 text-green-700"
                : vehicle.status === "Maintenance"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {vehicle.status}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Vehicle Information */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold">
            Vehicle Information
          </h2>

          <InfoRow
            label="Plate Number"
            value={vehicle.plateNumber}
          />

          <InfoRow
            label="Vehicle Name"
            value={vehicle.vehicleName}
          />

          <InfoRow
            label="Vehicle Type"
            value={vehicle.vehicleType}
          />

          <InfoRow
            label="Make"
            value={vehicle.make ?? "-"}
          />

          <InfoRow
            label="Model"
            value={vehicle.model ?? "-"}
          />

          <InfoRow
            label="Year"
            value={vehicle.year?.toString() ?? "-"}
          />

          <InfoRow
            label="Fuel Type"
            value={vehicle.fuelType ?? "-"}
          />

          <InfoRow
            label="Mileage"
            value={`${Number(vehicle.mileage).toLocaleString()} km`}
          />
        </div>

        {/* Driver */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold">
            Assigned Driver
          </h2>

          <InfoRow
            label="Driver"
            value={vehicle.driverName ?? "Not Assigned"}
          />

          <InfoRow
            label="Notes"
            value={vehicle.notes ?? "-"}
          />
        </div>
      </div>

      {/* Future Modules */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="font-semibold mb-2">
            Fuel History
          </h3>

          <p className="text-sm text-gray-500">
            Fuel entries will appear here.
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="font-semibold mb-2">
            Maintenance
          </h3>

          <p className="text-sm text-gray-500">
            Upcoming and completed services.
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="font-semibold mb-2">
            Trips
          </h3>

          <p className="text-sm text-gray-500">
            Recent trips will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b py-3">
      <span className="text-gray-500">
        {label}
      </span>

      <span className="font-medium text-right">
        {value}
      </span>
    </div>
  );
}