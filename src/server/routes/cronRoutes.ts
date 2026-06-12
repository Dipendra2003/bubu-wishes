import express from "express";
import { db } from "../../db/index";
import { contacts, users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { emailQueue } from "../queues/emailQueue";
import { sendEmail } from "../services/emailService";

export const cronRouter = express.Router();

// This should ideally be protected by a CRON_SECRET token that the scheduler passes
cronRouter.post("/send-birthday-reminders", async (req, res) => {
  const cronSecret = req.headers.authorization;
  if (process.env.CRON_SECRET && cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized scheduling attempt" });
  }

  try {
    const allContacts = await db.select().from(contacts);
    const today = new Date();
    
    const usersToNotify: Record<string, { email: string, name: string, contacts: any[] }> = {};
    
    for (const contact of allContacts) {
      const bday = new Date(contact.birthday);
      
      const nextBday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
      if (nextBday < today) {
        nextBday.setFullYear(today.getFullYear() + 1);
      }
      
      const diffDays = Math.ceil((nextBday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0 || diffDays === 1 || diffDays === 3) {
         if (!usersToNotify[contact.userId]) {
           const userRec = await db.select().from(users).where(eq(users.id, contact.userId)).limit(1);
           if (userRec.length > 0) {
             usersToNotify[contact.userId] = {
               email: userRec[0].email,
               name: userRec[0].name,
               contacts: []
             };
           }
         }
         if (usersToNotify[contact.userId]) {
           usersToNotify[contact.userId].contacts.push({...contact, daysUntil: diffDays});
         }
      }
    }
    
    let jobsAdded = 0;
    for (const userId in usersToNotify) {
      const u = usersToNotify[userId];
      
      let htmlBody = `<p>Hi ${u.name},</p><p>You have upcoming birthdays for your contacts:</p><ul>`;
      for (const c of u.contacts) {
        let when = c.daysUntil === 0 ? "<b>Today!</b>" : `in ${c.daysUntil} day(s)`;
        htmlBody += `<li><b>${c.name}</b> - ${when}</li>`;
      }
      htmlBody += `</ul><p>Make sure to create a special BubuWish card for them!</p>`;
      
      const jobData = {
        to: u.email,
        subject: "Upcoming Birthdays Reminder",
        html: htmlBody
      };

      if (emailQueue) {
        await emailQueue.add("send-email", jobData, {
          attempts: 3,
          backoff: { type: "exponential", delay: 5000 }
        });
        jobsAdded++;
      } else {
        // Fallback if Redis not available
        await sendEmail(jobData.to, jobData.subject, jobData.html);
      }
    }
    
    res.json({ success: true, message: `Birthday check completed. Notified ${Object.keys(usersToNotify).length} users. Queued: ${jobsAdded}` });
  } catch (e: any) {
    console.error("Error in birthday cron API:", e);
    res.status(500).json({ error: "Failed to process birthday reminders" });
  }
});
