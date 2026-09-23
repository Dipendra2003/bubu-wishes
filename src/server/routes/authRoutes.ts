import express from "express";
import { db } from "../../db/index";
import { users, verificationCodes } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { authenticate } from "../middleware/auth";
import { sendEmail, getVerificationEmailHtml, getPasswordResetEmailHtml, getWelcomeEmailHtml } from "../services/emailService";
import { authLimiter } from "../middleware/rateLimiter";
import { validatePassword } from "../lib/passwordValidation";
import { generateTokenPair, refreshAccessToken, revokeRefreshToken, revokeAllUserTokens, getActiveSessions, revokeSession } from "../lib/tokenManager";
import { logActivity, isNewLoginLocation } from "../lib/activityLogger";
import { verifyGoogleIdToken } from "../services/oauthService";
import crypto from "crypto";

export const authRouter = express.Router();

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes
const BCRYPT_COST = 12; // Increased for better security

const generateOTP = async (userId: string, purpose: 'verification' | 'reset_password') => {
  const code = crypto.randomInt(100000, 1000000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry
  
  await db.delete(verificationCodes).where(and(eq(verificationCodes.userId, userId), eq(verificationCodes.purpose, purpose)));
  
  await db.insert(verificationCodes).values({
    userId,
    code,
    expiresAt,
    purpose,
  });
  return code;
};

authRouter.use("/signup", authLimiter);
authRouter.use("/login", authLimiter);
authRouter.use("/google", authLimiter);

// Signup with stronger password validation
authRouter.post("/signup", async (req: any, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters long" });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: "Please provide a valid email address" });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        error: "Password does not meet requirements",
        details: passwordValidation.errors
      });
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Email already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_COST);
    
    const newUsers = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: "client",
    }).returning();
    const newUser = newUsers[0];
    
    const otp = await generateOTP(newUser.id, 'verification');
    await sendEmail(
      newUser.email, 
      "✨ Verify Your BubuWish Account", 
      getVerificationEmailHtml(otp, name)
    );
    
    res.json({ 
      success: true,
      message: "Account created! Please check your email to verify your account.",
      email: newUser.email
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not create account" });
  }
});

// Login with brute-force protection and suspicious login detection
authRouter.post("/login", async (req: any, res) => {
  try {
    const { email, password } = req.body;
    const userRecords = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = userRecords[0];
    
    // Check if account has password (could be OAuth only)
    if (!user || !user.password) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    if (user.suspended) {
      return res.status(403).json({ error: "Your account has been suspended" });
    }

    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const remainingTime = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 60000);
      return res.status(429).json({ 
        error: `Account temporarily locked. Please try again in ${remainingTime} minute(s)`,
        lockedUntil: user.lockedUntil
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const attempts = parseInt(user.loginAttempts || '0') + 1;
      
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        const lockedUntil = new Date(Date.now() + LOCK_TIME);
        await db.update(users)
          .set({ loginAttempts: attempts.toString(), lockedUntil })
          .where(eq(users.id, user.id));
        
        await logActivity(user.id, 'account_locked', req);
        
        return res.status(429).json({ 
          error: "Too many failed attempts. Account locked for 15 minutes.",
          lockedUntil
        });
      }
      
      await db.update(users)
        .set({ loginAttempts: attempts.toString() })
        .where(eq(users.id, user.id));
      
      await logActivity(user.id, 'failed_login', req);
      
      return res.status(400).json({ 
        error: "Invalid credentials",
        attemptsRemaining: MAX_LOGIN_ATTEMPTS - attempts
      });
    }

    if (!user.verified) {
      return res.status(403).json({ 
        error: "Please verify your email before logging in",
        verified: false,
        email: user.email
      });
    }

    await db.update(users)
      .set({ loginAttempts: '0', lockedUntil: null })
      .where(eq(users.id, user.id));

    // Suspicious login detection
    const currentIp = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
    const isNewLocation = await isNewLoginLocation(user.id, currentIp);
    
    if (isNewLocation) {
      await logActivity(user.id, 'suspicious_login', req, { message: 'Login from new IP address' });
      // In a real system, you might send an email alert here
    }

    // Generate tokens, pass req for device info
    const { accessToken, refreshToken } = await generateTokenPair(user.id, req);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/',
    });

    await logActivity(user.id, 'login', req);
    
    res.json({ 
      accessToken,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        verified: user.verified,
        avatarUrl: user.avatarUrl
      } 
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Login failed" });
  }
});

