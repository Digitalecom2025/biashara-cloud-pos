import { getBusinessContext } from "@/lib/db-data";
import { prisma } from "@/lib/prisma";

async function fleetWhere() {
  const context = await getBusinessContext();
  if (!context.businessId) return {};
  return { businessId: context.businessId };
}

export async function getDrivers() {
  const where = await fleetWhere();
  return prisma.fleetDriver.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getDriver(id: string) {
  const where = await fleetWhere();
  return prisma.fleetDriver.findFirst({
    where: {
      id,
      ...where,
    },
    include: {
      vehicles: true,
      tripRecords: {
        include: { vehicle: true },
        orderBy: { departureTime: "desc" },
        take: 5,
      },
    },
  });
}
