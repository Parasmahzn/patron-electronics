import 'server-only';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@/lib/generated/prisma/client';

// Reuse a single PrismaClient/connection pool across module reloads in
// development so `next dev` hot-reloading doesn't exhaust MySQL connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaMariaDb(process.env.DATABASE_URL ?? '');
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
