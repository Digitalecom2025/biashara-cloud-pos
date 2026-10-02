"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

import { getFleetBusinessId } from "@/lib/fleet-data";
import { prisma } from "@/lib/prisma";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function fail(message: string): never {
  redirect(`/fleet/vehicles/new?error=${encodeURIComponent(message)}`);
}

export async function createVehicle(formData: FormData) {
  const businessId = await getFleetBusinessId();
  if (!businessId) fail("Business context could not be found. Sign in again and retry.");

  const plateNumber = value(formData, "plateNumber").toUpperCase();
  const vehicleName = value(formData, "vehicleName");
  const vehicleType = value(formData, "vehicleType");
  const make = value(formData, "make");
  const model = value(formData, "model");
  const yearValue = value(formData, "year");
  const year = yearValue ? Number(yearValue) : null;
  const driverId = value(formData, "driverId");
  const fuelType = value(formData, "fuelType");
  const mileageValue = value(formData, "mileage");
  const mileage = mileageValue ? Number(mileageValue) : 0;
  const status = value(formData, "status") || "Active";
  const notes = value(formData, "notes");

  if (!plateNumber) fail("Plate number is required.");
  if (!vehicleName) fail("Vehicle name is required.");
  if (!vehicleType) fail("Vehicle type is required.");
  if (year !== null && (!Number.isInteger(year) || year < 1950)) fail("Enter a valid vehicle year.");
  if (!Number.isFinite(mileage) || mileage < 0) fail("Mileage cannot be negative.");

  try {
    await prisma.fleetVehicle.create({
      data: {
        businessId,
        plateNumber,
        vehicleName,
        vehicleType,
        make,
        model,
        year,
        driverId: driverId || null,
        fuelType,
        mileage,
        status,
        notes,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      fail("A vehicle with this plate number already exists.");
    }
    fail("Vehicle could not be saved. Check the details and retry.");
  }

  redirect("/fleet/vehicles");
}