// Google OAuth Login / Signup
authRouter.post("/google", async (req: any, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ error: "Google credential is required" });
    }

    // Verify token server-side
    const payload = await verifyGoogleIdToken(credential);
    if (!payload) {
      await logActivity('unknown', 'google_auth_failed', req);
      return res.status(401).json({ error: "Invalid Google token" });
    }

    const { sub: googleId, email, name, picture, email_verified } = payload;

    // Check if user exists by oauth details
    let userRecords = await db.select().from(users).where(
      and(eq(users.oauthProvider, 'google'), eq(users.oauthId, googleId))
    ).limit(1);

    let user = userRecords[0];

    // If no exact OAuth match, check by email
    if (!user) {
      const emailMatch = await db.select().from(users).where(eq(users.email, email)).limit(1);
      
      if (emailMatch.length > 0) {
        user = emailMatch[0];
        
        // Security check: only link if the existing account is verified
        if (!user.verified) {
          await logActivity(user.id, 'google_link_failed', req, { reason: 'unverified_existing_account' });
          return res.status(403).json({ error: "An unverified account exists with this email. Please verify it first or use password login." });
        }

        // Link the account
        await db.update(users).set({
          oauthProvider: 'google',
          oauthId: googleId,
          avatarUrl: user.avatarUrl || picture, // update avatar if missing
        }).where(eq(users.id, user.id));

        await logActivity(user.id, 'google_account_linked', req);
      } else {
        // Create new account
        const newUsers = await db.insert(users).values({
          name,
          email,
          role: "client",
          verified: true, // Google verified the email
          oauthProvider: 'google',
          oauthId: googleId,
          avatarUrl: picture,
          // password is left null
        }).returning();
        user = newUsers[0];

        await sendEmail(
          user.email,
          "🎉 Welcome to BubuWish!",
          getWelcomeEmailHtml(user.name)
        );
        await logActivity(user.id, 'google_signup', req);
      }
    } else {
      await logActivity(user.id, 'google_login', req);
    }

    // Suspicious login detection
    const currentIp = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
    const isNewLocation = await isNewLoginLocation(user.id, currentIp);
    if (isNewLocation) {
      await logActivity(user.id, 'suspicious_login', req, { message: 'Google login from new IP address' });
    }

    // Reset lockouts if any
    if (user.loginAttempts !== '0' || user.lockedUntil) {
      await db.update(users).set({ loginAttempts: '0', lockedUntil: null }).where(eq(users.id, user.id));
    }

    const { accessToken, refreshToken } = await generateTokenPair(user.id, req);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.json({ 
      accessToken,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        verified: user.verified,
        avatarUrl: user.avatarUrl
      } 
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Google authentication failed" });
  }
});

authRouter.post("/refresh", async (req: any, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    
    if (!refreshToken) {
      return res.status(403).json({ error: "No refresh token" });
    }

    const tokens = await refreshAccessToken(refreshToken, req);
    
    if (!tokens) {
      res.clearCookie('refreshToken', { path: '/' });
      return res.status(403).json({ error: "Invalid or expired refresh token" });
    }

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.json({ accessToken: tokens.accessToken });
  } catch (e) {
    console.error('Token refresh error:', e);
    res.clearCookie('refreshToken', { path: '/' });
    res.status(500).json({ error: "Token refresh failed" });
  }
});

authRouter.post("/logout", authenticate, async (req: any, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    res.clearCookie('refreshToken', { path: '/' });
    await logActivity(req.user.id, 'logout', req);
    res.json({ success: true, message: "Logged out successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Logout failed" });
  }
});

