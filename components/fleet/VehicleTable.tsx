"use client";

import Link from "next/link";

type Vehicle = {
  id: string;
  plateNumber: string;
  make: string | null;
  model: string | null;
  mileage: number;
  fuelType: string | null;
  status: string;

  driver: {
    id: string;
    fullName: string;
  } | null;
};

type VehicleTableProps = {
  vehicles: Vehicle[];
};

export default function VehicleTable({
  vehicles,
}: VehicleTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h2 className="text-lg font-semibold">
            Fleet Vehicles
          </h2>

          <p className="text-sm text-gray-500">
            Manage all business vehicles.
          </p>
        </div>

        <input
          placeholder="Search vehicle..."
          className="w-64 rounded-lg border px-3 py-2 text-sm"
        />
      </div>

      <table className="w-full">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3">Plate No</th>
            <th className="p-3">Vehicle</th>
            <th className="p-3">Driver</th>
            <th className="p-3">Mileage</th>
            <th className="p-3">Fuel</th>
            <th className="p-3">Status</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {vehicles.map((vehicle) => (
            <tr
              key={vehicle.id}
              className="border-t hover:bg-gray-50"
            >
              <td className="p-3 font-medium">
                {vehicle.plateNumber}
              </td>

              <td className="p-3">
                {vehicle.make ?? "-"} {vehicle.model ?? ""}
              </td>

              <td className="p-3">
                {vehicle.driver?.fullName ?? "Unassigned"}
              </td>

              <td className="p-3">
                {vehicle.mileage.toLocaleString()} km
              </td>

              <td className="p-3">
                {vehicle.fuelType ?? "-"}
              </td>

              <td className="p-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    vehicle.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : vehicle.status === "Maintenance"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {vehicle.status}
                </span>
              </td>

              <td className="space-x-2 p-3">
                <Link
                  href={`/fleet/vehicles/${vehicle.id}`}
                  className="text-blue-600 hover:underline"
                >
                  View
                </Link>

                <Link
                  href={`/fleet/vehicles/${vehicle.id}/edit`}
                  className="text-green-600 hover:underline"
                >
                  Edit
                </Link>

                <Link
                  href={`/fleet/vehicles/${vehicle.id}/delete`}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}