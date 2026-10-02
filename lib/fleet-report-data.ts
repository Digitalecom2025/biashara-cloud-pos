import { prisma } from "@/lib/prisma";
import { getBusinessContext } from "@/lib/db-data";

async function fleetWhere() {
  const context = await getBusinessContext();
  if (!context.businessId) return {};
  return { businessId: context.businessId };
}

export async function getFleetOverview() {
  const where = await fleetWhere();
  const [
    totalVehicles,
    totalDrivers,
    totalTrips,
    totalFuelRecords,
    totalMaintenanceRecords,
    maintenanceAggregate,
  ] = await Promise.all([
    prisma.fleetVehicle.count({ where }),

    prisma.fleetDriver.count({ where }),

    prisma.fleetTrip.count({ where }),

    prisma.fleetFuelRecord.count({ where }),

    prisma.fleetMaintenance.count({ where }),

    prisma.fleetMaintenance.aggregate({
      where,
      _sum: {
        cost: true,
      },
    }),
  ]);

  return {
    totalVehicles,
    totalDrivers,
    totalTrips,
    totalFuelRecords,
    totalMaintenanceRecords,
    totalMaintenanceCost:
      maintenanceAggregate._sum.cost ?? 0,
  };
}
 export async function getTotalDistanceTravelled() {
  const where = await fleetWhere();
  const result = await prisma.fleetTrip.aggregate({
    where,
    _sum: {
      distance: true,
    },
  });

  return result._sum.distance ?? 0;
}
export async function getUpcomingMaintenance() {
  const where = await fleetWhere();
  return prisma.fleetMaintenance.findMany({
    where: {
      ...where,
      nextServiceDate: {
        not: null,
      },
    },

    include: {
      vehicle: true,
      driver: true,
    },

    orderBy: {
      nextServiceDate: "asc",
    },

    take: 10,
  });
}
export async function getMostUsedVehicle() {
  const where = await fleetWhere();
  const vehicle = await prisma.fleetVehicle.findFirst({
    where,
    include: {
      _count: {
        select: {
          tripRecords: true,
        },
      },
    },

    orderBy: {
      tripRecords: {
        _count: "desc",
      },
    },
  });

  return vehicle;
}
export async function getTopDriver() {
  const where = await fleetWhere();
  const driver = await prisma.fleetDriver.findFirst({
    where,
    include: {
      _count: {
        select: {
          tripRecords: true,
        },
      },
    },

    orderBy: {
      tripRecords: {
        _count: "desc",
      },
    },
  });

  return driver;
}
export async function getVehiclePerformance() {
  const where = await fleetWhere();
  return prisma.fleetVehicle.findMany({
    where,
    include: {
      _count: {
        select: {
          tripRecords: true,
          maintenanceRecords: true,
          fuelRecords: true,
        },
      },
    },

    orderBy: {
      plateNumber: "asc",
    },
  });
}
export async function getDriverPerformance() {
  const where = await fleetWhere();
  return prisma.fleetDriver.findMany({
    where,
    include: {
      _count: {
        select: {
          tripRecords: true,
          vehicles: true,
          fuelRecords: true,
          maintenanceRecords: true,
        },
      },
    },

    orderBy: {
      fullName: "asc",
    },
  });
}
export async function getTripChartData() {
  const where = await fleetWhere();
  const trips = await prisma.fleetTrip.findMany({
    where,
    orderBy: {
      departureTime: "asc",
    },
  });

  const monthlyTrips = new Map<string, number>();

  trips.forEach((trip) => {
    const month = new Intl.DateTimeFormat("en-GB", {
      month: "short",
      year: "2-digit",
    }).format(trip.departureTime);

    monthlyTrips.set(
      month,
      (monthlyTrips.get(month) ?? 0) + 1
    );
  });

  return Array.from(monthlyTrips.entries()).map(
    ([name, value]) => ({
      name,
      value,
    })
  );
}
