import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as dotenv from 'dotenv';
import { logger } from '../server/lib/logger';
dotenv.config();

// Parse DATABASE_URL and configure SSL
const databaseUrl = process.env.DATABASE_URL || '';

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('sslmode=') ? {
    rejectUnauthorized: false
  } : false,
  max: parseInt(process.env.DB_POOL_MAX || '10', 10),
  min: 0, // Serverless PgBouncer pooler terminates idle connections; do not hold stale sockets
  idleTimeoutMillis: 15000, // Recycle idle connections promptly
  connectionTimeoutMillis: 30000, // 30s timeout for cold start / wake-up
  maxUses: 1000,
  allowExitOnIdle: false,
  statement_timeout: 45000,
  query_timeout: 45000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Enhanced connection lifecycle logging with serverless error recovery
pool.on('error', (err: any) => {
  const msg = err?.message || '';
  // Cloud serverless Postgres (Neon/Supabase) terminates idle connections from the server side.
  // pg-pool removes the dead client automatically; log as warning rather than critical exception.
  if (msg.includes('Connection terminated') || msg.includes('ECONNRESET') || msg.includes('timeout')) {
    logger.warn('Database idle connection dropped by serverless pooler (auto-reconnecting on next query)');
    return;
  }
  logger.critical('Unexpected database pool error', err);
});

pool.on('connect', (client) => {
  logger.debug('Database client connected to pool');
});

pool.on('acquire', (client) => {
  // Uncomment for debugging connection pool usage
  // logger.debug('Client acquired from pool');
});

pool.on('remove', (client) => {
  logger.debug('Database client removed from pool');
});

// Log pool stats periodically in development
if (process.env.NODE_ENV !== 'production') {
  setInterval(() => {
    logger.debug('Database pool statistics', {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount
    });
  }, 60000); // Every minute
}

export const db = drizzle(pool, { schema });
