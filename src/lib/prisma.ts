import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Use standard Prisma client
// For production with Turso, we'll use a different approach
const prisma = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export { prisma };
export default prisma;
