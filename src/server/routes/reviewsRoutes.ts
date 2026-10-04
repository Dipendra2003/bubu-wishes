import express from "express";
import { db } from "../../db/index";
import { reviews, users } from "../../db/schema";
import { eq, desc } from "drizzle-orm";
import { authenticate, requireVerified } from "../middleware/auth";
import { apiLimiter } from "../middleware/rateLimiter";

export const reviewsRouter = express.Router();

reviewsRouter.use(apiLimiter);

// Get featured reviews for the landing page
reviewsRouter.get("/featured", async (req: any, res) => {
  try {
    const featuredReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        userName: users.name,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.featured, true))
      .orderBy(desc(reviews.createdAt))
      .limit(3);

    res.json(featuredReviews);
  } catch (e) {
    console.error("[Reviews] Error fetching featured reviews:", e);
    res.status(500).json({ error: "Failed to fetch featured reviews" });
  }
});

// Create a new review
reviewsRouter.post("/", authenticate, requireVerified, async (req: any, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || !comment || comment.trim() === "") {
      return res.status(400).json({ error: "Rating and comment are required." });
    }

    const newReview = await db.insert(reviews).values({
      userId: req.user.id,
      rating: rating.toString(),
      comment: comment.trim(),
      featured: false, // Initially false, maybe admin can feature it later
    }).returning();
    
    res.json({ success: true, review: newReview[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to submit review" });
  }
});
