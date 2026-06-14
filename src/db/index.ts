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
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  min: parseInt(process.env.DB_POOL_MIN || '2', 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  maxUses: 7500,
  allowExitOnIdle: false,
  statement_timeout: 30000,
  query_timeout: 30000,
});

// Enhanced connection lifecycle logging with error recovery
pool.on('error', (err, client) => {
  logger.critical('Unexpected database pool error', err);
  
  // Log to monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to error tracking (Sentry, DataDog, etc.)
  }
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
