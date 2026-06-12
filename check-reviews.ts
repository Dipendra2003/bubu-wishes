import { db } from "./src/db/index";
import { reviews, users } from "./src/db/schema";
import { eq, desc } from "drizzle-orm";

async function checkReviews() {
  try {
    console.log("Checking reviews in database...\n");
    
    // Get all reviews with user info
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

    if (allReviews.length === 0) {
      console.log("❌ No reviews found in the database.");
      console.log("\nPossible issues:");
      console.log("1. Reviews table might not exist - run migrations");
      console.log("2. No reviews have been submitted yet");
      console.log("3. API endpoint might have errors");
    } else {
      console.log(`✅ Found ${allReviews.length} review(s) in database:\n`);
      allReviews.forEach((review, index) => {
        console.log(`Review #${index + 1}:`);
        console.log(`  ID: ${review.id}`);
        console.log(`  User: ${review.userName || 'Unknown'} (${review.userEmail || 'N/A'})`);
        console.log(`  Rating: ${'⭐'.repeat(parseInt(review.rating) || 0)} (${review.rating})`);
        console.log(`  Comment: "${review.comment}"`);
        console.log(`  Featured: ${review.featured ? '✨ YES' : 'No'}`);
        console.log(`  Created: ${new Date(review.createdAt).toLocaleString()}`);
        console.log('');
      });

      // Check featured reviews
      const featuredCount = allReviews.filter(r => r.featured).length;
      console.log(`\n📌 Featured reviews: ${featuredCount}`);
      
      if (featuredCount === 0) {
        console.log("⚠️  No reviews are featured. They won't show on the landing page!");
        console.log("💡 Use the Admin Dashboard to feature reviews.");
      }
    }

  } catch (error) {
    console.error("❌ Error checking reviews:", error);
    console.log("\nMake sure:");
    console.log("1. Database is running");
    console.log("2. .env file has correct DATABASE_URL");
    console.log("3. Reviews table exists (check schema)");
  }
  
  process.exit(0);
}

checkReviews();
