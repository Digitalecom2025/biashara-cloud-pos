import Link from "next/link";

export default function FleetQuickActions() {
  return (
    <div className="flex flex-wrap gap-3">

      <Link
        href="/fleet/vehicles/new"
        className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700"
      >
        ➕ Add Vehicle
      </Link>

      <Link
        href="/fleet/vehicles"
        className="rounded-lg bg-slate-700 px-4 py-2 font-medium text-white transition hover:bg-slate-800"
      >
        🚚 View Vehicles
      </Link>

      <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700">
        👨‍✈️ Drivers
      </button>

      <button className="rounded-lg bg-orange-600 px-4 py-2 font-medium text-white transition hover:bg-orange-700">
        ⛽ Fuel
      </button>

      <button className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700">
        🔧 Maintenance
      </button>

    </div>
  );
}