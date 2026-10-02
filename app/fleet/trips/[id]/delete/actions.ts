"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export async function deleteTrip(id: string) {
  await prisma.fleetTrip.delete({ where: { id } });
  redirect("/fleet/trips");
}
