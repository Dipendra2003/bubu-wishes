import { cleanupExpiredTokens } from "../lib/tokenManager";
import { logger } from "../lib/logger";

let cleanupInterval: NodeJS.Timeout | null = null;

/**
 * Start periodic cleanup of expired refresh tokens
 * Runs every 6 hours
 */
export function startTokenCleanup() {
  if (cleanupInterval) {
    logger.warn('Token cleanup already running');
    return;
  }

  // Run immediately on startup
  cleanupExpiredTokens().then(count => {
    logger.info('Token cleanup service started', { cleanedTokens: count });
  });

  // Then run every 6 hours
  cleanupInterval = setInterval(async () => {
    try {
      const count = await cleanupExpiredTokens();
      if (count > 0) {
        logger.info('Cleaned up expired refresh tokens', { count });
      }
    } catch (error) {
      logger.error('Token cleanup error', error as Error);
    }
  }, 6 * 60 * 60 * 1000); // 6 hours

  logger.info('Token cleanup scheduler initialized', { intervalHours: 6 });
}

/**
 * Stop token cleanup service
 */
export function stopTokenCleanup() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    logger.info('Token cleanup service stopped');
  }
}
