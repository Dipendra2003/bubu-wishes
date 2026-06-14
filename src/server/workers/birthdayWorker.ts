import { Worker, Job } from "bullmq";
import { connection } from "../queues/emailQueue";
import { processBirthdayReminders } from "../services/reminderService";
import { logger } from "../lib/logger";

export let birthdayWorker: Worker | null = null;

if (connection && process.env.REDIS_URL) {
  try {
    birthdayWorker = new Worker("birthday-reminders", async (job: Job) => {
      if (job.name === "check-birthdays") {
        logger.info('Processing birthday reminders', {
          jobId: job.id,
          trigger: job.data.trigger
        });
        
        const result = await processBirthdayReminders();
        
        logger.info('Birthday check complete', {
          jobId: job.id,
          remindersSent: result.remindersSent,
          wishesSent: result.wishesSent,
          errors: result.errors
        });
        
        return result;
      }
    }, { 
      connection: connection as any,
      concurrency: 1,
      stalledInterval: 60000,
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
      logger.info('Birthday reminder job completed', { jobId: job.id });
    });

    birthdayWorker.on("failed", (job, err) => {
      logger.error('Birthday reminder job failed', err, { jobId: job?.id });
    });

    birthdayWorker.on("stalled", (jobId) => {
      logger.warn('Birthday reminder job stalled', { jobId });
    });

    birthdayWorker.on("error", (err) => {
      // Don't crash on Redis connection errors - they will auto-retry
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Check if it's a connection error that will auto-recover
      if (errorMessage.includes('ETIMEDOUT') || 
          errorMessage.includes('ECONNRESET') || 
          errorMessage.includes('ENOTFOUND') ||
          errorMessage.includes('ENETUNREACH')) {
        logger.warn('Birthday worker connection error (will auto-retry)', { error: errorMessage });
      } else {
        logger.error('Birthday worker error', err);
      }
    });

    birthdayWorker.on("closed", () => {
      logger.warn('Birthday worker closed');
    });

    logger.info('Birthday reminder worker started with auto-cleanup enabled');
  } catch (e) {
    logger.error('Failed to start birthday reminder worker', e as Error);
  }
} else {
  logger.info('Birthday reminder worker not started (Redis not configured)');
}
