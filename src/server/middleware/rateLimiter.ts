import rateLimit from "express-rate-limit";
import { db } from "../../db/index";
import { emailLogs } from "../../db/schema";
import { eq, gte, and } from "drizzle-orm";
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth";

// Limit repeated requests from same IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many authentication attempts, please try again later." },
  skipSuccessfulRequests: true
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: "Upload limit reached. Please try again later." }
});

// Stronger rate limiting for public card endpoints
export const publicCardLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  message: { error: "Too many card views, please try again later." }
});

// Per-user email rate limiting (prevents email abuse)
export async function perUserEmailRateLimit(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const userId = req.user.id;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Count emails sent by this user in the last hour
    const recentEmails = await db
      .select()
      .from(emailLogs)
      .where(
        and(
          eq(emailLogs.metadata, `%"userId":"${userId}"%`),
          gte(emailLogs.createdAt, oneHourAgo)
        )
      );

    const emailCount = recentEmails.length;

    // Allow max 20 emails per hour per user
    if (emailCount >= 20) {
      return res.status(429).json({
        error: "Email rate limit exceeded",
        message: "You have sent too many emails. Please try again later.",
        retryAfter: 3600
      });
    }

    next();
  } catch (error) {
    console.error("Error checking email rate limit:", error);
    // On error, allow the request (fail open)
    next();
  }
}
