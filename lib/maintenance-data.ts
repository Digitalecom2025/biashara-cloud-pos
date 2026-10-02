import { getBusinessContext } from "@/lib/db-data";
import { prisma } from "@/lib/prisma";

async function fleetWhere() {
  const context = await getBusinessContext();
  if (!context.businessId) return {};
  return { businessId: context.businessId };
}

export async function getMaintenanceRecords() {
  const where = await fleetWhere();
  return prisma.fleetMaintenance.findMany({
    where,
    include: {
      vehicle: true,
      driver: true,
    },
    orderBy: {
      serviceDate: "desc",
    },
  });
}

export async function getMaintenanceRecord(id: string) {
  const where = await fleetWhere();
  return prisma.fleetMaintenance.findFirst({
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
