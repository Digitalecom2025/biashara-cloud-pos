"use server";

import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function createVehicle(formData: FormData) {
  const plateNumber = String(formData.get("plateNumber") ?? "");
  const vehicleName = String(formData.get("vehicleName") ?? "");
  const vehicleType = String(formData.get("vehicleType") ?? "");
  const make = String(formData.get("make") ?? "");
  const model = String(formData.get("model") ?? "");

  const yearValue = String(formData.get("year") ?? "");
  const year = yearValue ? Number(yearValue) : null;

  const driverId = String(formData.get("driverId") ?? "");

  const fuelType = String(formData.get("fuelType") ?? "");

  const mileageValue = String(formData.get("mileage") ?? "");
  const mileage = mileageValue ? Number(mileageValue) : 0;

  const status = String(formData.get("status") ?? "Active");
  const notes = String(formData.get("notes") ?? "");

  if (!plateNumber.trim()) {
    throw new Error("Plate Number is required.");
  }

  await prisma.fleetVehicle.create({
    data: {
      businessId: "demo-business",

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

  redirect("/fleet/vehicles");
}