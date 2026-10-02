"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export async function deleteVehicle(id: string) {
  try {
    await prisma.fleetVehicle.delete({ where: { id } });
  } catch {
    redirect(`/fleet/vehicles/${id}?error=${encodeURIComponent("Vehicle could not be deleted because it still has related records.")}`);
  }

  redirect("/fleet/vehicles");
}
