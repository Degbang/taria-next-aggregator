import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Client } from "pg";

const globalForPrisma = globalThis;
const connectionString = process.env.DATABASE_URL?.trim();
const normalizeConnectionString = (value) => (typeof value === "string" ? value : undefined);
const normalizedConnectionString = normalizeConnectionString(connectionString);
const prismaOptions = {
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  ...(normalizedConnectionString
    ? {
        adapter: new PrismaPg({ connectionString: normalizedConnectionString }),
      }
    : {}),
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(prismaOptions);

export async function createPgClient() {
  const workerConnectionString = await getWorkerDatabaseConnectionString();

  return new Client({
    connectionString: normalizeConnectionString(workerConnectionString || normalizedConnectionString),
    connectionTimeoutMillis: 8000,
  });
}

export async function withPgClient(callback) {
  const client = await createPgClient();
  await client.connect();
  return callback(client);
}

async function getWorkerDatabaseConnectionString() {
  try {
    const runtimeEnv = (await getCloudflareContext({ async: true })).env;
    const hyperdriveConnectionString = runtimeEnv.HYPERDRIVE?.connectionString?.trim();
    const databaseConnectionString = runtimeEnv.DATABASE_URL?.trim();
    return hyperdriveConnectionString || databaseConnectionString;
  } catch {
    return undefined;
  }
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
