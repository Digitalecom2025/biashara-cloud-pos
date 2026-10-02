import { notFound } from "next/navigation";
import Link from "next/link";

import { getMaintenanceRecord } from "@/lib/maintenance-data";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MaintenanceProfilePage({
  params,
}: Props) {
  const { id } = await params;

  const record = await getMaintenanceRecord(id);

  if (!record) {
    notFound();
  }

  return (
    <div className="space-y-6 p-6">

      {/* Header */}

      <div className="rounded-xl border bg-white p-6 shadow-sm">

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-3xl font-bold">
              {record.serviceType}
            </h1>

            <p className="mt-2 text-gray-500">
              {record.vehicle.plateNumber} • {record.vehicle.vehicleName}
            </p>

          </div>

          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              record.status === "Completed"
                ? "bg-green-100 text-green-700"
                : record.status === "Pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {record.status}
          </span>

        </div>

      </div>

      {/* Main Information */}

      <div className="grid gap-6 lg:grid-cols-2">

        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-lg font-semibold">
            Maintenance Details
          </h2>

          <InfoRow
            label="Vehicle"
            value={`${record.vehicle.plateNumber} - ${record.vehicle.vehicleName}`}
          />

          <InfoRow
            label="Driver"
            value={record.driver?.fullName ?? "Not Assigned"}
          />

          <InfoRow
            label="Service"
            value={record.serviceType}
          />

          <InfoRow
            label="Garage"
            value={record.garage ?? "-"}
          />

          <InfoRow
            label="Mechanic"
            value={record.mechanic ?? "-"}
          />

        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-lg font-semibold">
            Service Information
          </h2>

          <InfoRow
            label="Cost"
            value={`KES ${Number(record.cost).toLocaleString()}`}
          />

          <InfoRow
            label="Odometer"
            value={`${Number(record.odometer).toLocaleString()} km`}
          />

          <InfoRow
            label="Service Date"
            value={record.serviceDate.toLocaleDateString()}
          />

          <InfoRow
            label="Next Service"
            value={
              record.nextServiceDate
                ? record.nextServiceDate.toLocaleDateString()
                : "-"
            }
          />

        </div>

      </div>

      {/* Notes */}

      <div className="rounded-xl border bg-white p-6 shadow-sm">

        <h2 className="mb-4 text-lg font-semibold">
          Notes
        </h2>

        <p className="text-gray-700">
          {record.notes || "No notes added."}
        </p>

      </div>

      {/* Actions */}

      <div className="flex gap-3">

  <Link
    href={`/fleet/maintenance/${record.id}/edit`}
    className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700"
  >
    Edit Record
  </Link>

<Link
  href={`/fleet/maintenance/${record.id}/delete`}
  className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
>
  Delete Record
</Link>

  <Link
    href="/fleet/maintenance"
    className="rounded-lg border px-5 py-2 hover:bg-gray-100"
  >
    Back
  </Link>

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
