"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function fail(id: string, message: string): never {
  redirect(`/fleet/drivers/${id}/edit?error=${encodeURIComponent(message)}`);
}

export async function updateDriver(id: string, formData: FormData) {
  const fullName = value(formData, "fullName");
  const licenseNumber = value(formData, "licenseNumber");
  const licenseExpiryValue = value(formData, "licenseExpiry");
  const licenseExpiry = licenseExpiryValue ? new Date(licenseExpiryValue) : null;

  if (!fullName) fail(id, "Driver name is required.");
  if (!licenseNumber) fail(id, "Licence number is required.");
  if (licenseExpiryValue && Number.isNaN(licenseExpiry?.getTime())) fail(id, "Enter a valid licence expiry date.");

  try {
    await prisma.fleetDriver.update({
      where: { id },
      data: {
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
    fail(id, "Driver could not be updated. Check the details and retry.");
  }

  redirect(`/fleet/drivers/${id}`);
}
