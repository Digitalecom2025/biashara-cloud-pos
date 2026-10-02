import { getBusinessContext, getDemoBusinessId } from "@/lib/db-data";
import { prisma } from "@/lib/prisma";

async function fleetWhere() {
  const context = await getBusinessContext();
  if (!context.businessId) return {};
  return { businessId: context.businessId };
}

export async function getFleetBusinessId() {
  return getDemoBusinessId();
}

export async function getVehicles() {
  const where = await fleetWhere();
  return prisma.fleetVehicle.findMany({
    where,
    include: {
      driver: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getVehicle(id: string) {
  const where = await fleetWhere();
  return prisma.fleetVehicle.findFirst({
    where: {
      id,
      ...where,
    },
    include: {
      driver: true,
      fuelRecords: {
        orderBy: { filledAt: "desc" },
        take: 5,
      },
      maintenanceRecords: {
        orderBy: { serviceDate: "desc" },
        take: 5,
      },
      tripRecords: {
        orderBy: { departureTime: "desc" },
        take: 5,
      },
    },
  });
}

export async function getFleetDashboardData() {
  const where = await fleetWhere();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    vehicles,
    activeDrivers,
    activeTrips,
    fuelSpend,
    maintenanceDue,
    fuelRecords,
    maintenanceAlerts,
    recentTrips,
  ] = await Promise.all([
    prisma.fleetVehicle.findMany({
      where,
      include: { driver: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.fleetDriver.count({ where: { ...where, status: "Active" } }),
    prisma.fleetTrip.count({ where: { ...where, status: "In Progress" } }),
    prisma.fleetFuelRecord.aggregate({
      where: { ...where, filledAt: { gte: startOfMonth } },
      _sum: { totalCost: true },
    }),
    prisma.fleetMaintenance.count({
      where: {
        ...where,
        nextServiceDate: { not: null, lte: new Date() },
      },
    }),
    prisma.fleetFuelRecord.findMany({
      where,
      include: { vehicle: true, driver: true },
      orderBy: { filledAt: "desc" },
      take: 5,
    }),
    prisma.fleetMaintenance.findMany({
      where: { ...where, nextServiceDate: { not: null } },
      include: { vehicle: true, driver: true },
      orderBy: { nextServiceDate: "asc" },
      take: 5,
    }),
    prisma.fleetTrip.findMany({
      where,
      include: { vehicle: true, driver: true },
      orderBy: { departureTime: "desc" },
      take: 5,
    }),
  ]);

  return {
    vehicles,
    activeDrivers,
    activeTrips,
    fuelSpendThisMonth: fuelSpend._sum.totalCost ?? 0,
    maintenanceDue,
    fuelRecords,
    maintenanceAlerts,
    recentTrips,
  };
}
