import { logger } from "../lib/logger";

interface GoogleTokenPayload {
  sub: string;       // Google user ID
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
  iss: string;       // Issuer
  aud: string;       // Client ID
  exp: number;       // Expiration
}

/**
 * Verify a Google ID token server-side using Google's tokeninfo endpoint.
 * This is the secure approach — never trust frontend-provided email values.
 * 
 * For higher throughput, consider using google-auth-library for local JWT verification.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleTokenPayload | null> {
  const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    logger.error('VITE_GOOGLE_CLIENT_ID not configured');
    return null;
  }

  try {
    // Verify the token with Google's API
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    );

    if (!response.ok) {
      logger.warn('Google token verification failed', { status: response.status });
      return null;
    }

    const payload = await response.json() as GoogleTokenPayload;

    // Verify the token was issued for our application
    if (payload.aud !== clientId) {
      logger.warn('Google token audience mismatch', { 
        expected: clientId, 
        received: payload.aud 
      });
      return null;
    }

    // Verify the issuer
    if (payload.iss !== 'accounts.google.com' && payload.iss !== 'https://accounts.google.com') {
      logger.warn('Google token issuer mismatch', { issuer: payload.iss });
      return null;
    }

    // Verify the token is not expired
    if (payload.exp * 1000 < Date.now()) {
      logger.warn('Google token expired');
      return null;
    }

    // Verify email is verified by Google
    if (!payload.email_verified) {
      logger.warn('Google email not verified', { email: payload.email });
      return null;
    }

    return payload;
  } catch (error) {
    logger.error('Google token verification error', error as Error);
    return null;
  }
}
