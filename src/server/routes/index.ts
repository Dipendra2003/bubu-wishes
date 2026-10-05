import express from "express";
import { uploadRouter } from "./uploadRoutes";
import { cronRouter } from "./cronRoutes";
import { authRouter } from "./authRoutes";
import { cardsRouter } from "./cardsRoutes";
import { contactsRouter } from "./contactsRoutes";
import { adminRouter } from "./adminRoutes";
import { wishesRouter } from "./wishesRoutes";
import { aiRouter } from "./aiRoutes";
import { reviewsRouter } from "./reviewsRoutes";
import { mediaLibraryRouter } from "./mediaLibraryRoutes";
import profileRouter from "./profileRoutes";
import { preferencesRouter } from "./preferencesRoutes";
import { healthRouter } from "./healthRoutes";

export const apiRouter = express.Router();

// Health check (no auth required)
apiRouter.use("/health", healthRouter);

// API routes - Use improved auth routes
apiRouter.use("/auth", authRouter);
apiRouter.use("/cards", cardsRouter);
apiRouter.use("/contacts", contactsRouter);
apiRouter.use("/upload", uploadRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/cron", cronRouter);
apiRouter.use("/wishes", wishesRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/media-library", mediaLibraryRouter);
apiRouter.use("/profile", profileRouter);
apiRouter.use("/preferences", preferencesRouter);
apiRouter.use("/", aiRouter); // Maps to /api/generate-message

// Proxy route for Giphy to bypass client-side ad-blockers (Brave/uBlock)
apiRouter.get("/giphy-search", async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) return res.status(400).json({ error: "Query is required" });
    
    const apiKey = process.env.GIPHY_API_KEY || process.env.VITE_GIPHY_API_KEY || 'GlVGYHqc3SyCEwsgF8IvAW12Z4k28A7A';
    const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=12&rating=g`);
    
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json(err);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Giphy proxy error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Contact Form endpoint
apiRouter.post("/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required" });
    }
    
    // Log the contact message
    console.log(`\n📬 [NEW CONTACT MESSAGE]`);
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}\n`);

    // In a production app, we would use emailService to send this to admin@bubuwish.com
    // For now, we simulate success
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulating network delay

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});
