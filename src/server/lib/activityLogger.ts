import { db } from "../../db/index";
import { activityLogs } from "../../db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { Request } from "express";

export type ActivityAction = 
  | 'login' 
  | 'logout' 
  | 'password_change' 
  | 'email_change' 
  | 'password_reset' 
  | 'failed_login' 
  | 'account_locked'
  | 'suspicious_login'
  | 'session_revoked'
  | 'google_login'
  | 'google_signup'
  | 'google_link_failed'
  | 'google_account_linked'
  | 'google_auth_failed'
  | 'google_login_failed'
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
    const ipAddress = getClientIpFromReq(req);
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
 * Get user's recent activity with pagination
 */
export async function getUserActivity(userId: string, limit: number = 20, offset: number = 0) {
  try {
    const logs = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return logs;
  } catch (error) {
    console.error('Failed to fetch activity:', error);
    return [];
  }
}

/**
 * Check if a login is from a new/unknown IP for this user
 */
export async function isNewLoginLocation(userId: string, currentIp: string): Promise<boolean> {
  try {
    // Check if this IP has been seen in past successful logins
    const previousLogins = await db
      .select({ ipAddress: activityLogs.ipAddress })
      .from(activityLogs)
      .where(
        and(
          eq(activityLogs.userId, userId),
          eq(activityLogs.action, 'login'),
          eq(activityLogs.ipAddress, currentIp)
        )
      )
      .limit(1);

    return previousLogins.length === 0;
  } catch (error) {
    console.error('Failed to check login location:', error);
    return false; // Don't flag on error
  }
}

/**
 * Extract client IP from request
 */
function getClientIpFromReq(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',');
    return ips[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}
