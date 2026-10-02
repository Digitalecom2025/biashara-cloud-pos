"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function fail(id: string, message: string): never {
  redirect(`/fleet/trips/${id}/edit?error=${encodeURIComponent(message)}`);
}

export async function updateTrip(id: string, formData: FormData) {
  const vehicleId = value(formData, "vehicleId");
  const driverId = value(formData, "driverId");
  const origin = value(formData, "origin");
  const destination = value(formData, "destination");
  const departureTime = new Date(value(formData, "departureTime"));
  const arrivalValue = value(formData, "arrivalTime");
  const arrivalTime = arrivalValue ? new Date(arrivalValue) : null;
  const startOdometer = Number(value(formData, "startOdometer"));
  const endOdometer = Number(value(formData, "endOdometer"));

  if (!vehicleId) fail(id, "Vehicle is required.");
  if (!origin) fail(id, "Origin is required.");
  if (!destination) fail(id, "Destination is required.");
  if (Number.isNaN(departureTime.getTime())) fail(id, "Departure time is required.");
  if (!Number.isFinite(startOdometer) || startOdometer < 0) fail(id, "Start odometer cannot be negative.");
  if (!Number.isFinite(endOdometer) || endOdometer < 0) fail(id, "End odometer cannot be negative.");
  if (endOdometer < startOdometer) fail(id, "End odometer cannot be less than the start odometer.");
  if (arrivalTime && Number.isNaN(arrivalTime.getTime())) fail(id, "Enter a valid arrival time.");
  if (arrivalTime && arrivalTime < departureTime) fail(id, "Arrival time cannot be before departure time.");

  try {
    await prisma.fleetTrip.update({
      where: { id },
      data: {
        vehicleId,
        driverId: driverId || null,
        origin,
        destination,
        purpose: value(formData, "purpose"),
        departureTime,
        arrivalTime,
        startOdometer,
        endOdometer,
        distance: endOdometer - startOdometer,
        status: value(formData, "status") || "In Progress",
        notes: value(formData, "notes"),
      },
    });
  } catch {
    fail(id, "Trip could not be updated. Check the details and retry.");
  }

  redirect(`/fleet/trips/${id}`);
}
