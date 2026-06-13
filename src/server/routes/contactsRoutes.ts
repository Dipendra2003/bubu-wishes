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
    const { name, birthday, email, imageUrl, relationship, notes, favorite } = req.body;
    if (!name || !birthday) return res.status(400).json({ error: "Name and birthday are required" });

    const newContact = await db.insert(contacts).values({
      userId: req.user.id,
      name,
      birthday: new Date(birthday),
      email,
      imageUrl: imageUrl || null,
      relationship: relationship || 'friend',
      notes: notes || null,
      favorite: favorite || false
    }).returning();

    res.json(newContact[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to save contact" });
  }
});

// PUT route for updating contacts
contactsRouter.put("/:id", async (req: any, res) => {
  try {
    const { name, birthday, email, imageUrl, relationship, notes, favorite } = req.body;
    if (!name || !birthday) return res.status(400).json({ error: "Name and birthday are required" });

    const updatedContact = await db.update(contacts)
      .set({
        name,
        birthday: new Date(birthday),
        email,
        imageUrl: imageUrl || null,
        relationship: relationship || 'friend',
        notes: notes || null,
        favorite: favorite !== undefined ? favorite : false
      })
      .where(and(eq(contacts.id, req.params.id), eq(contacts.userId, req.user.id)))
      .returning();

    if (updatedContact.length === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json(updatedContact[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update contact" });
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
