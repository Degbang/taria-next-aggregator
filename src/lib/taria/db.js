import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;
const connectionString = process.env.DATABASE_URL?.trim();
const prismaOptions = {
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  ...(connectionString
    ? {
        adapter: new PrismaPg({ connectionString }),
      }
    : {}),
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
