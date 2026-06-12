import { Queue } from "bullmq";
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

let connection: Redis | null = null;
let emailQueue: Queue | null = null;

// Only initialize Redis if REDIS_URL is explicitly set and not default localhost
if (REDIS_URL && !REDIS_URL.includes('localhost')) {
  try {
    connection = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
      retryStrategy(times) {
        return Math.min(times * 50, 2000);
      }
    });
    emailQueue = new Queue("email-queue", { connection: connection as any });
    console.log("Redis queue initialized");
  } catch (e) {
    console.warn("Failed to init Redis. Queue will not work.", e);
  }
} else {
  // Redis not configured - emails will be sent directly (suitable for development)
}

export { connection, emailQueue };
