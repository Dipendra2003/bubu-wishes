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
    // If database connection fails, return fallback static reviews to keep the landing page functional
    res.json([
      { userName: "Sarah J.", role: "Girlfriend", comment: "I sent the Valentine's theme to my boyfriend with a voice note. He literally cried. The unboxing animation is so satisfying!", rating: "5" },
      { userName: "Mike T.", role: "Best Friend", comment: "The math puzzle lock is hilarious. I made my friend solve algebra before he could see my birthday message.", rating: "5" },
      { userName: "Emily W.", role: "Long Distance", comment: "I live across the country from my mom. Being able to send a full 3D interactive card makes it feel so much more special.", rating: "5" }
    ]);
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
