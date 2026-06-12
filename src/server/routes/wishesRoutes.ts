import express from "express";
import { db } from "../../db/index";
import { cards } from "../../db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { authenticate, requireVerified } from "../middleware/auth";
import { apiLimiter } from "../middleware/rateLimiter";

export const wishesRouter = express.Router();

wishesRouter.use(authenticate);
wishesRouter.use(requireVerified); // Require email verification for wishes
wishesRouter.use(apiLimiter);

wishesRouter.post("/", async (req: any, res) => {
  try {
    const data = req.body;
    // Allow cards with message, photos, or audio
    const hasContent = data.message || 
                      data.recordedAudio || 
                      (data.customPhotoUrls && data.customPhotoUrls.length > 0) || 
                      data.customPhotoUrl;
    
    if (!hasContent) {
        return res.status(400).json({ error: "Message or media is required" });
    }
    
    if (JSON.stringify(data).length > 200 * 1024) { // 200KB limit
        return res.status(400).json({ error: "Payload size too large" });
    }
    
    const cardId = randomUUID(); // Use full UUID for database compatibility
    
    const newCardRecord = await db.insert(cards).values({
      id: cardId,
      recipient: data.to || "A Friend",
      sender: data.from || "A Friend",
      message: data.message || "",
      theme: data.theme || "classic",
      unlockCode: data.unlockCode || "-",
      musicTheme: data.musicTheme || "-",
      bgPattern: data.bgPattern || "-",
      cardData: JSON.stringify(data),
      imageUrl: data.customPhotoUrls?.[0] || data.customPhotoUrl || null,
      audioUrl: data.recordedAudio || null,
      creatorId: req.user.id,
    }).returning();
    
    res.json({ id: cardId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create wish" });
  }
});

wishesRouter.delete("/:id", async (req: any, res) => {
  try {
    const wishRecords = await db.select().from(cards).where(eq(cards.id, req.params.id)).limit(1);
    if (wishRecords.length === 0) return res.status(404).json({ error: "Wish not found" });
    if (wishRecords[0].creatorId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    await db.delete(cards).where(eq(cards.id, req.params.id));
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete" });
  }
});

wishesRouter.put("/:id", async (req: any, res) => {
  try {
    const data = req.body;
    
    if (JSON.stringify(data).length > 200 * 1024) { // 200KB limit
        return res.status(400).json({ error: "Payload size too large" });
    }

    const wishRecords = await db.select().from(cards).where(eq(cards.id, req.params.id)).limit(1);
    if (wishRecords.length === 0) return res.status(404).json({ error: "Wish not found" });
    if (wishRecords[0].creatorId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    await db.update(cards).set({
      recipient: data.to || "-",
      sender: data.from || "-",
      message: data.message || "",
      theme: data.theme || "classic",
      unlockCode: data.unlockCode || "-",
      musicTheme: data.musicTheme || "-",
      bgPattern: data.bgPattern || "-",
      imageUrl: data.customPhotoUrls?.[0] || data.customPhotoUrl || null,
      audioUrl: data.recordedAudio || null,
      cardData: JSON.stringify(data)
    }).where(eq(cards.id, req.params.id));

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update wish" });
  }
});

wishesRouter.get("/", async (req: any, res) => {
  try {
    // Optimize query: select only needed fields and sort by creation date (newest first)
    const wishes = await db
      .select({
        id: cards.id,
        recipient: cards.recipient,
        message: cards.message,
        theme: cards.theme,
        cardData: cards.cardData,
        createdAt: cards.createdAt,
      })
      .from(cards)
      .where(eq(cards.creatorId, req.user.id))
      .orderBy(cards.createdAt); // Sort by newest first
    
    res.json(wishes);
  } catch (e) {
    console.error('Error fetching wishes:', e);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});
