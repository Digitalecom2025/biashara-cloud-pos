import { getBusinessContext } from "@/lib/db-data";
import { prisma } from "@/lib/prisma";

async function fleetWhere() {
  const context = await getBusinessContext();
  if (!context.businessId) return {};
  return { businessId: context.businessId };
}

export async function getFuelRecords() {
  const where = await fleetWhere();
  return prisma.fleetFuelRecord.findMany({
    where,
    include: {
      vehicle: true,
      driver: true,
    },
    orderBy: {
      filledAt: "desc",
    },
  });
}

export async function getFuelRecord(id: string) {
  const where = await fleetWhere();
  return prisma.fleetFuelRecord.findFirst({
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
