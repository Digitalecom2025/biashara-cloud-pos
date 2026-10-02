"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function fail(id: string, message: string): never {
  redirect(`/fleet/maintenance/${id}/edit?error=${encodeURIComponent(message)}`);
}

export async function updateMaintenance(id: string, formData: FormData) {
  const vehicleId = value(formData, "vehicleId");
  const serviceType = value(formData, "serviceType");
  const cost = Number(value(formData, "cost") || 0);
  const odometer = Number(value(formData, "odometer"));
  const serviceDateValue = value(formData, "serviceDate");
  const serviceDate = serviceDateValue ? new Date(serviceDateValue) : new Date();
  const nextServiceDateValue = value(formData, "nextServiceDate");
  const nextServiceDate = nextServiceDateValue ? new Date(nextServiceDateValue) : null;

  if (!vehicleId) fail(id, "Vehicle is required.");
  if (!serviceType) fail(id, "Service type is required.");
  if (!Number.isFinite(cost) || cost < 0) fail(id, "Cost cannot be negative.");
  if (!Number.isFinite(odometer) || odometer < 0) fail(id, "Odometer cannot be negative.");
  if (Number.isNaN(serviceDate.getTime())) fail(id, "Enter a valid service date.");
  if (nextServiceDate && Number.isNaN(nextServiceDate.getTime())) fail(id, "Enter a valid next service date.");

  try {
    await prisma.fleetMaintenance.update({
      where: { id },
      data: {
        vehicleId,
        driverId: value(formData, "driverId") || null,
        serviceType,
        garage: value(formData, "garage"),
        mechanic: value(formData, "mechanic"),
        cost,
        odometer,
        status: value(formData, "status") || "Pending",
        notes: value(formData, "notes"),
        serviceDate,
        nextServiceDate,
      },
    });
  } catch {
    fail(id, "Maintenance record could not be updated. Check the details and retry.");
  }

  redirect(`/fleet/maintenance/${id}`);
}
