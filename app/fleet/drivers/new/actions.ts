"use server";

import { redirect } from "next/navigation";

import { getFleetBusinessId } from "@/lib/fleet-data";
import { prisma } from "@/lib/prisma";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function fail(message: string): never {
  redirect(`/fleet/drivers/new?error=${encodeURIComponent(message)}`);
}

export async function createDriver(formData: FormData) {
  const businessId = await getFleetBusinessId();
  if (!businessId) fail("Business context could not be found. Sign in again and retry.");

  const fullName = value(formData, "fullName");
  const licenseNumber = value(formData, "licenseNumber");
  const licenseExpiryValue = value(formData, "licenseExpiry");
  const licenseExpiry = licenseExpiryValue ? new Date(licenseExpiryValue) : null;

  if (!fullName) fail("Driver name is required.");
  if (!licenseNumber) fail("Licence number is required.");
  if (licenseExpiryValue && Number.isNaN(licenseExpiry?.getTime())) fail("Enter a valid licence expiry date.");

  try {
    await prisma.fleetDriver.create({
      data: {
        businessId,
        fullName,
        phoneNumber: value(formData, "phoneNumber"),
        email: value(formData, "email"),
        nationalId: value(formData, "nationalId"),
        licenseNumber,
        licenseExpiry,
        emergencyContact: value(formData, "emergencyContact"),
        emergencyPhone: value(formData, "emergencyPhone"),
        address: value(formData, "address"),
        notes: value(formData, "notes"),
        status: value(formData, "status") || "Active",
      },
    });
  } catch {
    fail("Driver could not be saved. Check the details and retry.");
  }

  redirect("/fleet/drivers");
}
