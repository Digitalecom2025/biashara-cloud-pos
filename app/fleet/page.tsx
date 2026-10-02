import Link from "next/link";
import { BarChart3, Plus, Truck } from "lucide-react";

import FleetQuickActions from "@/components/fleet/FleetQuickActions";
import FleetStats from "@/components/fleet/FleetStats";
import FuelSummary from "@/components/fleet/FuelSummary";
import MaintenanceAlerts from "@/components/fleet/MaintenanceAlerts";
import RecentTrips from "@/components/fleet/RecentTrips";
import VehicleTable from "@/components/fleet/VehicleTable";
import { getFleetDashboardData } from "@/lib/fleet-data";

export default async function FleetPage() {
  const data = await getFleetDashboardData();

  return (
    <div className="mx-auto max-w-[1700px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Fleet operations</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#10271B] md:text-3xl">Fleet Management</h2>
          <p className="mt-1 max-w-2xl text-sm text-[#789083]">Manage vehicles, drivers, trips, fuel spend and maintenance from one operational workspace.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/fleet/reports" className="flex w-fit items-center gap-2 rounded-xl border border-[#DDEAE0] bg-white px-3.5 py-3 text-xs font-bold text-[#60766B] hover:bg-[#F8FBF8]">
            <BarChart3 size={15} /> View reports
          </Link>
          <Link href="/fleet/vehicles/new" className="flex w-fit items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-black text-white shadow-lg shadow-[#16A34A]/15 hover:bg-[#12883E]">
            <Plus size={16} /> Add vehicle
          </Link>
        </div>
      </div>

      <FleetQuickActions />

      <div className="mt-5">
        <FleetStats
          totalVehicles={data.vehicles.length}
          activeDrivers={data.activeDrivers}
          activeTrips={data.activeTrips}
          fuelCost={data.fuelSpendThisMonth}
          maintenanceDue={data.maintenanceDue}
        />
      </div>

      <div className="mt-5">
        <VehicleTable vehicles={data.vehicles} />
      </div>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <FuelSummary records={data.fuelRecords} />
        <MaintenanceAlerts records={data.maintenanceAlerts} />
        <RecentTrips records={data.recentTrips} />
        <article className="rounded-2xl bg-[#12311F] p-5 text-[#F6FFF8] shadow-lg shadow-[#12311F]/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#D4A017]">Fleet setup</p>
              <h3 className="mt-1 text-lg font-black">Keep operations measurable</h3>
            </div>
            <Truck size={22} className="text-[#22C55E]" />
          </div>
          <p className="mt-4 text-xs leading-5 text-[#B8C7BD]">Add vehicles, assign drivers, and record trips, fuel and services so reports reflect actual operating costs.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Vehicles", "Drivers", "Trips", "Fuel", "Maintenance"].map((item) => (
              <span key={item} className="rounded-full bg-white/8 px-3 py-1.5 text-[10px] font-black text-[#DDEAE0]">{item}</span>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
