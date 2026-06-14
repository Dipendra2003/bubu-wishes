import { Request, Response, NextFunction } from "express";
import { randomBytes, createHash } from "crypto";

/**
 * Simple double-submit cookie CSRF protection
 * More modern and lightweight than deprecated csurf package
 */

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a cryptographically secure CSRF token
 */
function generateCsrfToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Middleware to set CSRF token cookie
 */
export function csrfTokenGenerator(req: Request, res: Response, next: NextFunction) {
  // Check if CSRF token already exists
  let csrfToken = req.cookies?.[CSRF_COOKIE_NAME];
  
  if (!csrfToken) {
    csrfToken = generateCsrfToken();
    
    res.cookie(CSRF_COOKIE_NAME, csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
  }
  
  // Make token available to routes that need to send it to client
  (req as any).csrfToken = csrfToken;
  
  next();
}

/**
 * Middleware to verify CSRF token on state-changing requests
 * Uses double-submit cookie pattern
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF check for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME] as string;
  
  // Both tokens must exist
  if (!cookieToken || !headerToken) {
    return res.status(403).json({ 
      error: 'CSRF token missing',
      code: 'CSRF_MISSING' 
    });
  }
  
  // Tokens must match (constant-time comparison)
  const cookieHash = createHash('sha256').update(cookieToken).digest('hex');
  const headerHash = createHash('sha256').update(headerToken).digest('hex');
  
  if (cookieHash !== headerHash) {
    return res.status(403).json({ 
      error: 'CSRF token invalid',
      code: 'CSRF_INVALID' 
    });
  }
  
  next();
}

/**
 * Get CSRF token endpoint - allows frontend to retrieve token
 */
export function getCsrfToken(req: Request, res: Response) {
  const token = (req as any).csrfToken;
  res.json({ csrfToken: token });
}
