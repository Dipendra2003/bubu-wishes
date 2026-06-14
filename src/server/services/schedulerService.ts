import { Queue } from "bullmq";
import { connection } from "../queues/emailQueue";
import { processBirthdayReminders } from "./reminderService";
import { logger } from "../lib/logger";

export let birthdayReminderQueue: Queue | null = null;

/**
 * Acquire distributed lock using Redis SET NX EX
 * Prevents race conditions when multiple instances start simultaneously
 */
async function acquireDistributedLock(
  lockKey: string,
  lockValue: string,
  ttlSeconds: number
): Promise<boolean> {
  if (!connection) return false;
  
  try {
    // SET key value EX seconds NX
    // Returns "OK" if lock acquired, null if already exists
    const result = await connection.set(lockKey, lockValue, 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  } catch (error) {
    logger.error('Error acquiring distributed lock', error as Error, { lockKey });
    return false;
  }
}

/**
 * Release distributed lock (only if we own it)
 */
async function releaseDistributedLock(
  lockKey: string,
  lockValue: string
): Promise<void> {
  if (!connection) return;
  
  try {
    // Only delete if we still own the lock (compare value)
    const currentValue = await connection.get(lockKey);
    if (currentValue === lockValue) {
      await connection.del(lockKey);
    }
  } catch (error) {
    logger.error('Error releasing distributed lock', error as Error, { lockKey });
  }
}

/**
 * Initialize the birthday reminder scheduler with distributed locking
 * Uses BullMQ repeatable jobs to run every hour
 * Note: QueueScheduler is not needed in BullMQ v5+
 */
export async function initializeBirthdayScheduler() {
  if (!connection || !process.env.REDIS_URL || process.env.REDIS_URL.includes('localhost')) {
    logger.warn('Redis not configured - Birthday scheduler will not run automatically');
    logger.info('Manual trigger available via POST /api/cron/send-birthday-reminders');
    return;
  }

  const lockKey = 'scheduler:init:lock';
  const lockValue = `${Date.now()}-${Math.random()}`;
  const lockTTL = 10; // 10 seconds

  try {
    // Create dedicated queue for birthday reminders
    birthdayReminderQueue = new Queue("birthday-reminders", { 
      connection: connection as any,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        },
        removeOnComplete: 50,
        removeOnFail: 100
      }
    });

    // CRITICAL: Acquire distributed lock to prevent race condition
    logger.info('Attempting to acquire scheduler initialization lock');
    const lockAcquired = await acquireDistributedLock(lockKey, lockValue, lockTTL);
    
    if (!lockAcquired) {
      logger.info('Another instance is initializing scheduler, skipping');
      logger.info('Birthday reminder queue connected (scheduler already initialized by another instance)');
      return;
    }

    logger.info('Lock acquired, initializing scheduler');

    try {
      // Remove any existing repeatable jobs to avoid duplicates
      const repeatableJobs = await birthdayReminderQueue.getRepeatableJobs();
      logger.info('Found existing repeatable jobs', { count: repeatableJobs.length });
      
      for (const job of repeatableJobs) {
        logger.info('Removing old repeatable job', { jobKey: job.key });
        await birthdayReminderQueue.removeRepeatableByKey(job.key);
      }

      // Schedule birthday reminder check to run every hour
      // This ensures we catch birthdays in all timezones
      await birthdayReminderQueue.add(
        'check-birthdays',
        { 
          timestamp: new Date().toISOString(),
          trigger: 'scheduled'
        },
        {
          repeat: {
            pattern: '0 * * * *', // Every hour at minute 0 (Cron: "0 * * * *")
          },
          jobId: 'birthday-reminder-hourly-check'
        }
      );

      logger.info('Birthday reminder scheduler initialized', { intervalPattern: '0 * * * *' });
      logger.info('Next check will process all timezones and send reminders accordingly');

      // Add immediate job to test the system on startup
      await birthdayReminderQueue.add(
        'check-birthdays',
        { 
          timestamp: new Date().toISOString(),
          trigger: 'startup'
        }
      );

      logger.info('Initial birthday check queued for immediate processing');

    } finally {
      // Always release lock, even if initialization fails
      await releaseDistributedLock(lockKey, lockValue);
      logger.info('Lock released');
    }

  } catch (error) {
    logger.error('Failed to initialize birthday scheduler', error as Error);
    // Don't throw - allow server to start even if scheduler fails
    logger.warn('Server will continue without automatic birthday reminders');
    logger.info('Manual trigger available via POST /api/cron/send-birthday-reminders');
  }
}

/**
 * Manually trigger birthday reminder processing
 * Useful for testing or manual runs
 */
export async function triggerBirthdayCheck(): Promise<any> {
  if (!birthdayReminderQueue) {
    // If no queue, run directly
    return await processBirthdayReminders();
  }

  // Add job to queue
  const job = await birthdayReminderQueue.add(
    'check-birthdays',
    { 
      timestamp: new Date().toISOString(),
      trigger: 'manual'
    }
  );

  return { 
    success: true, 
    message: 'Birthday check triggered',
    jobId: job.id 
  };
}

/**
 * Get scheduler status and metrics
 */
export async function getSchedulerStatus() {
  if (!birthdayReminderQueue) {
    return {
      enabled: false,
      message: 'Scheduler not initialized (Redis not configured)'
    };
  }

  try {
    const repeatableJobs = await birthdayReminderQueue.getRepeatableJobs();
    const waiting = await birthdayReminderQueue.getWaitingCount();
    const active = await birthdayReminderQueue.getActiveCount();
    const completed = await birthdayReminderQueue.getCompletedCount();
    const failed = await birthdayReminderQueue.getFailedCount();

    return {
      enabled: true,
      repeatableJobs: repeatableJobs.length,
      waiting,
      active,
      completed,
      failed,
      schedule: repeatableJobs.map(job => ({
        key: job.key,
        pattern: job.pattern,
        next: job.next
      }))
    };
  } catch (error) {
    return {
      enabled: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Gracefully shutdown the scheduler
 */
export async function shutdownScheduler() {
  if (birthdayReminderQueue) {
    await birthdayReminderQueue.close();
    logger.info('Birthday reminder queue closed');
  }
}
