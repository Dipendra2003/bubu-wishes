import { db } from "../../db/index";
import { emailLogs, reminderHistory } from "../../db/schema";
import { lte, eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import { birthdayReminderQueue } from "./schedulerService";
import { emailQueue } from "../queues/emailQueue";

/**
 * Clean up old email logs to prevent database bloat
 * Keeps last 30 days of logs
 */
export async function cleanupOldEmailLogs(): Promise<{
  deleted: number;
  error?: string;
}> {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const deleted = await db
      .delete(emailLogs)
      .where(lte(emailLogs.createdAt, thirtyDaysAgo))
      .returning();
    
    logger.info('Cleaned up old email logs', {
      deleted: deleted.length,
      cutoffDate: thirtyDaysAgo.toISOString()
    });
    
    return { deleted: deleted.length };
  } catch (error) {
    logger.error('Failed to cleanup email logs', error as Error);
    return { 
      deleted: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Clean up old reminder history to prevent database bloat
 * Keeps last 90 days of history
 */
export async function cleanupOldReminderHistory(): Promise<{
  deleted: number;
  error?: string;
}> {
  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    
    const deleted = await db
      .delete(reminderHistory)
      .where(lte(reminderHistory.sentAt, ninetyDaysAgo))
      .returning();
    
    logger.info('Cleaned up old reminder history', {
      deleted: deleted.length,
      cutoffDate: ninetyDaysAgo.toISOString()
    });
    
    return { deleted: deleted.length };
  } catch (error) {
    logger.error('Failed to cleanup reminder history', error as Error);
    return { 
      deleted: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Clean up old failed/completed jobs from Redis queues
 * Prevents Redis memory leak
 */
export async function cleanupOldQueueJobs(): Promise<{
  birthdayQueue: { completed: number; failed: number; };
  emailQueue: { completed: number; failed: number; };
  error?: string;
}> {
  const result = {
    birthdayQueue: { completed: 0, failed: 0 },
    emailQueue: { completed: 0, failed: 0 }
  };
  
  try {
    // Clean birthday queue
    if (birthdayReminderQueue) {
      const completedJobs = await birthdayReminderQueue.clean(7200000, 100, 'completed'); // 2 hours
      const failedJobs = await birthdayReminderQueue.clean(86400000, 200, 'failed'); // 24 hours
      
      result.birthdayQueue = {
        completed: completedJobs.length,
        failed: failedJobs.length
      };
    }
    
    // Clean email queue
    if (emailQueue) {
      const completedJobs = await emailQueue.clean(3600000, 100, 'completed'); // 1 hour
      const failedJobs = await emailQueue.clean(86400000, 200, 'failed'); // 24 hours
      
      result.emailQueue = {
        completed: completedJobs.length,
        failed: failedJobs.length
      };
    }
    
    logger.info('Cleaned up old queue jobs', result);
    
    return result;
  } catch (error) {
    logger.error('Failed to cleanup queue jobs', error as Error);
    return {
      ...result,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Run all cleanup tasks
 */
export async function runAllCleanupTasks(): Promise<{
  success: boolean;
  results: {
    emailLogs: { deleted: number; error?: string; };
    reminderHistory: { deleted: number; error?: string; };
    queueJobs: {
      birthdayQueue: { completed: number; failed: number; };
      emailQueue: { completed: number; failed: number; };
      error?: string;
    };
  };
}> {
  logger.info('Starting cleanup tasks');
  
  const [emailLogsResult, reminderHistoryResult, queueJobsResult] = await Promise.all([
    cleanupOldEmailLogs(),
    cleanupOldReminderHistory(),
    cleanupOldQueueJobs()
  ]);
  
  const success = !emailLogsResult.error && 
                  !reminderHistoryResult.error && 
                  !queueJobsResult.error;
  
  logger.info('Cleanup tasks completed', { 
    success,
    emailLogsDeleted: emailLogsResult.deleted,
    reminderHistoryDeleted: reminderHistoryResult.deleted
  });
  
  return {
    success,
    results: {
      emailLogs: emailLogsResult,
      reminderHistory: reminderHistoryResult,
      queueJobs: queueJobsResult
    }
  };
}
