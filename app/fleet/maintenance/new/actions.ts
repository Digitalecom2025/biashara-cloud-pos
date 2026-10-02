"use server";

import { redirect } from "next/navigation";

import { getFleetBusinessId } from "@/lib/fleet-data";
import { prisma } from "@/lib/prisma";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function fail(message: string): never {
  redirect(`/fleet/maintenance/new?error=${encodeURIComponent(message)}`);
}

export async function createMaintenance(formData: FormData) {
  const businessId = await getFleetBusinessId();
  if (!businessId) fail("Business context could not be found. Sign in again and retry.");

  const vehicleId = value(formData, "vehicleId");
  const serviceType = value(formData, "serviceType");
  const cost = Number(value(formData, "cost") || 0);
  const odometer = Number(value(formData, "odometer"));
  const serviceDateValue = value(formData, "serviceDate");
  const serviceDate = serviceDateValue ? new Date(serviceDateValue) : new Date();
  const nextServiceDateValue = value(formData, "nextServiceDate");
  const nextServiceDate = nextServiceDateValue ? new Date(nextServiceDateValue) : null;

  if (!vehicleId) fail("Vehicle is required.");
  if (!serviceType) fail("Service type is required.");
  if (!Number.isFinite(cost) || cost < 0) fail("Cost cannot be negative.");
  if (!Number.isFinite(odometer) || odometer < 0) fail("Odometer cannot be negative.");
  if (Number.isNaN(serviceDate.getTime())) fail("Enter a valid service date.");
  if (nextServiceDate && Number.isNaN(nextServiceDate.getTime())) fail("Enter a valid next service date.");

  try {
    await prisma.fleetMaintenance.create({
      data: {
        businessId,
        vehicleId,
        driverId: value(formData, "driverId") || null,
        serviceType,
        garage: value(formData, "garage"),
        mechanic: value(formData, "mechanic"),
        cost,
        odometer,
        nextServiceDate,
        serviceDate,
        status: value(formData, "status") || "Completed",
        notes: value(formData, "notes"),
      },
    });
  } catch {
    fail("Maintenance record could not be saved. Check the details and retry.");
  }

  redirect("/fleet/maintenance");
}
