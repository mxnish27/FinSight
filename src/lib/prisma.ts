import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Check if we're using Turso (libsql URL)
  const dbUrl = process.env.DATABASE_URL || '';
  
  if (dbUrl.startsWith('libsql://') || dbUrl.startsWith('https://')) {
    // Production: Use Turso/LibSQL
    const libsql = createClient({
      url: dbUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    // @ts-ignore - PrismaLibSql accepts libsql client
    const adapter = new PrismaLibSql(libsql);
    // @ts-ignore - adapter is valid with driverAdapters preview feature
    return new PrismaClient({ adapter });
  } else {
    // Local development: Use regular SQLite file
    return new PrismaClient();
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
