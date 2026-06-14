import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { db } from "./src/db/index";
import { sql } from "drizzle-orm";
import { apiRouter } from "./src/server/routes/index";
import "./src/server/workers/emailWorker";
import "./src/server/workers/birthdayWorker";
import { initializeBirthdayScheduler, shutdownScheduler } from "./src/server/services/schedulerService";
import { startTokenCleanup, stopTokenCleanup } from "./src/server/services/tokenCleanupService";
import { emailWorker } from "./src/server/workers/emailWorker";
import { birthdayWorker } from "./src/server/workers/birthdayWorker";
import { Server } from "http";
import { requestIdMiddleware, requestLoggerMiddleware, logger } from "./src/server/lib/logger";
import { sanitizeRequestBody } from "./src/server/middleware/sanitization";
import { csrfTokenGenerator, csrfProtection, getCsrfToken } from "./src/server/middleware/csrf";

// Store server instance for graceful shutdown
let httpServer: Server | null = null;

async function startServer() {
  const app = express();
  app.set("trust proxy", 1);
  const PORT = 3000;

  // Request ID and logging middleware (before everything)
  app.use(requestIdMiddleware);
  app.use(requestLoggerMiddleware);

  // Use global security middleware with proper CSP
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'", 
          "'unsafe-inline'", // unsafe-inline needed for Vite in dev
        ],
        styleSrc: [
          "'self'", 
          "'unsafe-inline'",
        ],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        fontSrc: ["'self'", "data:"],
        connectSrc: [
          "'self'",
          "ws://localhost:*", // WebSocket for dev tools
          "wss://localhost:*", // Secure WebSocket for dev tools
        ],
        mediaSrc: ["'self'", "https:"],
        objectSrc: ["'none'"],
        frameSrc: [
          "'self'",
        ],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      }
    },
    crossOriginEmbedderPolicy: false, // Allow external media
  }));
  
  // Request timeout middleware (30 seconds)
  app.use((req, res, next) => {
    req.setTimeout(30000, () => {
      res.status(408).json({ error: 'Request timeout' });
    });
    res.setTimeout(30000, () => {
      res.status(408).json({ error: 'Response timeout' });
    });
    next();
  });
  
  // Cookie parser (must come before CSRF)
  app.use(cookieParser());

  // Enforce rigid request constraints
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));
  
  // Sanitize request body inputs
  app.use(sanitizeRequestBody);

  // CSRF token generator (all routes)
  app.use(csrfTokenGenerator);

  // CSRF token endpoint (allow GET without protection)
  app.get("/api/csrf-token", getCsrfToken);

  // CSRF protection for all API routes except safe methods
  app.use("/api", csrfProtection);

  // Attempt to update schema safely
  try {
    await db.execute(sql`ALTER TABLE "cards" ADD COLUMN IF NOT EXISTS "id" uuid PRIMARY KEY DEFAULT gen_random_uuid();`);
    await db.execute(sql`ALTER TABLE "cards" ADD COLUMN IF NOT EXISTS "card_data" text;`);
    await db.execute(sql`ALTER TABLE "cards" ADD COLUMN IF NOT EXISTS "image_url" text;`);
    await db.execute(sql`ALTER TABLE "cards" ADD COLUMN IF NOT EXISTS "audio_url" text;`);
    await db.execute(sql`ALTER TABLE "cards" ADD COLUMN IF NOT EXISTS "public_id" text;`);
    await db.execute(sql`ALTER TABLE "cards" ADD COLUMN IF NOT EXISTS "media_type" text;`);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "contacts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
        "name" text NOT NULL,
        "birthday" timestamp NOT NULL,
        "email" text,
        "created_at" timestamp NOT NULL DEFAULT now()
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "reviews" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
        "rating" text NOT NULL,
        "comment" text NOT NULL,
        "featured" boolean NOT NULL DEFAULT false,
        "created_at" timestamp NOT NULL DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "media_library" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
        "media_type" text NOT NULL,
        "media_url" text NOT NULL,
        "public_id" text,
        "file_name" text,
        "file_size" text,
        "mime_type" text,
        "thumbnail" text,
        "duration" text,
        "usage_count" text DEFAULT '0',
        "last_used_at" timestamp,
        "created_at" timestamp NOT NULL DEFAULT now()
      );
    `);

    // Add profile fields to users table
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" text;`);
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bio" text;`);
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" text;`);
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "birthday" timestamp;`);
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "location" text;`);
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "timezone" text;`);

    // Add auth improvement fields to users table
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "google_id" text;`);
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "login_attempts" text DEFAULT '0';`);
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "locked_until" timestamp;`);

    // Create reminder system tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "user_preferences" (
        "user_id" uuid PRIMARY KEY REFERENCES "users"("id") ON DELETE CASCADE,
        "email_reminders" boolean NOT NULL DEFAULT true,
        "reminder_days" text NOT NULL DEFAULT '1,3,7',
        "reminder_time" text NOT NULL DEFAULT '08:00',
        "birthday_wish_email" boolean NOT NULL DEFAULT true,
        "timezone" text NOT NULL DEFAULT 'UTC',
        "updated_at" timestamp NOT NULL DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "reminder_history" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "contact_id" uuid NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
        "reminder_type" text NOT NULL,
        "sent_at" timestamp NOT NULL DEFAULT now(),
        "email_sent" boolean NOT NULL DEFAULT true,
        "email_status" text NOT NULL DEFAULT 'sent',
        "error_message" text,
        "contact_birthday" timestamp NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "email_logs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "recipient_email" text NOT NULL,
        "subject" text NOT NULL,
        "email_type" text NOT NULL,
        "status" text NOT NULL DEFAULT 'queued',
        "sent_at" timestamp,
        "failed_at" timestamp,
        "error_message" text,
        "retry_count" text NOT NULL DEFAULT '0',
        "metadata" text,
        "created_at" timestamp NOT NULL DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "card_share_tokens" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "card_id" uuid NOT NULL REFERENCES "cards"("id") ON DELETE CASCADE,
        "share_token" text NOT NULL UNIQUE,
        "view_count" text NOT NULL DEFAULT '0',
        "last_viewed_at" timestamp,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "expires_at" timestamp
      );
    `);

    // Create auth improvement tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "refresh_tokens" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "token" text NOT NULL UNIQUE,
        "expires_at" timestamp NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "revoked_at" timestamp
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "activity_logs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "action" text NOT NULL,
        "ip_address" text,
        "user_agent" text,
        "metadata" text,
        "created_at" timestamp NOT NULL DEFAULT now()
      );
    `);

    // Create performance indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_contacts_birthday" ON "contacts"("birthday");`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_contacts_user_id" ON "contacts"("user_id");`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_cards_creator_id" ON "cards"("creator_id");`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_reminder_history_user_id" ON "reminder_history"("user_id");`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_reminder_history_contact_id" ON "reminder_history"("contact_id");`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_email_logs_status" ON "email_logs"("status");`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_card_share_tokens_token" ON "card_share_tokens"("share_token");`);

    // Seed featured reviews for demo
    try {
      const usersData: any = await db.execute(sql`SELECT id FROM users LIMIT 1`);
      if (usersData && usersData.length > 0) {
        const adminId = usersData[0].id;
        const existingReviews: any = await db.execute(sql`SELECT count(*) FROM reviews`);
        if (existingReviews && existingReviews[0].count === '0') {
           await db.execute(sql`
             INSERT INTO reviews (user_id, rating, comment, featured) VALUES 
             (${adminId}, '5', 'Such a cute and magical way to send a greeting! The puzzle lock was a huge hit with my partner.', true),
             (${adminId}, '5', 'The memory timeline feature let me create a beautiful anniversary card. So much better than a paper card!', true),
             (${adminId}, '5', 'I love the little floating Bubu & Dudu animations. Easy to use and the custom voice note was perfect.', true)
           `);
           logger.debug('Seeded basic reviews');
        }
      }
    } catch (e) {
      // Ignore seed errors if no users exist yet
      logger.debug('Skipping review seeding - no users exist');
    }
  } catch (err: any) {
    // Ignore schema check errors
    logger.debug('Schema update skipped or already applied');
  }

  // Use centralized API router
  app.use("/api", apiRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // Fallback for all non-API routes in development (SPA support)
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        // Read and transform index.html
        let template = await vite.transformIndexHtml(url, 
          await (await import('fs')).promises.readFile(
            path.resolve(__dirname, 'index.html'),
            'utf-8'
          )
        );
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // Fallback for all routes in production (SPA support)
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer = app.listen(PORT, "0.0.0.0", async () => {
    logger.info('Server started', { port: PORT, url: `http://localhost:${PORT}` });
    
    // Initialize birthday reminder scheduler
    try {
      await initializeBirthdayScheduler();
    } catch (error) {
      logger.error('Failed to initialize birthday scheduler', error as Error);
    }

    // Start token cleanup service
    startTokenCleanup();
  });

  // Graceful shutdown handler
  async function gracefulShutdown(signal: string) {
    logger.info('Graceful shutdown initiated', { signal });
    
    let exitCode = 0;
    
    try {
      // Step 1: Stop accepting new HTTP connections
      if (httpServer) {
        logger.info('Closing HTTP server - stopping new connections');
        await new Promise<void>((resolve, reject) => {
          httpServer!.close((err) => {
            if (err) {
              logger.error('Error closing HTTP server', err);
              reject(err);
            } else {
              logger.info('HTTP server closed');
              resolve();
            }
          });
        });
      }
      
      // Step 2: Close scheduler (stop creating new jobs)
      logger.info('Shutting down birthday scheduler');
      await shutdownScheduler();
      logger.info('Birthday scheduler closed');

      // Stop token cleanup service
      logger.info('Shutting down token cleanup service');
      stopTokenCleanup();
      logger.info('Token cleanup service closed');
      
      // Step 3: Wait for workers to finish current jobs
      const workerClosePromises: Promise<void>[] = [];
      
      if (emailWorker) {
        logger.info('Waiting for email worker to finish current jobs');
        workerClosePromises.push(
          emailWorker.close().then(() => {
            logger.info('Email worker closed gracefully');
          })
        );
      }
      
      if (birthdayWorker) {
        logger.info('Waiting for birthday worker to finish current jobs');
        workerClosePromises.push(
          birthdayWorker.close().then(() => {
            logger.info('Birthday worker closed gracefully');
          })
        );
      }
      
      // Wait max 30 seconds for workers to finish
      await Promise.race([
        Promise.all(workerClosePromises),
        new Promise((resolve) => setTimeout(() => {
          logger.warn('Worker shutdown timeout - forcing exit', { timeoutSeconds: 30 });
          resolve(undefined);
        }, 30000))
      ]);
      
      // Step 4: Close database connection pool
      logger.info('Closing database connection pool');
      const { pool } = await import('./src/db/index');
      await pool.end();
      logger.info('Database connections closed');
      
      logger.info('Graceful shutdown complete');
    } catch (error) {
      logger.error('Error during graceful shutdown', error as Error);
      exitCode = 1;
    }
    
    process.exit(exitCode);
  }

  // Graceful shutdown on SIGTERM (deployment/orchestration)
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  // Graceful shutdown on SIGINT (Ctrl+C)
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

// Global error handlers - MUST be before startServer()
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.critical('Unhandled Promise Rejection', reason, { promise: promise.toString() });
  // Log to error tracking service in production
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to Sentry/error tracking
  }
  // Don't exit - log and continue (prevents crashes)
});

