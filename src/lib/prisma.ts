import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL || '';
  
  // Check if we're using Turso (libsql URL) - only at runtime, not build time
  if (dbUrl.startsWith('libsql://') || dbUrl.startsWith('https://')) {
    // Dynamic import to avoid build-time issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@libsql/client');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSql } = require('@prisma/adapter-libsql');
    
    const libsql = createClient({
      url: dbUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    
    const adapter = new PrismaLibSql(libsql);
    return new PrismaClient({ adapter } as any);
  }
  
  // Local development or fallback: Use regular Prisma
  return new PrismaClient();
}

// Lazy initialization - only create client when first accessed
let prismaInstance: PrismaClient | undefined;

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!prismaInstance) {
      prismaInstance = globalForPrisma.prisma ?? createPrismaClient();
      if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = prismaInstance;
      }
    }
    return (prismaInstance as any)[prop];
  },
});

export default prisma;
