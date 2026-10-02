"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

import { getFleetBusinessId } from "@/lib/fleet-data";
import { prisma } from "@/lib/prisma";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function fail(id: string, message: string): never {
  redirect(`/fleet/vehicles/${id}/edit?error=${encodeURIComponent(message)}`);
}

export async function updateVehicle(id: string, formData: FormData) {
  const businessId = await getFleetBusinessId();
  if (!businessId) fail(id, "Business context could not be found. Sign in again and retry.");

  const plateNumber = value(formData, "plateNumber").toUpperCase();
  const vehicleName = value(formData, "vehicleName");
  const vehicleType = value(formData, "vehicleType");
  const yearValue = value(formData, "year");
  const year = yearValue ? Number(yearValue) : null;
  const mileageValue = value(formData, "mileage");
  const mileage = mileageValue ? Number(mileageValue) : 0;

  if (!plateNumber) fail(id, "Plate number is required.");
  if (!vehicleName) fail(id, "Vehicle name is required.");
  if (!vehicleType) fail(id, "Vehicle type is required.");
  if (year !== null && (!Number.isInteger(year) || year < 1950)) fail(id, "Enter a valid vehicle year.");
  if (!Number.isFinite(mileage) || mileage < 0) fail(id, "Mileage cannot be negative.");

  try {
    await prisma.fleetVehicle.update({
      where: { id },
      data: {
        plateNumber,
        vehicleName,
        vehicleType,
        make: value(formData, "make"),
        model: value(formData, "model"),
        year,
        driverId: value(formData, "driverId") || null,
        fuelType: value(formData, "fuelType"),
        mileage,
        status: value(formData, "status") || "Active",
        notes: value(formData, "notes"),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      fail(id, "A vehicle with this plate number already exists.");
    }
    fail(id, "Vehicle could not be updated. Check the details and retry.");
  }

  redirect(`/fleet/vehicles/${id}`);
}
