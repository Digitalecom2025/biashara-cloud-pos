"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export async function deleteFuelRecord(id: string) {
  await prisma.fleetFuelRecord.delete({ where: { id } });
  redirect("/fleet/fuel");
}
