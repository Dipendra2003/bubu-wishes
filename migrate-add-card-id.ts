import { db } from "./src/db/index";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

async function migrateCardId() {
  console.log("\n🔄 Running migration: Add ID column to cards table\n");
  
  try {
    // Check if id column already exists
    console.log("✓ Checking if id column exists...");
    const checkResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'cards' AND column_name = 'id'
    `);

    const rows = Array.isArray(checkResult) ? checkResult : checkResult.rows || [];
    
    if (rows.length > 0) {
      console.log("ℹ️  ID column already exists in cards table. No migration needed.\n");
      process.exit(0);
    }

    // Add id column as UUID with default random value
    console.log("✓ Adding id column to cards table...");
    await db.execute(sql`
      ALTER TABLE "cards" 
      ADD COLUMN "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY
    `);
    console.log("✅ ID column added successfully!");

    // Verify the change
    const verifyResult = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'cards' AND column_name = 'id'
    `);
    
    const verifyRows = Array.isArray(verifyResult) ? verifyResult : verifyResult.rows || [];
    if (verifyRows.length > 0) {
      console.log("\n✓ Verification:");
      console.log(`   Column: ${verifyRows[0].column_name}`);
      console.log(`   Type: ${verifyRows[0].data_type}`);
      console.log(`   Nullable: ${verifyRows[0].is_nullable}`);
    }

    console.log("\n✅ Migration completed successfully!\n");
    process.exit(0);

  } catch (error: any) {
    console.error("\n❌ Migration failed!");
    console.error(`   Error: ${error.message}\n`);
    process.exit(1);
  }
}

migrateCardId();
