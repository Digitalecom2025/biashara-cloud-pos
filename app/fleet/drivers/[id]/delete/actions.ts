"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export async function deleteDriver(id: string) {
  try {
    await prisma.fleetDriver.delete({ where: { id } });
  } catch {
    redirect(`/fleet/drivers/${id}?error=${encodeURIComponent("Driver could not be deleted because related vehicles, trips, fuel or maintenance records still reference this driver.")}`);
  }

  redirect("/fleet/drivers");
}
