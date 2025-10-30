import { PrismaClient } from '@prisma/client';

// Global PrismaClient instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create PrismaClient with logging in development
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Export Prisma types for use in other packages
export * from '@prisma/client';

// Export utility functions
export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
    throw error;
  }
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { healthy: true, message: 'Database is healthy' };
  } catch (error) {
    return {
      healthy: false,
      message: `Database health check failed: ${error}`,
    };
  }
}

// REMOVED: Import and parsing functionality moved to FieryLib
// All world data import operations should now be performed using FieryLib:
//   cd ../fierylib
//   poetry run fierylib import-legacy
//
// This database package now only provides:
//   - Prisma client and types
//   - Database connection utilities
//   - Health check functions
//
// Game system seeding (races, classes, spells, skills) remains in ./seed/

// Lua sandbox utilities
// export * from './sandbox/lua-sandbox'; // TODO: Implement when needed