authRouter.post("/logout-all", authenticate, async (req: any, res) => {
  try {
    await revokeAllUserTokens(req.user.id);
    res.clearCookie('refreshToken', { path: '/' });
    await logActivity(req.user.id, 'logout', req, { allDevices: true });
    res.json({ success: true, message: "Logged out from all devices" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Logout failed" });
  }
});

// Session Management Endpoints
authRouter.get("/sessions", authenticate, async (req: any, res) => {
  try {
    const currentRefreshToken = req.cookies?.refreshToken;
    const sessions = await getActiveSessions(req.user.id, currentRefreshToken);
    res.json({ sessions });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

authRouter.delete("/sessions/:id", authenticate, async (req: any, res) => {
  try {
    const sessionId = req.params.id;
    const success = await revokeSession(sessionId, req.user.id);
    
    if (success) {
      await logActivity(req.user.id, 'session_revoked', req, { sessionId });
      res.json({ success: true, message: "Session revoked" });
    } else {
      res.status(404).json({ error: "Session not found or already revoked" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to revoke session" });
  }
});

authRouter.get("/me", authenticate, (req: any, res) => {
  const { id, name, email, role, verified, avatarUrl, oauthProvider } = req.user;
  res.json({ user: { id, name, email, role, verified, avatarUrl, oauthProvider } });
});

authRouter.post("/verify", authenticate, async (req: any, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Code is required" });

  const records = await db.select().from(verificationCodes)
    .where(and(eq(verificationCodes.userId, req.user.id), eq(verificationCodes.code, code), eq(verificationCodes.purpose, 'verification')));
    
  if (records.length === 0) {
    return res.status(400).json({ error: "Invalid verification code" });
  }

  const { expiresAt } = records[0];
  if (new Date() > new Date(expiresAt)) {
    return res.status(400).json({ error: "Verification code has expired" });
  }

  await db.update(users).set({ verified: true }).where(eq(users.id, req.user.id));
  await db.delete(verificationCodes).where(eq(verificationCodes.userId, req.user.id));
  
  await sendEmail(
    req.user.email,
    "🎉 Welcome to BubuWish!",
    getWelcomeEmailHtml(req.user.name)
  );
  
  res.json({ success: true, message: "Account verified successfully" });
});

authRouter.post("/verify-public", async (req: any, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    const userRecords = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (userRecords.length === 0) {
      return res.status(400).json({ error: "Invalid email or verification code" });
    }

    const user = userRecords[0];

    if (user.verified) {
      return res.status(400).json({ error: "Account already verified. Please login." });
    }

    const records = await db.select().from(verificationCodes)
      .where(and(
        eq(verificationCodes.userId, user.id), 
        eq(verificationCodes.code, code), 
        eq(verificationCodes.purpose, 'verification')
      ));
      
    if (records.length === 0) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    const { expiresAt } = records[0];
    if (new Date() > new Date(expiresAt)) {
      return res.status(400).json({ error: "Verification code has expired" });
    }

    await db.update(users).set({ verified: true }).where(eq(users.id, user.id));
    await db.delete(verificationCodes).where(eq(verificationCodes.userId, user.id));
    
    await sendEmail(
      user.email,
      "🎉 Welcome to BubuWish!",
      getWelcomeEmailHtml(user.name)
    );
    
    res.json({ success: true, message: "Account verified successfully! You can now login." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to verify account" });
  }
});

authRouter.post("/resend-verification", authenticate, async (req: any, res) => {
  if (req.user.verified) return res.status(400).json({ error: "User is already verified" });
  const otp = await generateOTP(req.user.id, 'verification');
  await sendEmail(
    req.user.email, 
    "✨ Verify Your BubuWish Account", 
    getVerificationEmailHtml(otp, req.user.name)
  );
  res.json({ success: true });
});

authRouter.post("/resend-verification-public", async (req: any, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const userRecords = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (userRecords.length === 0) {
      return res.json({ success: true, message: "If an account exists, a verification email was sent." });
    }

    const user = userRecords[0];
    
    if (user.verified) {
      return res.status(400).json({ error: "This account is already verified. Please login." });
    }

    const otp = await generateOTP(user.id, 'verification');
    await sendEmail(
      user.email,
      "✨ Verify Your BubuWish Account",
      getVerificationEmailHtml(otp, user.name)
    );

    res.json({ success: true, message: "Verification email sent successfully!" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to resend verification email" });
  }
});

authRouter.post("/forgot-password", async (req: any, res) => {
  const { email } = req.body;
  const userRecords = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (userRecords.length > 0) {
    const otp = await generateOTP(userRecords[0].id, 'reset_password');
    await sendEmail(
      email, 
      "🔑 Reset Your BubuWish Password", 
      getPasswordResetEmailHtml(otp, userRecords[0].name)
    );
  }
  res.json({ success: true, message: "If an account exists, an email was sent." });
});

authRouter.post("/reset-password", async (req: any, res) => {
  const { email, code, newPassword } = req.body;
  
  const userRecords = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (userRecords.length === 0) return res.status(400).json({ error: "Invalid request" });
  
  const userId = userRecords[0].id;

  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    return res.status(400).json({ 
      error: "Password does not meet requirements",
      details: passwordValidation.errors
    });
  }

  const records = await db.select().from(verificationCodes)
    .where(and(eq(verificationCodes.userId, userId), eq(verificationCodes.code, code), eq(verificationCodes.purpose, 'reset_password')));
    
  if (records.length === 0) return res.status(400).json({ error: "Invalid or expired code" });

  const { expiresAt } = records[0];
  if (new Date() > new Date(expiresAt)) return res.status(400).json({ error: "Code has expired" });

  const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_COST);
  await db.update(users).set({ password: hashedPassword, loginAttempts: '0' }).where(eq(users.id, userId));
  await db.delete(verificationCodes).where(and(eq(verificationCodes.userId, userId), eq(verificationCodes.purpose, 'reset_password')));

  await revokeAllUserTokens(userId);
  await logActivity(userId, 'password_reset', req);

  res.json({ success: true, message: "Password updated successfully" });
});

authRouter.post("/change-password", authenticate, async (req: any, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new passwords are required" });
    }

    if (!req.user.password) {
      return res.status(400).json({ error: "Account uses external authentication. Please set a password through reset flow." });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        error: "New password does not meet requirements",
        details: passwordValidation.errors
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, req.user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_COST);
    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, req.user.id));

    await revokeAllUserTokens(req.user.id);
    await logActivity(req.user.id, 'password_change', req);

    res.json({ success: true, message: "Password changed successfully. Please login again." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Password change failed" });
  }
});

authRouter.get("/activity", authenticate, async (req: any, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const { getUserActivity } = await import("../lib/activityLogger");
    const logs = await getUserActivity(req.user.id, limit, offset);
    
    res.json({ logs });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch activity" });
  }
});
