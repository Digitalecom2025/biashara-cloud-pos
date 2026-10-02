import TripForm from "@/components/fleet/TripForm";
import { getDrivers } from "@/lib/driver-data";
import { getVehicles } from "@/lib/fleet-data";
import { createTrip } from "./actions";

type Props = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function NewTripPage({ searchParams }: Props) {
  const [vehicles, drivers, query] = await Promise.all([getVehicles(), getDrivers(), searchParams]);

  return (
    <TripForm
      title="Add Trip"
      description="Record a new fleet trip."
      action={createTrip}
      vehicles={vehicles}
      drivers={drivers}
      submitLabel="Save Trip"
      backHref="/fleet/trips"
      error={query?.error}
    />
  );
}
