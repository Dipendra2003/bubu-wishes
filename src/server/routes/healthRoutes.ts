import express from "express";
import { pool } from "../../db/index";
import { connection as redisConnection } from "../queues/emailQueue";
import { emailWorker } from "../workers/emailWorker";
import { birthdayWorker } from "../workers/birthdayWorker";
import { birthdayReminderQueue } from "../services/schedulerService";

export const healthRouter = express.Router();

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
      poolStats?: {
        total: number;
        idle: number;
        waiting: number;
      };
    };
    redis: {
      status: 'healthy' | 'unhealthy' | 'not_configured';
      responseTime?: number;
      error?: string;
    };
    workers: {
      emailWorker: 'running' | 'stopped' | 'not_configured';
      birthdayWorker: 'running' | 'stopped' | 'not_configured';
    };
    queues: {
      emailQueue: {
        status: 'healthy' | 'unhealthy' | 'not_configured';
        waiting?: number;
        active?: number;
        failed?: number;
        error?: string;
      };
      birthdayQueue: {
        status: 'healthy' | 'unhealthy' | 'not_configured';
        waiting?: number;
        active?: number;
        failed?: number;
        error?: string;
      };
    };
  };
  version: string;
  environment: string;
}

// Comprehensive health check endpoint
healthRouter.get("/health", async (req, res) => {
  const startTime = Date.now();
  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: { status: 'healthy' },
      redis: { status: 'not_configured' },
      workers: {
        emailWorker: 'not_configured',
        birthdayWorker: 'not_configured'
      },
      queues: {
        emailQueue: { status: 'not_configured' },
        birthdayQueue: { status: 'not_configured' }
      }
    },
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };

  // Check database
  try {
    const dbStart = Date.now();
    await pool.query('SELECT 1');
    result.checks.database.responseTime = Date.now() - dbStart;
    result.checks.database.poolStats = {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount
    };
  } catch (error) {
    result.checks.database.status = 'unhealthy';
    result.checks.database.error = error instanceof Error ? error.message : 'Unknown error';
    result.status = 'unhealthy';
  }

  // Check Redis
  if (redisConnection) {
    try {
      const redisStart = Date.now();
      await redisConnection.ping();
      result.checks.redis.status = 'healthy';
      result.checks.redis.responseTime = Date.now() - redisStart;
    } catch (error) {
      result.checks.redis.status = 'unhealthy';
      result.checks.redis.error = error instanceof Error ? error.message : 'Unknown error';
      result.status = 'degraded';
    }
  }

  // Check workers
  if (emailWorker) {
    result.checks.workers.emailWorker = emailWorker.isRunning() ? 'running' : 'stopped';
    if (!emailWorker.isRunning()) {
      result.status = result.status === 'healthy' ? 'degraded' : result.status;
    }
  }

  if (birthdayWorker) {
    result.checks.workers.birthdayWorker = birthdayWorker.isRunning() ? 'running' : 'stopped';
    if (!birthdayWorker.isRunning()) {
      result.status = result.status === 'healthy' ? 'degraded' : result.status;
    }
  }

  // Check queues
  if (birthdayReminderQueue) {
    try {
      const [waiting, active, failed] = await Promise.all([
        birthdayReminderQueue.getWaitingCount(),
        birthdayReminderQueue.getActiveCount(),
        birthdayReminderQueue.getFailedCount()
      ]);

      result.checks.queues.birthdayQueue = {
        status: 'healthy',
        waiting,
        active,
        failed
      };

      // Warn if too many failed jobs
      if (failed > 50) {
        result.checks.queues.birthdayQueue.status = 'unhealthy';
        result.status = 'degraded';
      }
    } catch (error) {
      result.checks.queues.birthdayQueue = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      result.status = 'degraded';
    }
  }

  // Set HTTP status based on health
  const statusCode = result.status === 'healthy' ? 200 : 
                     result.status === 'degraded' ? 200 : 503;

  res.status(statusCode).json(result);
});

// Simple liveness probe (for K8s, Docker, etc.)
healthRouter.get("/health/live", (req, res) => {
  res.status(200).json({ 
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

// Readiness probe (checks if app is ready to receive traffic)
healthRouter.get("/health/ready", async (req, res) => {
  try {
    // Check database connectivity
    await pool.query('SELECT 1');
    
    res.status(200).json({ 
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'not_ready',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});
