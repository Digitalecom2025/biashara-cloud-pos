"use client";

import Link from "next/link";

type Driver = {
  id: string;
  fullName: string;
  phoneNumber: string | null;
  licenseNumber: string;
  status: string;
};

type Props = {
  drivers: Driver[];
};

export default function DriverTable({
  drivers,
}: Props) {
  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">

      <div className="flex items-center justify-between border-b p-4">

        <div>
          <h2 className="text-lg font-semibold">
            Fleet Drivers
          </h2>

          <p className="text-sm text-gray-500">
            Manage all company drivers.
          </p>
        </div>

        <input
          placeholder="Search driver..."
          className="w-64 rounded-lg border px-3 py-2 text-sm"
        />

      </div>

      <table className="w-full">

        <thead className="bg-gray-100">

          <tr>

            <th className="p-3 text-left">
              Driver
            </th>

            <th className="p-3 text-left">
              Phone
            </th>

            <th className="p-3 text-left">
              Licence
            </th>

            <th className="p-3 text-left">
              Status
            </th>

            <th className="p-3 text-left">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {drivers.map((driver) => (

            <tr
              key={driver.id}
              className="border-t hover:bg-gray-50"
            >

              <td className="p-3 font-medium">
                {driver.fullName}
              </td>

              <td className="p-3">
                {driver.phoneNumber ?? "-"}
              </td>

              <td className="p-3">
                {driver.licenseNumber}
              </td>

              <td className="p-3">

                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    driver.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {driver.status}
                </span>

              </td>

              <td className="space-x-3 p-3">

                <Link
                  href={`/fleet/drivers/${driver.id}`}
                  className="text-blue-600 hover:underline"
                >
                  View
                </Link>

                <Link
                  href={`/fleet/drivers/${driver.id}/edit`}
                  className="text-green-600 hover:underline"
                >
                  Edit
                </Link>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}