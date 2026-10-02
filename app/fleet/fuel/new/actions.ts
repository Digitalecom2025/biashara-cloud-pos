"use server";

import { redirect } from "next/navigation";

import { getFleetBusinessId } from "@/lib/fleet-data";
import { prisma } from "@/lib/prisma";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function fail(message: string): never {
  redirect(`/fleet/fuel/new?error=${encodeURIComponent(message)}`);
}

export async function createFuelRecord(formData: FormData) {
  const businessId = await getFleetBusinessId();
  if (!businessId) fail("Business context could not be found. Sign in again and retry.");

  const vehicleId = value(formData, "vehicleId");
  const driverId = value(formData, "driverId");
  const litres = Number(value(formData, "litres"));
  const pricePerLitre = Number(value(formData, "pricePerLitre"));
  const odometer = Number(value(formData, "odometer"));
  const filledAtValue = value(formData, "filledAt");
  const filledAt = filledAtValue ? new Date(filledAtValue) : new Date();

  if (!vehicleId) fail("Vehicle is required.");
  if (!Number.isFinite(litres) || litres <= 0) fail("Litres must be greater than 0.");
  if (!Number.isFinite(pricePerLitre) || pricePerLitre <= 0) fail("Price per litre must be greater than 0.");
  if (!Number.isFinite(odometer) || odometer < 0) fail("Odometer cannot be negative.");
  if (Number.isNaN(filledAt.getTime())) fail("Enter a valid fill date.");

  try {
    await prisma.fleetFuelRecord.create({
      data: {
        businessId,
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
    fail("Fuel record could not be saved. Check the details and retry.");
  }

  redirect("/fleet/fuel");
}
