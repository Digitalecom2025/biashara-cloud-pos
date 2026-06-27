import { getVehicles } from "@/lib/fleet-data";

import FleetStats from "@/components/fleet/FleetStats";
import FleetQuickActions from "@/components/fleet/FleetQuickActions";
import FuelSummary from "@/components/fleet/FuelSummary";
import MaintenanceAlerts from "@/components/fleet/MaintenanceAlerts";
import VehicleTable from "@/components/fleet/VehicleTable";

export default async function FleetPage() {
  const vehicles = await getVehicles();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Fleet Management
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage vehicles, drivers, maintenance, fuel, deliveries and fleet
          operations from one place.
        </p>
      </div>

      {/* Fleet Statistics */}
      <FleetStats />

      {/* Quick Actions */}
      <FleetQuickActions />

      {/* Vehicles */}
      <VehicleTable vehicles={vehicles} />

      {/* Dashboard Widgets */}
      <div className="grid gap-6 lg:grid-cols-2">
        <FuelSummary />
        <MaintenanceAlerts />
      </div>
    </div>
  );
}