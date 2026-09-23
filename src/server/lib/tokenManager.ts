import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import { db } from "../../db/index";
import { refreshTokens } from "../../db/schema";
import { eq, and, gte, lte, isNull } from "drizzle-orm";
import { Request } from "express";

const JWT_SECRET = process.env.JWT_SECRET!;
const ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived access token
const REFRESH_TOKEN_EXPIRY_DAYS = 30; // Long-lived refresh token

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface SessionInfo {
  id: string;
  deviceInfo: string | null;
  ipAddress: string | null;
  lastActiveAt: Date | null;
  createdAt: Date;
  isCurrent?: boolean;
}

/**
 * Parse user-agent string into a human-readable device description
 */
function parseDeviceInfo(userAgent: string | undefined): string {
  if (!userAgent) return 'Unknown Device';

  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  // Detect browser
  if (userAgent.includes('Edg/')) browser = 'Edge';
  else if (userAgent.includes('OPR/') || userAgent.includes('Opera')) browser = 'Opera';
  else if (userAgent.includes('Chrome/')) browser = 'Chrome';
  else if (userAgent.includes('Firefox/')) browser = 'Firefox';
  else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) browser = 'Safari';

  // Detect OS
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac OS')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

  return `${browser} on ${os}`;
}

/**
 * Extract client IP address from request
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',');
    return ips[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

/**
 * Generate access and refresh tokens for a user
 */
export async function generateTokenPair(
  userId: string,
  req?: Request
): Promise<TokenPair> {
  // Generate short-lived access token
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });

  // Generate long-lived refresh token (random string)
  const refreshToken = randomBytes(64).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  // Extract device info from request
  const deviceInfo = req ? parseDeviceInfo(req.headers['user-agent']) : null;
  const ipAddress = req ? getClientIp(req) : null;

  // Store refresh token in database with session info
  await db.insert(refreshTokens).values({
    userId,
    token: refreshToken,
    expiresAt,
    deviceInfo,
    ipAddress,
    lastActiveAt: new Date(),
  });

  return { accessToken, refreshToken };
}

/**
 * Verify and rotate refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
  req?: Request
): Promise<TokenPair | null> {
  try {
    // Find refresh token in database
    const tokens = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.token, refreshToken),
          gte(refreshTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (tokens.length === 0 || tokens[0].revokedAt) {
      return null; // Token not found, expired, or revoked
    }

    const tokenRecord = tokens[0];

    // Revoke old refresh token (rotation)
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, tokenRecord.id));

    // Generate new token pair (inherits session info from request or original)
    const newPair = await generateTokenPair(tokenRecord.userId, req);

    return newPair;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

/**
 * Revoke a specific refresh token
 */
export async function revokeRefreshToken(token: string): Promise<boolean> {
  try {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.token, token));

    return true;
  } catch (error) {
    console.error('Error revoking token:', error);
    return false;
  }
}

/**
 * Revoke all refresh tokens for a user
 */
export async function revokeAllUserTokens(userId: string): Promise<boolean> {
  try {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(refreshTokens.userId, userId),
          isNull(refreshTokens.revokedAt)
        )
      );

    return true;
  } catch (error) {
    console.error('Error revoking all tokens:', error);
    return false;
  }
}

/**
 * Revoke a specific session by token ID (with ownership check)
 */
export async function revokeSession(tokenId: string, userId: string): Promise<boolean> {
  try {
    const tokens = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.id, tokenId),
          eq(refreshTokens.userId, userId),
          isNull(refreshTokens.revokedAt)
        )
      )
      .limit(1);

    if (tokens.length === 0) {
      return false;
    }

    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, tokenId));

    return true;
  } catch (error) {
    console.error('Error revoking session:', error);
    return false;
  }
}

/**
 * Get active sessions for a user
 */
export async function getActiveSessions(
  userId: string,
  currentRefreshToken?: string
): Promise<SessionInfo[]> {
  try {
    const sessions = await db
      .select({
        id: refreshTokens.id,
        token: refreshTokens.token,
        deviceInfo: refreshTokens.deviceInfo,
        ipAddress: refreshTokens.ipAddress,
        lastActiveAt: refreshTokens.lastActiveAt,
        createdAt: refreshTokens.createdAt,
      })
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.userId, userId),
          isNull(refreshTokens.revokedAt),
          gte(refreshTokens.expiresAt, new Date())
        )
      )
      .orderBy(refreshTokens.lastActiveAt);

    return sessions.map(s => ({
      id: s.id,
      deviceInfo: s.deviceInfo,
      ipAddress: s.ipAddress,
      lastActiveAt: s.lastActiveAt,
      createdAt: s.createdAt,
      isCurrent: currentRefreshToken ? s.token === currentRefreshToken : false,
    }));
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    return [];
  }
}

/**
 * Clean up expired tokens (run periodically)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  try {
    const result = await db
      .delete(refreshTokens)
      .where(lte(refreshTokens.expiresAt, new Date()));

    return result.rowCount || 0;
  } catch (error) {
    console.error('Error cleaning up tokens:', error);
    return 0;
  }
}
