import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../../db/index";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

// JWT_SECRET is validated at startup - no fallback allowed
const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    // Check database to ensure user still exists and isn't suspended
    const userRecords = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
    const user = userRecords[0];
    
    if (!user) return res.status(401).json({ error: "User not found" });
    if (user.suspended) return res.status(403).json({ error: "Account suspended" });
    
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export const requireVerified = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user?.verified) {
    return res.status(403).json({ 
      error: "Email verification required", 
      verified: false,
      message: "Please verify your email address to access this feature"
    });
  }
  next();
};

export const checkAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Forbidden: Admins only" });
  next();
};
