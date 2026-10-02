"use server";

import { redirect } from "next/navigation";

import { getFleetBusinessId } from "@/lib/fleet-data";
import { prisma } from "@/lib/prisma";

export async function createTrip(
  formData: FormData
) {
  const businessId = await getFleetBusinessId();
  if (!businessId) {
    redirect(`/fleet/trips/new?error=${encodeURIComponent("Business context could not be found. Sign in again and retry.")}`);
  }

  const vehicleId = String(formData.get("vehicleId"));

  const driverId = String(formData.get("driverId"));

  const origin = String(formData.get("origin"));

  const destination = String(
    formData.get("destination")
  );

  const purpose = String(formData.get("purpose"));

  const departureTime = new Date(
    String(formData.get("departureTime"))
  );

  const arrivalTime = formData.get("arrivalTime")
    ? new Date(
        String(formData.get("arrivalTime"))
      )
    : null;

  const startOdometer = Number(
    formData.get("startOdometer")
  );

  const endOdometer = Number(
    formData.get("endOdometer")
  );

  const distance =
    endOdometer - startOdometer;

  const status = String(
    formData.get("status")
  );

  const notes = String(
    formData.get("notes")
  );

  // Validate required fields
if (!vehicleId.trim()) {
  redirect(`/fleet/trips/new?error=${encodeURIComponent("Vehicle is required.")}`);
}

if (!origin.trim()) {
  redirect(`/fleet/trips/new?error=${encodeURIComponent("Origin is required.")}`);
}

if (!destination.trim()) {
  redirect(`/fleet/trips/new?error=${encodeURIComponent("Destination is required.")}`);
}

// Validate odometer readings
if (isNaN(startOdometer)) {
  redirect(`/fleet/trips/new?error=${encodeURIComponent("Start odometer is required.")}`);
}

if (isNaN(endOdometer)) {
  redirect(`/fleet/trips/new?error=${encodeURIComponent("End odometer is required.")}`);
}

if (endOdometer < startOdometer) {
  redirect(`/fleet/trips/new?error=${encodeURIComponent("End odometer cannot be less than the start odometer.")}`);
}

// Validate trip times
if (
  arrivalTime &&
  arrivalTime < departureTime
) {
  redirect(`/fleet/trips/new?error=${encodeURIComponent("Arrival time cannot be before departure time.")}`);
}

  await prisma.fleetTrip.create({
    data: {
      businessId,

      vehicleId,

      driverId: driverId || null,

      origin,

      destination,

      purpose,

      departureTime,

      arrivalTime,

      startOdometer,

      endOdometer,

      distance,

      status,

      notes,
    },
  });

  redirect("/fleet/trips");
}
