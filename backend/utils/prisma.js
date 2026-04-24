const { PrismaClient } = require('@prisma/client');

// Singleton pattern with auto-reconnect
let prisma;

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ['error', 'warn'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // Auto-reconnect on disconnect
    prisma.$on('error', async (e) => {
      console.error('❌ Prisma error event:', e.message);
    });
  }
  return prisma;
}

// Wrapper that retries once on connection failure
async function withRetry(fn) {
  try {
    return await fn(getPrisma());
  } catch (err) {
    const isConnErr =
      err.message?.includes('Server has closed the connection') ||
      err.message?.includes('connection') ||
      err.errorCode === 'P1001' ||
      err.errorCode === 'P1017' ||
      err.constructor?.name === 'PrismaClientInitializationError';

    if (isConnErr) {
      console.warn('🔄 DB connection lost — reconnecting...');
      try {
        await prisma?.$disconnect();
      } catch (_) {}
      prisma = null; // force new instance

      // Retry once
      return await fn(getPrisma());
    }
    throw err;
  }
}

module.exports = { getPrisma, withRetry };