process.on('uncaughtException', (error: Error) => {
  logger.critical('Uncaught Exception - shutting down', error);
  // Uncaught exceptions are more serious - should exit
  process.exit(1);
});

// Environment validation
function validateEnv() {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS',
    'CRON_SECRET',
    'APP_URL'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    logger.critical('Missing required environment variables', undefined, { missing });
    console.error('Server cannot start without these variables');
    console.error('Please check .env file and ensure all required variables are set');
    process.exit(1);
  }
  
  // Validate JWT_SECRET is not default/weak
  const weakSecrets = ['super-secret-fallback-key-2024', 'secret', 'password', 'changeme'];
  if (weakSecrets.includes(process.env.JWT_SECRET || '')) {
    logger.critical('JWT_SECRET must be changed from default/weak value');
    console.error('Generate a strong secret: openssl rand -base64 32');
    process.exit(1);
  }
  
  if ((process.env.JWT_SECRET || '').length < 32) {
    logger.critical('JWT_SECRET must be at least 32 characters long');
    process.exit(1);
  }
  
  // Validate CRON_SECRET is strong
  if ((process.env.CRON_SECRET || '').length < 32) {
    logger.critical('CRON_SECRET must be at least 32 characters long');
    console.error('Generate a strong secret: openssl rand -base64 32');
    process.exit(1);
  }
  
  // Validate DATABASE_URL format
  if (!process.env.DATABASE_URL?.startsWith('postgres://') && 
      !process.env.DATABASE_URL?.startsWith('postgresql://')) {
    logger.critical('DATABASE_URL must be a valid PostgreSQL connection string');
    process.exit(1);
  }
  
  // Warn if Redis not configured (not critical, but important)
  if (!process.env.REDIS_URL || process.env.REDIS_URL.includes('localhost')) {
    logger.warn('REDIS_URL not configured or using localhost');
    logger.warn('Birthday reminders will require manual triggering');
    logger.warn('Email queue will not be available');
  }
  
  // Validate SMTP port is numeric
  if (process.env.SMTP_PORT && isNaN(parseInt(process.env.SMTP_PORT))) {
    logger.critical('SMTP_PORT must be a number');
    process.exit(1);
  }
  
  logger.info('Environment validation passed');
}

validateEnv();
startServer();
