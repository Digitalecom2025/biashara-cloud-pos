import { notFound } from "next/navigation";

import { getDrivers } from "@/lib/driver-data";
import { getVehicles } from "@/lib/fleet-data";
import { getTripRecord } from "@/lib/trip-data";

import TripForm from "@/components/fleet/TripForm";
import { updateTrip } from "./actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{ error?: string }>;
};

export default async function EditTripPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;

  const [trip, vehicles, drivers, query] = await Promise.all([getTripRecord(id), getVehicles(), getDrivers(), searchParams]);

  if (!trip) {
    notFound();
  }

  async function updateTripAction(formData: FormData) {
    "use server";
    await updateTrip(id, formData);
  }

  return (
    <TripForm
      title="Edit Trip"
      description="Update trip details."
      action={updateTripAction}
      vehicles={vehicles}
      drivers={drivers}
      trip={trip}
      submitLabel="Update Trip"
      backHref={`/fleet/trips/${id}`}
      error={query?.error}
    />
  );
}
