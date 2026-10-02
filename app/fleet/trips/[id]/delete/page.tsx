import { notFound } from "next/navigation";
import Link from "next/link";

import { getTripRecord } from "@/lib/trip-data";
import { deleteTrip } from "./actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DeleteTripPage({
  params,
}: Props) {
  const { id } = await params;

  const trip = await getTripRecord(id);

  if (!trip) {
    notFound();
  }

  async function action() {
    "use server";
    await deleteTrip(id);
  }

  return (
    <div className="mx-auto max-w-3xl p-6">

      <div className="rounded-xl border bg-white p-8 shadow-sm">

        <h1 className="text-3xl font-bold text-red-600">
          Delete Trip
        </h1>

        <p className="mt-3 text-gray-600">
          This action cannot be undone.
        </p>

        <div className="mt-8 rounded-lg bg-gray-50 p-5 space-y-3">

          <div>
            <strong>Vehicle:</strong>{" "}
            {trip.vehicle.plateNumber}
          </div>

          <div>
            <strong>Route:</strong>{" "}
            {trip.origin} → {trip.destination}
          </div>

          <div>
            <strong>Driver:</strong>{" "}
            {trip.driver?.fullName ?? "Unassigned"}
          </div>

        </div>

        <div className="mt-8 flex gap-4">

          <form action={action}>

            <button type="submit" className="rounded-xl bg-[#EF4444] px-4 py-3 text-xs font-black text-white hover:bg-[#DC2626]">
              Delete Permanently
            </button>

          </form>

          <Link
            href={`/fleet/trips/${id}`}
            className="rounded-lg border px-5 py-3 hover:bg-gray-100"
          >
            Cancel
          </Link>

        </div>

      </div>

    </div>
  );
}
