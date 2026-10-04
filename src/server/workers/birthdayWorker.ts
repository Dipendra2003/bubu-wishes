import { Worker, Job } from "bullmq";
import { connection } from "../queues/emailQueue";
import { processBirthdayReminders } from "../services/reminderService";
import { logger } from "../lib/logger";

export let birthdayWorker: Worker | null = null;

if (connection && process.env.REDIS_URL) {
  try {
    birthdayWorker = new Worker("birthday-reminders", async (job: Job) => {
      if (job.name === "check-birthdays") {
        logger.debug('Processing birthday reminders', {
          jobId: job.id,
          trigger: job.data.trigger
        });
        
        const result = await processBirthdayReminders();
        
        logger.debug('Birthday check complete', {
          jobId: job.id,
          remindersSent: result.remindersSent,
          wishesSent: result.wishesSent,
          errors: result.errors
        });
        
        return result;
      }
    }, { 
      connection: connection as any,
      skipVersionCheck: true,
      concurrency: 1,
      stalledInterval: 300000, // 5 min interval recommended for Upstash serverless
      drainDelay: 10000, // 10s wait when queue is empty to reduce idle socket churn
      maxStalledCount: 1,
      removeOnComplete: {
        count: 50,
        age: 7200
      },
      removeOnFail: {
        count: 100,
        age: 86400
      }
    });

    birthdayWorker.on("completed", (job) => {
      logger.debug('Birthday reminder job completed', { jobId: job.id });
    });

    birthdayWorker.on("failed", (job, err) => {
      logger.error('Birthday reminder job failed', err, { jobId: job?.id });
    });

    birthdayWorker.on("stalled", (jobId) => {
      logger.warn('Birthday reminder job stalled', { jobId });
    });

    birthdayWorker.on("error", (err: any) => {
      // Don't crash on Redis connection errors - they will auto-retry
      const errorMessage = err instanceof Error ? err.message : (typeof err === 'string' ? err : '');
      const errorStack = err instanceof Error ? err.stack || '' : '';
      const isTransient = errorMessage.includes('ENOTFOUND') ||
                          errorMessage.includes('ECONNRESET') ||
                          errorMessage.includes('ETIMEDOUT') ||
                          errorMessage.includes('ENETUNREACH') ||
                          errorMessage.includes('EHOSTUNREACH') ||
                          errorStack.includes('EHOSTUNREACH') ||
                          err?.name === 'AggregateError' ||
                          err?.code === 'EHOSTUNREACH';
      
      if (isTransient) {
        logger.debug('Birthday worker: transient Redis network event (auto-reconnecting)...');
      } else {
        logger.error('Birthday worker error', err);
      }
    });

    birthdayWorker.on("closed", () => {
      logger.warn('Birthday worker closed');
    });

    logger.debug('Birthday reminder worker started with auto-cleanup enabled');
  } catch (e) {
    logger.error('Failed to start birthday reminder worker', e as Error);
  }
} else {
  logger.info('Birthday reminder worker not started (Redis not configured)');
}
