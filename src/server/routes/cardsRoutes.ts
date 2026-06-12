import express from "express";
import { db } from "../../db/index";
import { cards } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { authenticate, requireVerified } from "../middleware/auth";
import { apiLimiter } from "../middleware/rateLimiter";

export const cardsRouter = express.Router();

cardsRouter.use(apiLimiter);

cardsRouter.get("/:id", async (req: any, res) => {
  try {
    const cardRecords = await db.select().from(cards).where(eq(cards.id, req.params.id)).limit(1);
    if (cardRecords.length > 0) {
      const data = cardRecords[0];
      if (data.cardData) {
        res.json(JSON.parse(data.cardData));
      } else {
        res.json({
          to: data.recipient,
          from: data.sender,
          message: data.message,
          theme: data.theme,
          unlockCode: data.unlockCode,
          musicTheme: data.musicTheme,
          bgPattern: data.bgPattern
        });
      }
    } else {
      res.status(404).json({ error: "Not found" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Database error" });
  }
});

// Protect all other routes
cardsRouter.use(authenticate);
cardsRouter.use(requireVerified); // Require email verification for all card operations

cardsRouter.post("/", async (req: any, res) => {
  try {
    const data = req.body;
    if (!data.message && !data.customPhotoUrls && !data.recordedAudio) {
        return res.status(400).json({ error: "Message or media is required" });
    }
    
    // Check sizes on the backend to avoid massive payloads just in case
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
    
    res.json(newCardRecord[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create magic card" });
  }
});

cardsRouter.put("/:id", async (req: any, res) => {
  try {
    const data = req.body;
    
    if (JSON.stringify(data).length > 200 * 1024) { // 200KB limit
        return res.status(400).json({ error: "Payload size too large" });
    }

    const targetCard = await db.select().from(cards).where(eq(cards.id, req.params.id)).limit(1);
    
    if (targetCard.length === 0) {
      return res.status(404).json({ error: "Card not found" });
    }
    
    if (targetCard[0].creatorId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden: You don't own this card" });
    }

    await db.update(cards).set({
      recipient: data.to || "-",
      sender: data.from || "-",
      message: data.message,
      theme: data.theme || "-",
      unlockCode: data.unlockCode || "-",
      musicTheme: data.musicTheme || "-",
      bgPattern: data.bgPattern || "-",
      imageUrl: data.customPhotoUrls?.[0] || data.customPhotoUrl || null,
      audioUrl: data.recordedAudio || null,
      cardData: JSON.stringify(data)
    }).where(eq(cards.id, req.params.id));

    res.json({ success: true, id: req.params.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server DB error" });
  }
});

cardsRouter.delete("/:id", async (req: any, res) => {
  try {
    const targetCard = await db.select().from(cards).where(eq(cards.id, req.params.id)).limit(1);
    
    if (targetCard.length === 0) return res.status(404).json({ error: "Not found" });
    if (targetCard[0].creatorId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    await db.delete(cards).where(eq(cards.id, req.params.id));
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete magic card" });
  }
});

cardsRouter.get("/", async (req: any, res) => {
  try {
    const wishes = await db.select().from(cards).where(eq(cards.creatorId, req.user.id));
    res.json(wishes.map(w => ({
      id: w.id,
      recipient: w.recipient,
      message: w.message,
      theme: w.theme,
      cardData: w.cardData,
      createdAt: w.createdAt,
    })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch wishes" });
  }
});
