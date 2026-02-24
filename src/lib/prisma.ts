import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL || '';
  
  // Check if using Turso (libsql/https URL)
  if (dbUrl.startsWith('libsql://') || (dbUrl.includes('turso.io'))) {
    // Use dynamic imports for Turso adapter
    const { createClient } = require('@libsql/client/web');
    const { PrismaLibSql } = require('@prisma/adapter-libsql');
    
    const client = createClient({
      url: dbUrl.replace('libsql://', 'https://'),
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    
    const adapter = new PrismaLibSql(client);
    return new PrismaClient({ adapter } as any);
  }
  
  // Default: standard Prisma client (local SQLite)
  return new PrismaClient();
}

const prisma = global.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export { prisma };
export default prisma;
