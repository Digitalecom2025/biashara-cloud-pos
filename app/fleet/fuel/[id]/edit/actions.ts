"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function fail(id: string, message: string): never {
  redirect(`/fleet/fuel/${id}/edit?error=${encodeURIComponent(message)}`);
}

export async function updateFuelRecord(id: string, formData: FormData) {
  const vehicleId = value(formData, "vehicleId");
  const driverId = value(formData, "driverId");
  const litres = Number(value(formData, "litres"));
  const pricePerLitre = Number(value(formData, "pricePerLitre"));
  const odometer = Number(value(formData, "odometer"));
  const filledAtValue = value(formData, "filledAt");
  const filledAt = filledAtValue ? new Date(filledAtValue) : new Date();

  if (!vehicleId) fail(id, "Vehicle is required.");
  if (!Number.isFinite(litres) || litres <= 0) fail(id, "Litres must be greater than 0.");
  if (!Number.isFinite(pricePerLitre) || pricePerLitre <= 0) fail(id, "Price per litre must be greater than 0.");
  if (!Number.isFinite(odometer) || odometer < 0) fail(id, "Odometer cannot be negative.");
  if (Number.isNaN(filledAt.getTime())) fail(id, "Enter a valid fill date.");

  try {
    await prisma.fleetFuelRecord.update({
      where: { id },
      data: {
        vehicleId,
        driverId: driverId || null,
        fuelStation: value(formData, "fuelStation"),
        receiptNumber: value(formData, "receiptNumber"),
        fuelType: value(formData, "fuelType"),
        litres,
        pricePerLitre,
        totalCost: litres * pricePerLitre,
        odometer,
        filledAt,
        notes: value(formData, "notes"),
      },
    });
  } catch {
    fail(id, "Fuel record could not be updated. Check the details and retry.");
  }

  redirect(`/fleet/fuel/${id}`);
}
