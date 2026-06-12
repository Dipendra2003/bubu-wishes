import express from "express";
import { db } from "../../db/index";
import { users, verificationCodes } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authenticate } from "../middleware/auth";
import { sendEmail, getVerificationEmailHtml, getPasswordResetEmailHtml, getWelcomeEmailHtml } from "../services/emailService";
import { authLimiter } from "../middleware/rateLimiter";

export const authRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-fallback-key-2024";

const generateOTP = async (userId: string, purpose: 'verification' | 'reset_password') => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
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

    if (!password || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Email already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
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
    
    // Don't return token - user must verify email first before logging in
    res.json({ 
      success: true,
      message: "Account created! Please check your email to verify your account.",
      email: newUser.email
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not create account. Missing DB configuration?" });
  }
});

authRouter.post("/login", async (req: any, res) => {
  try {
    const { email, password } = req.body;
    const userRecords = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = userRecords[0];
    
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    
    if (user.suspended) {
      return res.status(403).json({ error: "Your account has been suspended" });
    }

    // Check if user is verified before allowing login
    if (!user.verified) {
      return res.status(403).json({ 
        error: "Please verify your email before logging in",
        verified: false,
        email: user.email,
        message: "Check your email for the verification code. Click 'Resend Code' if you didn't receive it."
      });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, verified: user.verified } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Database error during login. Check server configuration." });
  }
});

authRouter.get("/me", authenticate, (req: any, res) => {
  const { id, name, email, role, verified } = req.user;
  res.json({ user: { id, name, email, role, verified } });
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
  
  // Send welcome email after successful verification
  await sendEmail(
    req.user.email,
    "🎉 Welcome to BubuWish!",
    getWelcomeEmailHtml(req.user.name)
  );
  
  res.json({ success: true, message: "Account verified successfully" });
});

// Public verification endpoint (for users who signed up but can't login yet)
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
      return res.status(400).json({ error: "Verification code has expired. Please request a new one." });
    }

    await db.update(users).set({ verified: true }).where(eq(users.id, user.id));
    await db.delete(verificationCodes).where(eq(verificationCodes.userId, user.id));
    
    // Send welcome email after successful verification
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

// Public endpoint for resending verification (for users who can't login because they're not verified)
authRouter.post("/resend-verification-public", async (req: any, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const userRecords = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (userRecords.length === 0) {
      // Don't reveal if email exists or not for security
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

  const records = await db.select().from(verificationCodes)
    .where(and(eq(verificationCodes.userId, userId), eq(verificationCodes.code, code), eq(verificationCodes.purpose, 'reset_password')));
    
  if (records.length === 0) return res.status(400).json({ error: "Invalid or expired code" });

  const { expiresAt } = records[0];
  if (new Date() > new Date(expiresAt)) return res.status(400).json({ error: "Code has expired" });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
  await db.delete(verificationCodes).where(and(eq(verificationCodes.userId, userId), eq(verificationCodes.purpose, 'reset_password')));

  res.json({ success: true, message: "Password updated successfully" });
});
