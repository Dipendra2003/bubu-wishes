import { db } from "../../db/index";
import { contacts, users, cards, reminderHistory, userPreferences, emailLogs } from "../../db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { sendEmail, getBirthdayReminderEmailHtml, getBirthdayWishEmailHtml } from "./emailService";
import { emailQueue } from "../queues/emailQueue";
import { logger } from "../lib/logger";

interface ReminderCheck {
  userId: string;
  userEmail: string;
  userName: string;
  userTimezone: string;
  contactId: string;
  contactName: string;
  contactBirthday: Date;
  daysUntil: number;
  contactEmail?: string;
  preferences: {
    emailReminders: boolean;
    reminderDays: number[];
    birthdayWishEmail: boolean;
  };
}

/**
 * Calculate days until next birthday (timezone-aware)
 */
export function daysUntilBirthday(birthday: Date, timezone: string = 'UTC'): number {
  const now = new Date();
  const todayInTz = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  
  // Reset time to start of day for accurate comparison
  todayInTz.setHours(0, 0, 0, 0);
  
  const bday = new Date(birthday);
  const thisYear = todayInTz.getFullYear();
  
  // Create next birthday in user's timezone
  let nextBirthday = new Date(thisYear, bday.getMonth(), bday.getDate());
  nextBirthday.setHours(0, 0, 0, 0);
  
  // If birthday already passed this year, use next year
  if (nextBirthday < todayInTz) {
    nextBirthday = new Date(thisYear + 1, bday.getMonth(), bday.getDate());
    nextBirthday.setHours(0, 0, 0, 0);
  }
  
  // Calculate difference in days
  const diffTime = nextBirthday.getTime() - todayInTz.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Check if reminder was already sent for this contact and type
 */
async function wasReminderSent(
  userId: string, 
  contactId: string, 
  reminderType: string,
  contactBirthday: Date
): Promise<boolean> {
  try {
    // Get the year of the upcoming birthday
    const now = new Date();
    const bday = new Date(contactBirthday);
    const targetYear = bday.getMonth() < now.getMonth() || 
                      (bday.getMonth() === now.getMonth() && bday.getDate() < now.getDate())
                      ? now.getFullYear() + 1 
                      : now.getFullYear();
    
    const yearStart = new Date(targetYear, 0, 1);
    const yearEnd = new Date(targetYear, 11, 31, 23, 59, 59);
    
    const existing = await db
      .select()
      .from(reminderHistory)
      .where(
        and(
          eq(reminderHistory.userId, userId),
          eq(reminderHistory.contactId, contactId),
          eq(reminderHistory.reminderType, reminderType),
          gte(reminderHistory.sentAt, yearStart),
          lte(reminderHistory.sentAt, yearEnd)
        )
      )
      .limit(1);
    
    return existing.length > 0;
  } catch (error) {
    logger.error('Error checking reminder history', error as Error, { userId, contactId, reminderType });
    return false; // On error, allow reminder to be sent
  }
}

/**
 * Check if user has created a card for this contact's upcoming birthday
 */
async function hasCardForContact(userId: string, contactName: string): Promise<boolean> {
  try {
    // Check if there's a card with recipient matching contact name created this year
    const thisYear = new Date().getFullYear();
    const yearStart = new Date(thisYear, 0, 1);
    
    const existingCards = await db
      .select()
      .from(cards)
      .where(
        and(
          eq(cards.creatorId, userId),
          gte(cards.createdAt, yearStart)
        )
      );
    
    // Check if any card recipient matches the contact name (case-insensitive)
    return existingCards.some(card => 
      card.recipient.toLowerCase().trim() === contactName.toLowerCase().trim()
    );
  } catch (error) {
    logger.error('Error checking card existence', error as Error, { userId, contactName });
    return false; // On error, assume no card exists
  }
}

/**
 * Get all contacts with upcoming birthdays that need reminders
 * OPTIMIZED: Single query with JOIN to avoid N+1 problem
 */
export async function getUpcomingBirthdays(): Promise<ReminderCheck[]> {
  try {
    // Single optimized query with LEFT JOIN
    const contactsWithPrefs = await db
      .select({
        contactId: contacts.id,
        contactName: contacts.name,
        contactBirthday: contacts.birthday,
        contactEmail: contacts.email,
        userId: contacts.userId,
        userEmail: users.email,
        userName: users.name,
        userTimezone: users.timezone,
        // User preferences
        emailReminders: userPreferences.emailReminders,
        reminderDays: userPreferences.reminderDays,
        birthdayWishEmail: userPreferences.birthdayWishEmail,
        prefsTimezone: userPreferences.timezone,
      })
      .from(contacts)
      .innerJoin(users, eq(contacts.userId, users.id))
      .leftJoin(userPreferences, eq(userPreferences.userId, contacts.userId));
    
    const results: ReminderCheck[] = [];
    
    for (const contact of contactsWithPrefs) {
      // Use preferences or defaults
      const emailRemindersEnabled = contact.emailReminders ?? true;
      const reminderDaysStr = contact.reminderDays || '1,3,7';
      const birthdayWishEnabled = contact.birthdayWishEmail ?? true;
      
      // Skip if reminders disabled
      if (!emailRemindersEnabled) continue;
      
      // Parse reminder days
      const reminderDays = reminderDaysStr.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
      
      // Calculate days until birthday
      const timezone = contact.userTimezone || contact.prefsTimezone || 'UTC';
      const days = daysUntilBirthday(contact.contactBirthday, timezone);
      
      // Check if this day matches any reminder day OR if it's birthday (day 0)
      const shouldSendReminder = reminderDays.includes(days);
      const isBirthdayToday = days === 0 && birthdayWishEnabled;
      
      if (shouldSendReminder || isBirthdayToday) {
        results.push({
          userId: contact.userId,
          userEmail: contact.userEmail,
          userName: contact.userName,
          userTimezone: timezone,
          contactId: contact.contactId,
          contactName: contact.contactName,
          contactBirthday: contact.contactBirthday,
          daysUntil: days,
          contactEmail: contact.contactEmail || undefined,
          preferences: {
            emailReminders: emailRemindersEnabled,
            reminderDays,
            birthdayWishEmail: birthdayWishEnabled
          }
        });
      }
    }
    
    return results;
  } catch (error) {
    logger.error('Error fetching upcoming birthdays', error as Error);
    return [];
  }
}

/**
 * Send birthday reminder email to app user
 * Uses database transaction for atomicity
 */
async function sendReminderToUser(check: ReminderCheck): Promise<boolean> {
  try {
    const reminderType = `${check.daysUntil}day`;
    
    // Check if reminder already sent
    const alreadySent = await wasReminderSent(
      check.userId, 
      check.contactId, 
      reminderType,
      check.contactBirthday
    );
    
    if (alreadySent) {
      logger.debug('Reminder already sent', { contactName: check.contactName, reminderType });
      return false;
    }
    
    // Check if user already created a card for this contact
    const hasCard = await hasCardForContact(check.userId, check.contactName);
    if (hasCard) {
      logger.debug('User already has card for contact, skipping reminder', { 
        contactName: check.contactName,
        userId: check.userId
      });
      return false;
    }
    
    const subject = check.daysUntil === 1 
      ? `Tomorrow is ${check.contactName}'s Birthday! 🎉`
      : `${check.contactName}'s Birthday is in ${check.daysUntil} days! 🎂`;
    
    const htmlBody = getBirthdayReminderEmailHtml(
      check.userName,
      check.contactName,
      check.daysUntil,
      check.contactBirthday
    );
    
    // Use transaction to ensure atomicity
    const emailLogId = await db.transaction(async (tx) => {
      // Log email
      const emailLog = await tx.insert(emailLogs).values({
        recipientEmail: check.userEmail,
        subject,
        emailType: 'birthday_reminder',
        status: 'queued',
        metadata: JSON.stringify({ contactId: check.contactId, reminderType, userId: check.userId })
      }).returning();
      
      // Record reminder in history
      await tx.insert(reminderHistory).values({
        userId: check.userId,
        contactId: check.contactId,
        reminderType,
        emailSent: true,
        emailStatus: 'queued',
        contactBirthday: check.contactBirthday
      });
      
      return emailLog[0].id;
    });
    
    // Queue or send email (outside transaction)
    if (emailQueue) {
      await emailQueue.add("send-email", {
        to: check.userEmail,
        subject,
        html: htmlBody,
        logId: emailLogId
      }, {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 }
      });
    } else {
      await sendEmail(check.userEmail, subject, htmlBody);
      await updateEmailLog(emailLogId, 'sent');
    }
    
    logger.info('Birthday reminder sent', { 
      contactName: check.contactName,
      reminderType,
      recipient: check.userEmail,
      daysUntil: check.daysUntil
    });
    return true;
  } catch (error) {
    logger.error('Failed to send birthday reminder', error as Error, {
      contactName: check.contactName,
      userId: check.userId
    });
    
    // Log failure
    try {
      await db.insert(reminderHistory).values({
        userId: check.userId,
        contactId: check.contactId,
        reminderType: `${check.daysUntil}day`,
        emailSent: false,
        emailStatus: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        contactBirthday: check.contactBirthday
      });
    } catch (logError) {
      logger.error('Failed to log reminder failure', logError as Error);
    }
    
    return false;
  }
}

