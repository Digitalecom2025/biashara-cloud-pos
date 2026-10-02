import { getBusinessContext } from "@/lib/db-data";
import { prisma } from "@/lib/prisma";

async function fleetWhere() {
  const context = await getBusinessContext();
  if (!context.businessId) return {};
  return { businessId: context.businessId };
}

export async function getTripRecords() {
  const where = await fleetWhere();
  return prisma.fleetTrip.findMany({
    where,
    include: {
      vehicle: true,
      driver: true,
    },
    orderBy: {
      departureTime: "desc",
    },
  });
}

export async function getTripRecord(id: string) {
  const where = await fleetWhere();
  return prisma.fleetTrip.findFirst({
    where: {
      id,
      ...where,
    },
    include: {
      vehicle: true,
      driver: true,
    },
  });
}
