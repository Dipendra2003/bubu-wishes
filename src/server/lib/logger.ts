import { randomUUID } from 'crypto';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

interface LogContext {
  requestId?: string;
  userId?: string;
  action?: string;
  [key: string]: any;
}

class Logger {
  private serviceName: string;
  private environment: string;

  constructor() {
    this.serviceName = 'bubu-dudu-birthday-cards';
    this.environment = process.env.NODE_ENV || 'development';
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      service: this.serviceName,
      environment: this.environment,
      message,
      ...context,
    };

    // In production, this could send to logging service (DataDog, Loggly, etc.)
    return JSON.stringify(logEntry);
  }

  debug(message: string, context?: LogContext) {
    if (this.environment === 'development') {
      console.log(this.formatLog('debug', message, context));
    }
  }

  info(message: string, context?: LogContext) {
    console.log(this.formatLog('info', message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatLog('warn', message, context));
  }

  error(message: string, error?: Error, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : undefined,
    };
    console.error(this.formatLog('error', message, errorContext));
  }

  critical(message: string, error?: Error, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : undefined,
    };
    console.error(this.formatLog('critical', message, errorContext));
    
    // In production, send alerts (PagerDuty, Slack, etc.)
    if (this.environment === 'production') {
      // TODO: Integrate with alerting service
    }
  }

  // Generate unique request ID for tracking
  static generateRequestId(): string {
    return randomUUID();
  }
}

export const logger = new Logger();

// Express middleware to add request IDs
export function requestIdMiddleware(req: any, res: any, next: any) {
  req.requestId = Logger.generateRequestId();
  res.setHeader('X-Request-ID', req.requestId);
  next();
}

// Express middleware for request logging
export function requestLoggerMiddleware(req: any, res: any, next: any) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id,
    });
  });
  
  next();
}
