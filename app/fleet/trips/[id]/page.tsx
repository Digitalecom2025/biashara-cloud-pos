import { notFound } from "next/navigation";
import Link from "next/link";

import { getTripRecord } from "@/lib/trip-data";
import TripProfile from "@/components/fleet/TripProfile";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TripPage({
  params,
}: Props) {
  const { id } = await params;

  const trip = await getTripRecord(id);

  if (!trip) {
    notFound();
  }

  return (
    <div className="space-y-6 p-6">

      {/* Header */}

      <div className="rounded-xl border bg-white p-6 shadow-sm">

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-3xl font-bold">
              Trip Details
            </h1>

            <p className="mt-2 text-gray-500">
              {trip.vehicle.plateNumber} • {trip.vehicle.vehicleName}
            </p>

          </div>

          <span 
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
    trip.status === "Completed"
      ? "bg-green-100 text-green-700"
      : trip.status === "In Progress"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700"
  }`}
>
  {trip.status}
            
          </span>

        </div>

      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-lg font-semibold">
            Trip Information
          </h2>

          <TripProfile
            label="Vehicle"
            value={`${trip.vehicle.plateNumber} • ${trip.vehicle.vehicleName}`}
          />

          <TripProfile
            label="Driver"
            value={trip.driver?.fullName ?? "Unassigned"}
          />

          <TripProfile
            label="Origin"
            value={trip.origin}
          />

          <TripProfile
            label="Destination"
            value={trip.destination}
          />

          <TripProfile
            label="Purpose"
            value={trip.purpose ?? "-"}
          />

        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-lg font-semibold">
            Trip Metrics
          </h2>

          <TripProfile
            label="Start Odometer"
            value={`${Number(trip.startOdometer).toLocaleString()} km`}
          />

          <TripProfile
            label="End Odometer"
            value={
  trip.endOdometer !== null
    ? `${Number(trip.endOdometer).toLocaleString()} km`
    : "-"
}
          />

          <TripProfile
            label="Distance"
            value={`${Number(trip.distance).toLocaleString()} km`}
          />

          <TripProfile
            label="Departure"
            value={trip.departureTime.toLocaleString("en-KE")}
          />

          <TripProfile
            label="Arrival"
            value={
              trip.arrivalTime
                ? trip.arrivalTime.toLocaleString("en-KE")
                : "-"
            }
          />

        </div>

      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">

        <h2 className="mb-4 text-lg font-semibold">
          Trip Notes
        </h2>

        <div className="rounded-lg bg-gray-50 p-4">
  <p className="whitespace-pre-wrap">
    {trip.notes || "No notes provided."}
  </p>
</div>

      </div>

      <div className="flex gap-3">

        <Link
          href={`/fleet/trips/${trip.id}/edit`}
          className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700"
        >
          Edit Trip
        </Link>

        <Link
          href={`/fleet/trips/${trip.id}/delete`}
          className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
        >
          Delete Trip
        </Link>

        <Link
          href="/fleet/trips"
          className="rounded-lg border px-5 py-2 hover:bg-gray-100"
        >
          Back
        </Link>

      </div>

    </div>
  );
}