/**
 * Send birthday wish email directly to contact (on their birthday)
 * Uses database transaction for atomicity
 */
async function sendBirthdayWish(check: ReminderCheck): Promise<boolean> {
  try {
    // Only send if contact has email and user wants birthday wishes
    if (!check.contactEmail || !check.preferences.birthdayWishEmail) {
      return false;
    }
    
    const reminderType = 'birthday_wish';
    
    // Check if already sent
    const alreadySent = await wasReminderSent(
      check.userId,
      check.contactId,
      reminderType,
      check.contactBirthday
    );
    
    if (alreadySent) {
      logger.debug('Birthday wish already sent', { contactName: check.contactName });
      return false;
    }
    
    const subject = `🎉 Happy Birthday, ${check.contactName}!`;
    const htmlBody = getBirthdayWishEmailHtml(
      check.contactName,
      check.userName
    );
    
    // Use transaction to ensure atomicity
    const emailLogId = await db.transaction(async (tx) => {
      // Log email
      const emailLog = await tx.insert(emailLogs).values({
        recipientEmail: check.contactEmail!,
        subject,
        emailType: 'birthday_wish',
        status: 'queued',
        metadata: JSON.stringify({ contactId: check.contactId, senderId: check.userId })
      }).returning();
      
      // Record in history
      await tx.insert(reminderHistory).values({
        userId: check.userId,
        contactId: check.contactId,
        reminderType,
        emailSent: true,
        emailStatus: 'queued',
        contactBirthday: check.contactBirthday
      });
      
      return emailLog[0].id;
    });
    
    // Queue or send (outside transaction)
    if (emailQueue) {
      await emailQueue.add("send-email", {
        to: check.contactEmail,
        subject,
        html: htmlBody,
        logId: emailLogId
      }, {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 }
      });
    } else {
      await sendEmail(check.contactEmail, subject, htmlBody);
      await updateEmailLog(emailLogId, 'sent');
    }
    
    logger.info('Birthday wish sent to contact', {
      contactName: check.contactName,
      recipient: check.contactEmail,
      fromUser: check.userName
    });
    return true;
  } catch (error) {
    logger.error('Failed to send birthday wish', error as Error, {
      contactName: check.contactName,
      userId: check.userId
    });
    
    // Log failure
    try {
      await db.insert(reminderHistory).values({
        userId: check.userId,
        contactId: check.contactId,
        reminderType: 'birthday_wish',
        emailSent: false,
        emailStatus: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        contactBirthday: check.contactBirthday
      });
    } catch (logError) {
      logger.error('Failed to log birthday wish failure', logError as Error);
    }
    
    return false;
  }
}

