import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getVehicles() {
  return prisma.fleetVehicle.findMany({
    include: {
      driver: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getVehicle(id: string) {
  return prisma.fleetVehicle.findUnique({
    where: {
      id,
    },
    include: {
      driver: true,
    },
  });
}