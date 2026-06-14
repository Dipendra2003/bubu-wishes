import express from "express";
import { processBirthdayReminders } from "../services/reminderService";
import { triggerBirthdayCheck, getSchedulerStatus } from "../services/schedulerService";
import { runAllCleanupTasks } from "../services/cleanupService";

export const cronRouter = express.Router();

// This endpoint is protected by CRON_SECRET and can be called by external schedulers
cronRouter.post("/send-birthday-reminders", async (req, res) => {
  const cronSecret = req.headers.authorization;
  
  // CRITICAL: Require CRON_SECRET to be set
  if (!process.env.CRON_SECRET) {
    console.error('❌ CRITICAL: CRON_SECRET not configured');
    return res.status(500).json({ 
      error: "Server misconfiguration - CRON_SECRET not set" 
    });
  }
  
  if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('⚠️  Unauthorized cron attempt from:', req.ip);
    return res.status(401).json({ error: "Unauthorized scheduling attempt" });
  }

  try {
    const result = await processBirthdayReminders();
    
    res.json({
      success: result.success,
      message: `Birthday check completed. Sent ${result.remindersSent} reminders and ${result.wishesSent} wishes.`,
      remindersSent: result.remindersSent,
      wishesSent: result.wishesSent,
      errors: result.errors
    });
  } catch (error: any) {
    console.error("Error in birthday cron API:", error);
    res.status(500).json({ 
      error: "Failed to process birthday reminders",
      message: error.message 
    });
  }
});

// Trigger birthday check via queue (if Redis available)
cronRouter.post("/trigger-birthday-check", async (req, res) => {
  const cronSecret = req.headers.authorization;
  
  // CRITICAL: Require CRON_SECRET to be set
  if (!process.env.CRON_SECRET) {
    console.error('❌ CRITICAL: CRON_SECRET not configured');
    return res.status(500).json({ 
      error: "Server misconfiguration - CRON_SECRET not set" 
    });
  }
  
  if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('⚠️  Unauthorized cron attempt from:', req.ip);
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const result = await triggerBirthdayCheck();
    res.json(result);
  } catch (error: any) {
    console.error("Error triggering birthday check:", error);
    res.status(500).json({ 
      error: "Failed to trigger birthday check",
      message: error.message 
    });
  }
});

// Get scheduler status (admin only would be better, but accessible via secret for now)
cronRouter.get("/scheduler-status", async (req, res) => {
  const cronSecret = req.headers.authorization;
  
  // CRITICAL: Require CRON_SECRET to be set
  if (!process.env.CRON_SECRET) {
    console.error('❌ CRITICAL: CRON_SECRET not configured');
    return res.status(500).json({ 
      error: "Server misconfiguration - CRON_SECRET not set" 
    });
  }
  
  if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('⚠️  Unauthorized cron attempt from:', req.ip);
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const status = await getSchedulerStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ 
      error: "Failed to get scheduler status",
      message: error.message 
    });
  }
});

// Cleanup old logs and jobs (should run daily)
cronRouter.post("/cleanup", async (req, res) => {
  const cronSecret = req.headers.authorization;
  
  if (!process.env.CRON_SECRET) {
    console.error('❌ CRITICAL: CRON_SECRET not configured');
    return res.status(500).json({ 
      error: "Server misconfiguration - CRON_SECRET not set" 
    });
  }
  
  if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('⚠️  Unauthorized cron attempt from:', req.ip);
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const result = await runAllCleanupTasks();
    res.json(result);
  } catch (error: any) {
    console.error("Error in cleanup cron:", error);
    res.status(500).json({ 
      error: "Failed to run cleanup tasks",
      message: error.message 
    });
  }
});
