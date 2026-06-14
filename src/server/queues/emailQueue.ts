import { Queue } from "bullmq";
import Redis from "ioredis";
import { logger } from "../lib/logger";

const REDIS_URL = process.env.REDIS_URL;

let connection: Redis | null = null;
let emailQueue: Queue | null = null;
let reconnectionAttempts = 0;
const MAX_RECONNECTION_ATTEMPTS = 50;

// Only initialize Redis if REDIS_URL is explicitly set and not default localhost
if (REDIS_URL && !REDIS_URL.includes('localhost')) {
  try {
    const redisOptions: any = {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      connectTimeout: 30000, // Increased timeout to 30 seconds
      keepAlive: 30000,
      commandTimeout: 10000,
      lazyConnect: false,
      enableOfflineQueue: true,
      retryStrategy(times: number) {
        reconnectionAttempts = times;
        
        if (times > MAX_RECONNECTION_ATTEMPTS) {
          logger.error(`Redis reconnection failed after ${MAX_RECONNECTION_ATTEMPTS} attempts`, undefined, { attempts: MAX_RECONNECTION_ATTEMPTS });
          return null; // Stop reconnecting
        }
        
        // Exponential backoff with max 10 seconds
        const delay = Math.min(times * 500, 10000);
        logger.info('Redis retry attempt', { attempt: times, delayMs: delay });
        return delay;
      },
      reconnectOnError(err: Error) {
        const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ENETUNREACH'];
        if (targetErrors.some(e => err.message.includes(e))) {
          logger.info('Redis reconnecting due to error', { error: err.message });
          return true;
        }
        return false;
      }
    };

    // If using rediss:// (SSL), enable TLS
    if (REDIS_URL.startsWith('rediss://')) {
      redisOptions.tls = {
        rejectUnauthorized: false
      };
    }

    connection = new Redis(REDIS_URL, redisOptions);
    
    connection.on('error', (err) => {
      logger.error('Redis connection error', err, { code: (err as any).code });
    });

    connection.on('connect', () => {
      reconnectionAttempts = 0;
      logger.info('Redis connected successfully');
    });

    connection.on('ready', () => {
      logger.info('Redis ready to accept commands');
    });

    connection.on('close', () => {
      logger.warn('Redis connection closed - attempting reconnection');
    });

    connection.on('reconnecting', (delay: number) => {
      logger.info('Redis reconnecting', { attempt: reconnectionAttempts, delayMs: delay });
    });

    connection.on('end', () => {
      logger.error('Redis connection ended permanently');
    });

    emailQueue = new Queue("email-queue", { 
      connection: connection as any,
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
    logger.info('Redis email queue initialized with auto-cleanup');
  } catch (e) {
    logger.error('Failed to initialize Redis', e as Error);
    logger.warn('Emails will be sent directly without queue');
  }
} else {
  logger.warn('Redis not configured - emails will be sent directly');
}

export { connection, emailQueue };
