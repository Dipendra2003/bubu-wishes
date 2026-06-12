import { db } from "./src/db/index";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

async function cleanupUsers() {
  console.log("\n🧹 Cleaning up database users (keeping tables)...\n");
  
  try {
    // Get counts before deletion
    console.log("📊 Current data:");
    const userCount = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
    const cardCount = await db.execute(sql`SELECT COUNT(*) as count FROM cards`);
    const contactCount = await db.execute(sql`SELECT COUNT(*) as count FROM contacts`);
    const reviewCount = await db.execute(sql`SELECT COUNT(*) as count FROM reviews`);
    const codeCount = await db.execute(sql`SELECT COUNT(*) as count FROM verification_codes`);

    const users = Array.isArray(userCount) ? userCount[0] : userCount.rows[0];
    const cards = Array.isArray(cardCount) ? cardCount[0] : cardCount.rows[0];
    const contacts = Array.isArray(contactCount) ? contactCount[0] : contactCount.rows[0];
    const reviews = Array.isArray(reviewCount) ? reviewCount[0] : reviewCount.rows[0];
    const codes = Array.isArray(codeCount) ? codeCount[0] : codeCount.rows[0];

    console.log(`   Users: ${users.count}`);
    console.log(`   Cards: ${cards.count}`);
    console.log(`   Contacts: ${contacts.count}`);
    console.log(`   Reviews: ${reviews.count}`);
    console.log(`   Verification Codes: ${codes.count}`);

    // Confirm deletion
    console.log("\n⚠️  This will DELETE all user data (but keep table structures)");
    console.log("   Tables to be cleared:");
    console.log("   - users");
    console.log("   - cards");
    console.log("   - contacts");
    console.log("   - reviews");
    console.log("   - verification_codes");

    // Delete all data (CASCADE will handle related records)
    console.log("\n🗑️  Deleting data...");
    
    // Delete verification codes first (no foreign key dependencies)
    await db.execute(sql`DELETE FROM verification_codes`);
    console.log("   ✅ Verification codes deleted");

    // Delete reviews (references users)
    await db.execute(sql`DELETE FROM reviews`);
    console.log("   ✅ Reviews deleted");

    // Delete contacts (references users)
    await db.execute(sql`DELETE FROM contacts`);
    console.log("   ✅ Contacts deleted");

    // Delete cards (references users)
    await db.execute(sql`DELETE FROM cards`);
    console.log("   ✅ Cards deleted");

    // Delete users (parent table)
    await db.execute(sql`DELETE FROM users`);
    console.log("   ✅ Users deleted");

    // Verify deletion
    console.log("\n📊 After cleanup:");
    const newUserCount = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
    const newCardCount = await db.execute(sql`SELECT COUNT(*) as count FROM cards`);
    const newContactCount = await db.execute(sql`SELECT COUNT(*) as count FROM contacts`);
    const newReviewCount = await db.execute(sql`SELECT COUNT(*) as count FROM reviews`);
    const newCodeCount = await db.execute(sql`SELECT COUNT(*) as count FROM verification_codes`);

    const newUsers = Array.isArray(newUserCount) ? newUserCount[0] : newUserCount.rows[0];
    const newCards = Array.isArray(newCardCount) ? newCardCount[0] : newCardCount.rows[0];
    const newContacts = Array.isArray(newContactCount) ? newContactCount[0] : newContactCount.rows[0];
    const newReviews = Array.isArray(newReviewCount) ? newReviewCount[0] : newReviewCount.rows[0];
    const newCodes = Array.isArray(newCodeCount) ? newCodeCount[0] : newCodeCount.rows[0];

    console.log(`   Users: ${newUsers.count}`);
    console.log(`   Cards: ${newCards.count}`);
    console.log(`   Contacts: ${newContacts.count}`);
    console.log(`   Reviews: ${newReviews.count}`);
    console.log(`   Verification Codes: ${newCodes.count}`);

    // Verify tables still exist
    console.log("\n✓ Verifying tables still exist...");
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tableRows = Array.isArray(tables) ? tables : tables.rows || [];
    const tableNames = tableRows.map((t: any) => t.table_name);
    
    console.log(`   Found ${tableNames.length} tables:`);
    tableNames.forEach((name: string) => {
      console.log(`   ✅ ${name}`);
    });

    console.log("\n✅ Cleanup completed successfully!");
    console.log("   All user data deleted, tables preserved.\n");
    
    process.exit(0);

  } catch (error: any) {
    console.error("\n❌ Cleanup failed!");
    console.error(`   Error: ${error.message}\n`);
    process.exit(1);
  }
}

cleanupUsers();