/**
 * Log email to database
 */
async function logEmail(
  recipientEmail: string,
  subject: string,
  emailType: string,
  status: string,
  metadata?: any
): Promise<string> {
  try {
    const result = await db.insert(emailLogs).values({
      recipientEmail,
      subject,
      emailType,
      status,
      metadata: metadata ? JSON.stringify(metadata) : null
    }).returning();
    
    return result[0].id;
  } catch (error) {
    logger.error('Error logging email', error as Error, { recipientEmail, emailType });
    return '';
  }
}

/**
 * Update email log status
 */
async function updateEmailLog(logId: string, status: string, errorMessage?: string): Promise<void> {
  if (!logId) return;
  
  try {
    const updates: any = { status };
    
    if (status === 'sent') {
      updates.sentAt = new Date();
    } else if (status === 'failed') {
      updates.failedAt = new Date();
      if (errorMessage) {
        updates.errorMessage = errorMessage;
      }
    }
    
    await db.update(emailLogs)
      .set(updates)
      .where(eq(emailLogs.id, logId));
  } catch (error) {
    logger.error('Error updating email log', error as Error, { logId, status });
  }
}

/**
 * Process all birthday reminders and wishes
 */
export async function processBirthdayReminders(): Promise<{
  success: boolean;
  remindersSent: number;
  wishesSent: number;
  errors: number;
}> {
  logger.info('Starting birthday reminder processing');
  
  let remindersSent = 0;
  let wishesSent = 0;
  let errors = 0;
  
  try {
    const checks = await getUpcomingBirthdays();
    logger.info('Found contacts with upcoming birthdays', { count: checks.length });
    
    for (const check of checks) {
      try {
        if (check.daysUntil === 0) {
          // It's the birthday today - send wish to contact
          const wishSent = await sendBirthdayWish(check);
          if (wishSent) wishesSent++;
          
          // Also remind the user one more time
          const reminderSent = await sendReminderToUser(check);
          if (reminderSent) remindersSent++;
        } else {
          // Send reminder to app user
          const sent = await sendReminderToUser(check);
          if (sent) remindersSent++;
        }
      } catch (error) {
        logger.error('Error processing contact birthday', error as Error, { contactName: check.contactName });
        errors++;
      }
    }
    
    logger.info('Birthday processing complete', { remindersSent, wishesSent, errors });
    
    return {
      success: true,
      remindersSent,
      wishesSent,
      errors
    };
  } catch (error) {
    logger.error('Error in birthday reminder processing', error as Error);
    return {
      success: false,
      remindersSent,
      wishesSent,
      errors: errors + 1
    };
  }
}
