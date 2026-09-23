import { Queue } from "bullmq";
import Redis from "ioredis";
import { logger } from "../lib/logger";

const REDIS_URL = process.env.REDIS_URL?.trim();

let connection: Redis | null = null;
let emailQueue: Queue | null = null;
let reconnectionAttempts = 0;
const MAX_RECONNECTION_ATTEMPTS = process.env.NODE_ENV === 'production' ? 10 : 5;

// Only initialize Redis if REDIS_URL is explicitly set, non-empty, and not default localhost
const isRedisConfigured = Boolean(
  REDIS_URL && 
  REDIS_URL !== '""' && 
  REDIS_URL !== "''" && 
  !REDIS_URL.includes('localhost')
);

if (isRedisConfigured && REDIS_URL) {
  try {
    const redisOptions: any = {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      connectTimeout: 20000,
      keepAlive: 30000,
      lazyConnect: false,
      enableOfflineQueue: true,
      family: 0, // CRITICAL: Fixes Upstash connection timeouts in Node > 18
      retryStrategy(times: number) {
        reconnectionAttempts = times;
        
        if (times > MAX_RECONNECTION_ATTEMPTS) {
          logger.warn(`Redis reconnection stopped after ${MAX_RECONNECTION_ATTEMPTS} attempts. Disabling queue.`);
          return null; // Stop reconnecting
        }
        
        // Exponential backoff with max 5 seconds
        const delay = Math.min(times * 500, 5000);
        logger.info('Redis retry attempt', { attempt: times, delayMs: delay });
        return delay;
      },
      reconnectOnError(err: Error) {
        const msg = err.message || '';
        // Never reconnect on DNS lookup failure (ENOTFOUND)
        if (msg.includes('ENOTFOUND')) {
          return false;
        }
        const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT', 'ENETUNREACH'];
        if (targetErrors.some(e => msg.includes(e))) {
          logger.info('Redis reconnecting due to error', { error: msg });
          return true;
        }
        return false;
      }
    };

    // If using rediss:// (SSL/TLS), enable TLS with rejectUnauthorized: false for maximum compatibility
    if (REDIS_URL.startsWith('rediss://')) {
      redisOptions.tls = {
        rejectUnauthorized: false
      };
    }

    connection = new Redis(REDIS_URL, redisOptions);
    
    connection.on('error', (err: any) => {
      const isDnsError = err?.code === 'ENOTFOUND' || err?.message?.includes('ENOTFOUND');
      if (isDnsError) {
        logger.warn(`Redis host '${err?.hostname || 'unresolved'}' not found (ENOTFOUND). Please verify REDIS_URL.`);
        return;
      }
      logger.error('Redis connection error', err, { code: err?.code });
    });

    connection.on('connect', () => {
      reconnectionAttempts = 0;
      logger.info('Redis connected successfully');
    });

    connection.on('ready', () => {
      logger.debug('Redis ready to accept commands');
    });

    connection.on('close', () => {
      logger.warn('Redis connection closed');
    });

    connection.on('reconnecting', (delay: number) => {
      logger.info('Redis reconnecting', { attempt: reconnectionAttempts, delayMs: delay });
    });

    connection.on('end', () => {
      logger.warn('Redis connection ended');
    });

    emailQueue = new Queue("email-queue", { 
      connection: connection as any,
      skipVersionCheck: true,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        },
        removeOnComplete: {
          count: 100,
          age: 3600
        },
        removeOnFail: {
          count: 200,
          age: 86400
        }
      }
    });
    logger.debug('Redis email queue initialized with auto-cleanup');
  } catch (e) {
    logger.error('Failed to initialize Redis', e as Error);
    logger.warn('Emails will be sent directly without queue');
  }
} else {
  logger.info('Redis not configured - emails will be sent directly via fallback');
}

export { connection, emailQueue };
