import { Queue } from "bullmq";
import Redis from "ioredis";
import { logger } from "../lib/logger";

const REDIS_URL = process.env.REDIS_URL?.trim();

let connection: Redis | null = null;
let emailQueue: Queue | null = null;

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
      keepAlive: 10000, // Active TCP keepalive
      lazyConnect: false,
      enableOfflineQueue: true,
      family: 4, // CRITICAL: Upstash Redis uses IPv4. Setting family: 4 avoids IPv6 ENOTFOUND/EHOSTUNREACH dual-stack errors in Node 18+ on Windows
      retryStrategy(times: number) {
        // Continuous exponential backoff capped at 5 seconds
        // Upstash Serverless routinely closes idle sockets after 30s of inactivity.
        // Attempt 1-2 is a normal background socket refresh; log as debug so console isn't spammed.
        const delay = Math.min(times * 500, 5000);
        if (times >= 3 && times % 5 === 0) {
          logger.warn('Redis reconnection taking multiple attempts...', { attempt: times, delayMs: delay });
        } else {
          logger.debug('Redis background reconnect attempt', { attempt: times, delayMs: delay });
        }
        return delay;
      },
      reconnectOnError(err: Error) {
        const msg = err.message || '';
        const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT', 'ENETUNREACH', 'EHOSTUNREACH'];
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
        logger.warn(`Redis host '${err?.hostname || 'unresolved'}' not found (ENOTFOUND). Waiting for network / DNS...`);
        return;
      }
      const isReset = err?.code === 'ECONNRESET' || err?.message?.includes('ECONNRESET');
      if (isReset) {
        // Upstash serverless drops idle sockets; ioredis auto-reconnects smoothly
        logger.debug('Redis idle connection reset by serverless host - auto-reconnecting...');
        return;
      }
      const isUnreach = err?.code === 'EHOSTUNREACH' || err?.message?.includes('EHOSTUNREACH') || err?.name === 'AggregateError';
      if (isUnreach) {
        logger.debug('Redis host temporarily unreachable - auto-reconnecting...');
        return;
      }
      logger.error('Redis connection error', err, { code: err?.code });
    });

    connection.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    connection.on('ready', () => {
      logger.debug('Redis ready to accept commands');
    });

    connection.on('close', () => {
      logger.debug('Redis connection closed (reconnecting)');
    });

    connection.on('reconnecting', (delay: number) => {
      logger.debug('Redis reconnecting', { delayMs: delay });
    });

    connection.on('end', () => {
      logger.warn('Redis connection closed');
    });

    // Upstash serverless TCP keepalive: ping every 20 seconds to prevent idle timeout
    const keepAliveTimer = setInterval(() => {
      if (connection && (connection.status === 'ready' || connection.status === 'connect')) {
        connection.ping().catch(() => {});
      }
    }, 20000);

    if (keepAliveTimer.unref) {
      keepAliveTimer.unref();
    }

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
