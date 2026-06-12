import express from "express";
import { db } from "../../db/index";
import { contacts } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { authenticate, requireVerified } from "../middleware/auth";

export const contactsRouter = express.Router();

contactsRouter.use(authenticate);
contactsRouter.use(requireVerified); // Require email verification for contact management

contactsRouter.get("/", async (req: any, res) => {
  try {
    const userContacts = await db.select().from(contacts).where(eq(contacts.userId, req.user.id));
    res.json(userContacts);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

contactsRouter.post("/", async (req: any, res) => {
  try {
    const { name, birthday, email } = req.body;
    if (!name || !birthday) return res.status(400).json({ error: "Name and birthday are required" });

    const newContact = await db.insert(contacts).values({
      userId: req.user.id,
      name,
      birthday: new Date(birthday),
      email
    }).returning();

    res.json(newContact[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to save contact" });
  }
});

contactsRouter.delete("/:id", async (req: any, res) => {
  try {
    await db.delete(contacts).where(and(eq(contacts.id, req.params.id), eq(contacts.userId, req.user.id)));
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete contact" });
  }
});
