import express from "express";
import { db } from "../../db/index";
import { users, cards, reviews } from "../../db/schema";
import { eq, desc } from "drizzle-orm";
import { authenticate, checkAdmin } from "../middleware/auth";

export const adminRouter = express.Router();

adminRouter.use(authenticate, checkAdmin);

adminRouter.get("/metrics", async (req: any, res) => {
  try {
    const allUsers = await db.select().from(users);
    const allCards = await db.select().from(cards);

    const cardTrends: Record<string, number> = {};
    allCards.forEach((c: any) => {
      const dateStr = new Date(c.createdAt).toISOString().split('T')[0];
      cardTrends[dateStr] = (cardTrends[dateStr] || 0) + 1;
    });

    const userTrends: Record<string, number> = {};
    allUsers.forEach((u: any) => {
      const dateStr = new Date(u.createdAt).toISOString().split('T')[0];
      userTrends[dateStr] = (userTrends[dateStr] || 0) + 1;
    });

    const trendData = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      trendData.push({
        date: dateStr,
        cardsCreated: cardTrends[dateStr] || 0,
        signups: userTrends[dateStr] || 0,
      });
    }

    res.json({
      totalUsers: allUsers.length,
      verifiedUsers: allUsers.filter((u: any) => u.verified).length,
      totalCards: allCards.length,
      adminUsers: allUsers.filter((u: any) => u.role === 'admin').length,
      trendData
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server DB error" });
  }
});

adminRouter.get("/users", async (req: any, res) => {
  try {
    const allUsers = await db.select().from(users);
    res.json(allUsers.map((u: any) => ({
      id: u.id, name: u.name, email: u.email, role: u.role, verified: u.verified, suspended: u.suspended || false
    })));
  } catch (e) { console.error(e); res.status(500).json({ error: "Server DB error" }); }
});

adminRouter.get("/wishes", async (req: any, res) => {
  try {
    const allCards = await db.select().from(cards);
    const allUsers = await db.select().from(users);
    
    const userMap: Record<string, string> = {};
    allUsers.forEach((u: any) => { userMap[u.id] = u.name; });

    res.json(allCards.map((c: any) => ({
      id: c.id, 
      recipient: c.recipient, 
      message: c.message, 
      userId: c.creatorId, 
      authorName: c.creatorId ? userMap[c.creatorId] || 'Unknown' : 'Unknown',
      createdAt: c.createdAt
    })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server DB error" });
  }
});

adminRouter.delete("/users/:id", async (req: any, res) => {
  try {
    await db.delete(users).where(eq(users.id, req.params.id));
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: "Server DB error" }); }
});

adminRouter.post("/users/:id/toggle-suspend", async (req: any, res) => {
  try {
    const userRecords = await db.select().from(users).where(eq(users.id, req.params.id)).limit(1);
    if (userRecords.length === 0) return res.status(404).json({ error: "User not found" });
    
    const newSuspendedState = !userRecords[0].suspended;
    await db.update(users).set({ suspended: newSuspendedState }).where(eq(users.id, req.params.id));
    
    res.json({ success: true, suspended: newSuspendedState });
  } catch (e) { console.error(e); res.status(500).json({ error: "Server DB error" }); }
});

adminRouter.get("/reviews", async (req: any, res) => {
  try {
    console.log('[Admin Reviews] Fetching all reviews...');
    const allReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        featured: reviews.featured,
        createdAt: reviews.createdAt,
        userName: users.name,
        userEmail: users.email,
        userId: reviews.userId
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .orderBy(desc(reviews.createdAt));
    
    console.log(`[Admin Reviews] Found ${allReviews.length} reviews`);
    res.json(allReviews);
  } catch (e) {
    console.error('[Admin Reviews] Error:', e);
    res.status(500).json({ error: "Server DB error" });
  }
});

adminRouter.post("/reviews/:id/toggle-featured", async (req: any, res) => {
  try {
    const reviewRecords = await db.select().from(reviews).where(eq(reviews.id, req.params.id)).limit(1);
    if (reviewRecords.length === 0) return res.status(404).json({ error: "Review not found" });
    
    const newFeaturedState = !reviewRecords[0].featured;
    await db.update(reviews).set({ featured: newFeaturedState }).where(eq(reviews.id, req.params.id));
    
    res.json({ success: true, featured: newFeaturedState });
  } catch (e) { console.error(e); res.status(500).json({ error: "Server DB error" }); }
});

adminRouter.delete("/reviews/:id", async (req: any, res) => {
  try {
    await db.delete(reviews).where(eq(reviews.id, req.params.id));
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: "Server DB error" }); }
});
