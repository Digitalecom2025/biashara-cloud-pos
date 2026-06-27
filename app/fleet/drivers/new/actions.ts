"use server";

import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function createDriver(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "");
  const phoneNumber = String(formData.get("phoneNumber") ?? "");
  const email = String(formData.get("email") ?? "");
  const nationalId = String(formData.get("nationalId") ?? "");
  const licenseNumber = String(formData.get("licenseNumber") ?? "");
  const licenseExpiry = formData.get("licenseExpiry")
    ? new Date(String(formData.get("licenseExpiry")))
    : null;
  const emergencyContact = String(formData.get("emergencyContact") ?? "");
  const emergencyPhone = String(formData.get("emergencyPhone") ?? "");
  const address = String(formData.get("address") ?? "");
  const notes = String(formData.get("notes") ?? "");

  if (!fullName.trim()) {
    throw new Error("Driver name is required.");
  }

  if (!licenseNumber.trim()) {
    throw new Error("Licence number is required.");
  }

  await prisma.fleetDriver.create({
    data: {
      businessId: "demo-business",
      fullName,
      phoneNumber,
      email,
      nationalId,
      licenseNumber,
      licenseExpiry,
      emergencyContact,
      emergencyPhone,
      address,
      notes,
      status: "Active",
    },
  });

  redirect("/fleet/drivers");
}