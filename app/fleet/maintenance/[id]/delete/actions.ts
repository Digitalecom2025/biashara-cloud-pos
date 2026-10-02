"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export async function deleteMaintenance(id: string) {
  await prisma.fleetMaintenance.delete({ where: { id } });
  redirect("/fleet/maintenance");
}
