import express from "express";
import { db } from "../../db/index";
import { userPreferences, users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { authenticate } from "../middleware/auth";

export const preferencesRouter = express.Router();

preferencesRouter.use(authenticate);

// Get user preferences
preferencesRouter.get("/", async (req: any, res) => {
  try {
    const prefs = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, req.user.id))
      .limit(1);

    if (prefs.length === 0) {
      // Return defaults if no preferences exist
      return res.json({
        emailReminders: true,
        reminderDays: '1,3,7',
        reminderTime: '08:00',
        birthdayWishEmail: true,
        timezone: req.user.timezone || 'UTC'
      });
    }

    res.json(prefs[0]);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Update user preferences
preferencesRouter.put("/", async (req: any, res) => {
  try {
    const { 
      emailReminders, 
      reminderDays, 
      reminderTime, 
      birthdayWishEmail, 
      timezone 
    } = req.body;

    // Validation
    if (emailReminders !== undefined && typeof emailReminders !== 'boolean') {
      return res.status(400).json({ error: 'emailReminders must be a boolean' });
    }

    if (birthdayWishEmail !== undefined && typeof birthdayWishEmail !== 'boolean') {
      return res.status(400).json({ error: 'birthdayWishEmail must be a boolean' });
    }

    if (reminderDays !== undefined) {
      const days = reminderDays.split(',').map((d: string) => parseInt(d.trim()));
      if (days.some((d: number) => isNaN(d) || d < 0 || d > 30)) {
        return res.status(400).json({ error: 'Invalid reminderDays format. Use comma-separated numbers (e.g., "1,3,7")' });
      }
    }

    if (reminderTime !== undefined) {
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(reminderTime)) {
        return res.status(400).json({ error: 'Invalid reminderTime format. Use HH:mm (e.g., "08:00")' });
      }
    }

    // Check if preferences exist
    const existing = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, req.user.id))
      .limit(1);

    const updates: any = {
      updatedAt: new Date()
    };

    if (emailReminders !== undefined) updates.emailReminders = emailReminders;
    if (reminderDays !== undefined) updates.reminderDays = reminderDays;
    if (reminderTime !== undefined) updates.reminderTime = reminderTime;
    if (birthdayWishEmail !== undefined) updates.birthdayWishEmail = birthdayWishEmail;
    if (timezone !== undefined) {
      updates.timezone = timezone;
      // Also update user table timezone
      await db.update(users)
        .set({ timezone })
        .where(eq(users.id, req.user.id));
    }

    if (existing.length === 0) {
      // Create new preferences
      const result = await db.insert(userPreferences)
        .values({
          userId: req.user.id,
          emailReminders: emailReminders ?? true,
          reminderDays: reminderDays ?? '1,3,7',
          reminderTime: reminderTime ?? '08:00',
          birthdayWishEmail: birthdayWishEmail ?? true,
          timezone: timezone ?? req.user.timezone ?? 'UTC'
        })
        .returning();

      return res.json(result[0]);
    } else {
      // Update existing preferences
      const result = await db.update(userPreferences)
        .set(updates)
        .where(eq(userPreferences.userId, req.user.id))
        .returning();

      return res.json(result[0]);
    }
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Reset preferences to defaults
preferencesRouter.post("/reset", async (req: any, res) => {
  try {
    const result = await db.update(userPreferences)
      .set({
        emailReminders: true,
        reminderDays: '1,3,7',
        reminderTime: '08:00',
        birthdayWishEmail: true,
        timezone: req.user.timezone || 'UTC',
        updatedAt: new Date()
      })
      .where(eq(userPreferences.userId, req.user.id))
      .returning();

    if (result.length === 0) {
      // Create if doesn't exist
      const newPrefs = await db.insert(userPreferences)
        .values({
          userId: req.user.id,
          emailReminders: true,
          reminderDays: '1,3,7',
          reminderTime: '08:00',
          birthdayWishEmail: true,
          timezone: req.user.timezone || 'UTC'
        })
        .returning();

      return res.json(newPrefs[0]);
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error resetting preferences:', error);
    res.status(500).json({ error: 'Failed to reset preferences' });
  }
});
