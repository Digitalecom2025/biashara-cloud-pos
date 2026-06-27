import VehicleTable from "@/components/fleet/VehicleTable";
import { getVehicles } from "@/lib/fleet-data";

export default async function VehiclesPage() {
  const vehicles = await getVehicles();

  return (
    <div className="space-y-6 p-6">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Fleet Vehicles
          </h1>

          <p className="text-gray-500">
            View and manage all company vehicles.
          </p>

        </div>

      </div>

      <VehicleTable vehicles={vehicles} />

    </div>
  );
}