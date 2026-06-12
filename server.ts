import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import helmet from "helmet";
import { db } from "./src/db/index";
import { sql } from "drizzle-orm";
import { apiRouter } from "./src/server/routes/index";
import "./src/server/workers/emailWorker";

async function startServer() {
  const app = express();
  app.set("trust proxy", 1);
  const PORT = 3000;

  // Use global security middleware
  app.use(helmet({ contentSecurityPolicy: false })); // Disabled CSP for inline styles/scripts in dev
  
  // Enforce rigid request constraints
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));

  // Attempt to update schema safely
  try {
    await db.execute(sql`ALTER TABLE "cards" ADD COLUMN IF NOT EXISTS "id" uuid PRIMARY KEY DEFAULT gen_random_uuid();`);
    await db.execute(sql`ALTER TABLE "cards" ADD COLUMN IF NOT EXISTS "card_data" text;`);
    await db.execute(sql`ALTER TABLE "cards" ADD COLUMN IF NOT EXISTS "image_url" text;`);
    await db.execute(sql`ALTER TABLE "cards" ADD COLUMN IF NOT EXISTS "audio_url" text;`);
    await db.execute(sql`ALTER TABLE "cards" ADD COLUMN IF NOT EXISTS "public_id" text;`);
    await db.execute(sql`ALTER TABLE "cards" ADD COLUMN IF NOT EXISTS "media_type" text;`);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "contacts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
        "name" text NOT NULL,
        "birthday" timestamp NOT NULL,
        "email" text,
        "created_at" timestamp NOT NULL DEFAULT now()
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "reviews" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
        "rating" text NOT NULL,
        "comment" text NOT NULL,
        "featured" boolean NOT NULL DEFAULT false,
        "created_at" timestamp NOT NULL DEFAULT now()
      );
    `);

    // Seed featured reviews for demo
    try {
      const usersData: any = await db.execute(sql`SELECT id FROM users LIMIT 1`);
      if (usersData && usersData.length > 0) {
        const adminId = usersData[0].id;
        const existingReviews: any = await db.execute(sql`SELECT count(*) FROM reviews`);
        if (existingReviews && existingReviews[0].count === '0') {
           await db.execute(sql`
             INSERT INTO reviews (user_id, rating, comment, featured) VALUES 
             (${adminId}, '5', 'Such a cute and magical way to send a greeting! The puzzle lock was a huge hit with my partner.', true),
             (${adminId}, '5', 'The memory timeline feature let me create a beautiful anniversary card. So much better than a paper card!', true),
             (${adminId}, '5', 'I love the little floating Bubu & Dudu animations. Easy to use and the custom voice note was perfect.', true)
           `);
           console.log("Seeded basic reviews.");
        }
      }
    } catch (e) {
      // Ignore seed errors if no users exist yet
    }
  } catch (err: any) {
    // Ignore schema check errors
  }

  // Use centralized API router
  app.use("/api", apiRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
