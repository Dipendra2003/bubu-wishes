import { db } from "../../db/index";
import { activityLogs } from "../../db/schema";
import { eq, desc } from "drizzle-orm";
import { Request } from "express";

export type ActivityAction = 
  | 'login' 
  | 'logout' 
  | 'password_change' 
  | 'email_change' 
  | 'password_reset' 
  | 'failed_login' 
  | 'account_locked'
  | 'google_auth_failed'
  | 'google_login_failed'
  | 'google_login'
  | 'google_link_failed'
  | 'google_account_linked'
  | 'google_signup'
  | 'google_account_unlinked';

/**
 * Log user activity for security auditing
 */
export async function logActivity(
  userId: string,
  action: ActivityAction,
  req: Request,
  metadata?: any
): Promise<void> {
  try {
    const ipAddress = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    await db.insert(activityLogs).values({
      userId,
      action,
      ipAddress,
      userAgent,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

/**
 * Get user's recent activity
 */
export async function getUserActivity(userId: string, limit: number = 20) {
  try {
    const logs = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);

    return logs;
  } catch (error) {
    console.error('Failed to fetch activity:', error);
    return [];
  }
}
