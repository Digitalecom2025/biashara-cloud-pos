import Link from "next/link";

import { getDrivers } from "@/lib/driver-data";

import DriverTable from "@/components/fleet/DriverTable";

export default async function DriversPage() {
  const drivers = await getDrivers();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Driver Management
          </h1>

          <p className="mt-2 text-muted-foreground">
            Manage all company drivers, licences and assignments.
          </p>
        </div>

        <Link
           href="/fleet/drivers/new"
  className="inline-flex items-center rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white shadow hover:bg-green-700"
        >
          ➕ Add Driver
        </Link>
      </div>

      <DriverTable drivers={drivers} />
    </div>
  );
}