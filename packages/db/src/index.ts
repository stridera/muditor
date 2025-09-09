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

// World parsing and import utilities
export * from './parsers/world-parser';
export * from './importers/world-importer';

// Lua sandbox utilities
// export * from './sandbox/lua-sandbox'; // TODO: Implement when needed
