import { Worker, Job } from "bullmq";
import { connection } from "../queues/emailQueue";
import { sendEmail } from "../services/emailService";

export let emailWorker: Worker | null = null;

if (connection && process.env.REDIS_URL) {
  try {
    emailWorker = new Worker("email-queue", async (job: Job) => {
      if (job.name === "send-email") {
        const { to, subject, html } = job.data;
        await sendEmail(to, subject, html);
      }
    }, { 
      connection: connection as any,
      concurrency: 5 
    });

    emailWorker.on("completed", (job) => {
      console.log(`Job ${job.id} completed!`);
    });

    emailWorker.on("failed", (job, err) => {
      console.error(`Job ${job?.id} failed:`, err.message);
    });
  } catch (e) {
    console.warn("Failed to start email worker", e);
  }
} else {
  // No Redis configuration - email worker not started (emails sent directly)
}
