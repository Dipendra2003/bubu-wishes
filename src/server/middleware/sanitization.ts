import { Request, Response, NextFunction } from "express";

/**
 * Sanitize string input to prevent XSS and injection attacks
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .slice(0, 10000); // Limit length
}

/**
 * Sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  
  const sanitized = email.trim().toLowerCase();
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  
  return sanitized.slice(0, 254); // RFC 5321 max length
}

/**
 * Sanitize URL inputs
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') return '';
  
  const sanitized = url.trim();
  
  // Only allow http/https URLs
  if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
    throw new Error('Invalid URL protocol');
  }
  
  return sanitized.slice(0, 2048);
}

/**
 * Sanitize numeric inputs
 */
export function sanitizeNumber(input: any, min?: number, max?: number): number {
  const num = Number(input);
  
  if (isNaN(num) || !isFinite(num)) {
    throw new Error('Invalid number');
  }
  
  if (min !== undefined && num < min) {
    throw new Error(`Number must be at least ${min}`);
  }
  
  if (max !== undefined && num > max) {
    throw new Error(`Number must be at most ${max}`);
  }
  
  return num;
}

/**
 * Middleware to sanitize request body
 */
export function sanitizeRequestBody(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    try {
      sanitizeObject(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        error: 'Invalid input data',
        message: error instanceof Error ? error.message : 'Validation failed'
      });
    }
  } else {
    next();
  }
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: any, depth: number = 0): void {
  // Prevent deep recursion attacks
  if (depth > 10) {
    throw new Error('Object nesting too deep');
  }
  
  // Limit object size
  const keys = Object.keys(obj);
  if (keys.length > 100) {
    throw new Error('Too many object properties');
  }
  
  for (const key of keys) {
    const value = obj[key];
    
    if (typeof value === 'string') {
      // Sanitize strings (but allow reasonable HTML for card messages)
      obj[key] = value.trim().slice(0, 10000);
    } else if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        // Limit array size
        if (value.length > 1000) {
          throw new Error('Array too large');
        }
        value.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            sanitizeObject(item, depth + 1);
          } else if (typeof item === 'string') {
            value[index] = item.trim().slice(0, 10000);
          }
        });
      } else {
        sanitizeObject(value, depth + 1);
      }
    }
  }
}

/**
 * Validate UUID format
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitize and validate pagination parameters
 */
export function sanitizePagination(req: Request): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}
