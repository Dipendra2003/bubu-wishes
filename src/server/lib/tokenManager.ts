import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import { db } from "../../db/index";
import { refreshTokens } from "../../db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET!;
const ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived access token
const REFRESH_TOKEN_EXPIRY_DAYS = 30; // Long-lived refresh token

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate access and refresh tokens for a user
 */
export async function generateTokenPair(userId: string): Promise<TokenPair> {
  // Generate short-lived access token
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });

  // Generate long-lived refresh token (random string)
  const refreshToken = randomBytes(64).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  // Store refresh token in database
  await db.insert(refreshTokens).values({
    userId,
    token: refreshToken,
    expiresAt,
  });

  return { accessToken, refreshToken };
}

/**
 * Verify and rotate refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenPair | null> {
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

    // Generate new token pair
    return await generateTokenPair(tokenRecord.userId);
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
    const result = await db
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
      .where(eq(refreshTokens.userId, userId));

    return true;
  } catch (error) {
    console.error('Error revoking all tokens:', error);
    return false;
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

    console.log(`Cleaned up expired refresh tokens`);
    return result.rowCount || 0;
  } catch (error) {
    console.error('Error cleaning up tokens:', error);
    return 0;
  }
}
