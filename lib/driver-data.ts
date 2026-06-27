import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getDrivers() {
  return prisma.fleetDriver.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getDriver(id: string) {
  return prisma.fleetDriver.findUnique({
    where: {
      id,
    },
  });
}