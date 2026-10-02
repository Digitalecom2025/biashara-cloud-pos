import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";

import FleetChart from "@/components/fleet/FleetChart";
import FleetReportStats from "@/components/fleet/FleetReportStats";
import {
  getDriverPerformance,
  getFleetOverview,
  getMostUsedVehicle,
  getTopDriver,
  getTotalDistanceTravelled,
  getTripChartData,
  getUpcomingMaintenance,
  getVehiclePerformance,
} from "@/lib/fleet-report-data";

export default async function FleetReportsPage() {
  const [
    overview,
    totalDistance,
    upcomingMaintenance,
    mostUsedVehicle,
    topDriver,
    vehiclePerformance,
    driverPerformance,
    tripChartData,
  ] = await Promise.all([
    getFleetOverview(),
    getTotalDistanceTravelled(),
    getUpcomingMaintenance(),
    getMostUsedVehicle(),
    getTopDriver(),
    getVehiclePerformance(),
    getDriverPerformance(),
    getTripChartData(),
  ]);

  return (
    <div className="mx-auto max-w-[1700px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">Fleet analytics</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#10271B] md:text-3xl">Fleet Reports</h2>
          <p className="mt-1 text-sm text-[#789083]">Performance, trip activity, maintenance and operating summaries from real fleet records.</p>
        </div>
        <Link href="/fleet" className="flex w-fit items-center gap-2 rounded-xl border border-[#DDEAE0] bg-white px-4 py-3 text-xs font-black text-[#60766B] hover:bg-[#F8FBF8]"><ArrowLeft size={15} /> Fleet dashboard</Link>
      </div>

      <FleetReportStats overview={overview} totalDistance={totalDistance} />

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <FleetChart title="Trip trend" data={tripChartData} />
        <div className="grid gap-5">
          <Highlight title="Most active vehicle" value={mostUsedVehicle?.plateNumber ?? "No data"} note={mostUsedVehicle ? `${mostUsedVehicle._count.tripRecords} trips recorded` : "Record trips to rank vehicles."} />
          <Highlight title="Top driver" value={topDriver?.fullName ?? "No data"} note={topDriver ? `${topDriver._count.tripRecords} trips recorded` : "Assign drivers to trips to rank performance."} />
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <ReportTable
          title="Vehicle performance"
          description="Trips, fuel records and maintenance activity by vehicle."
          headers={["Vehicle", "Trips", "Fuel", "Maintenance", "Status"]}
          rows={vehiclePerformance.map((vehicle) => [
            `${vehicle.plateNumber} - ${vehicle.vehicleName}`,
            String(vehicle._count.tripRecords),
            String(vehicle._count.fuelRecords),
            String(vehicle._count.maintenanceRecords),
            vehicle.status,
          ])}
          empty="No vehicle performance records yet."
        />
        <ReportTable
          title="Driver performance"
          description="Assigned vehicle, fuel, trip and maintenance activity by driver."
          headers={["Driver", "Trips", "Vehicles", "Fuel", "Maintenance"]}
          rows={driverPerformance.map((driver) => [
            driver.fullName,
            String(driver._count.tripRecords),
            String(driver._count.vehicles),
            String(driver._count.fuelRecords),
            String(driver._count.maintenanceRecords),
          ])}
          empty="No driver performance records yet."
        />
      </section>

      <div className="mt-5">
        <ReportTable
          title="Upcoming maintenance"
          description="Next scheduled maintenance dates in chronological order."
          headers={["Vehicle", "Driver", "Service", "Next service", "Status"]}
          rows={upcomingMaintenance.map((record) => [
            `${record.vehicle.plateNumber} - ${record.vehicle.vehicleName}`,
            record.driver?.fullName ?? "Unassigned",
            record.serviceType,
            record.nextServiceDate ? record.nextServiceDate.toLocaleDateString("en-GB") : "-",
            record.status,
          ])}
          empty="No upcoming maintenance dates have been recorded."
        />
      </div>
    </div>
  );
}

function Highlight({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <article className="rounded-2xl border border-[#DDEAE0] bg-white p-5 shadow-sm shadow-[#12311F]/5">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#D4A017]/12 text-[#A57809]"><Trophy size={18} /></span>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]">{title}</p>
      <p className="mt-1 text-lg font-black tracking-tight text-[#173324]">{value}</p>
      <p className="mt-1 text-[11px] text-[#789083]">{note}</p>
    </article>
  );
}

function ReportTable({ title, description, headers, rows, empty }: { title: string; description: string; headers: string[]; rows: string[][]; empty: string }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#DDEAE0] bg-white shadow-sm shadow-[#12311F]/5">
      <div className="border-b border-[#E8F0EA] p-4">
        <h3 className="font-black text-[#173324]">{title}</h3>
        <p className="mt-0.5 text-xs text-[#789083]">{description}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="bg-[#F8FBF8] text-[10px] font-black uppercase tracking-[0.13em] text-[#789083]">
              {headers.map((header) => <th key={header} className="px-4 py-3.5">{header}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.join("|")} className="border-t border-[#EEF3EF] text-xs text-[#60766B]">
                {row.map((cell, index) => <td key={`${row[0]}-${index}`} className={`px-4 py-3 ${index === 0 ? "font-black text-[#173324]" : ""}`}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <div className="grid min-h-40 place-items-center border-t border-[#E8F0EA] p-8 text-center text-xs font-bold text-[#789083]">{empty}</div>}
    </section>
  );
}
