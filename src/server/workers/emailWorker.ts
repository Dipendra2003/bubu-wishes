import { Worker, Job } from "bullmq";
import { connection } from "../queues/emailQueue";
import { sendEmail } from "../services/emailService";
import { db } from "../../db/index";
import { emailLogs } from "../../db/schema";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

export let emailWorker: Worker | null = null;

if (connection && process.env.REDIS_URL) {
  try {
    emailWorker = new Worker("email-queue", async (job: Job) => {
      if (job.name === "send-email") {
        const { to, subject, html, logId } = job.data;
        
        logger.info('Processing email job', {
          jobId: job.id,
          to,
          subject,
          attempt: job.attemptsMade + 1
        });
        
        try {
          await sendEmail(to, subject, html);
          
          if (logId) {
            await db.update(emailLogs)
              .set({ 
                status: 'sent',
                sentAt: new Date()
              })
              .where(eq(emailLogs.id, logId));
          }
          
          logger.info('Email sent successfully', {
            jobId: job.id,
            to
          });
          
          return { success: true, to, subject };
        } catch (error) {
          const retryAttempt = job.attemptsMade || 0;
          
          if (logId) {
            await db.update(emailLogs)
              .set({ 
                status: retryAttempt >= 2 ? 'failed' : 'queued',
                failedAt: retryAttempt >= 2 ? new Date() : null,
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                retryCount: retryAttempt.toString()
              })
              .where(eq(emailLogs.id, logId));
          }
          
          logger.error('Email send failed', error as Error, {
            jobId: job.id,
            to,
            attempt: retryAttempt + 1
          });
          
          throw error;
        }
      }
    }, { 
      connection: connection as any,
      concurrency: 5,
      stalledInterval: 30000,
      maxStalledCount: 2,
      removeOnComplete: {
        count: 100,
        age: 3600
      },
      removeOnFail: {
        count: 200,
        age: 86400
      }
    });

    emailWorker.on("completed", (job) => {
      logger.info('Email job completed', { jobId: job.id });
    });

    emailWorker.on("failed", (job, err) => {
      logger.error('Email job failed', err, { jobId: job?.id });
    });

    emailWorker.on("stalled", (jobId) => {
      logger.warn('Email job stalled', { jobId });
    });

    emailWorker.on("error", (err) => {
      // Don't crash on Redis connection errors - they will auto-retry
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Check if it's a connection error that will auto-recover
      if (errorMessage.includes('ETIMEDOUT') || 
          errorMessage.includes('ECONNRESET') || 
          errorMessage.includes('ENOTFOUND') ||
          errorMessage.includes('ENETUNREACH')) {
        logger.warn('Email worker connection error (will auto-retry)', { error: errorMessage });
      } else {
        logger.error('Email worker error', err);
      }
    });

    emailWorker.on("closed", () => {
      logger.warn('Email worker closed');
    });

    logger.info('Email worker started with auto-cleanup enabled');
  } catch (e) {
    logger.error('Failed to start email worker', e as Error);
  }
} else {
  logger.info('Email worker not started (Redis not configured)');
}
