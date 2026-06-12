import { db } from "./src/db/index";
import { reviews } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function featureReview() {
  try {
    const reviewId = process.argv[2];
    
    if (!reviewId) {
      console.log("❌ Please provide a review ID");
      console.log("Usage: npm run feature:review <review-id>");
      console.log("\nTo see all reviews, run: node ./node_modules/tsx/dist/cli.mjs check-reviews.ts");
      process.exit(1);
    }

    // Get the review
    const existingReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (existingReviews.length === 0) {
      console.log(`❌ Review with ID ${reviewId} not found`);
      process.exit(1);
    }

    const review = existingReviews[0];
    const newFeaturedState = !review.featured;

    // Toggle featured status
    await db
      .update(reviews)
      .set({ featured: newFeaturedState })
      .where(eq(reviews.id, reviewId));

    console.log(`✅ Review ${newFeaturedState ? 'featured' : 'unfeatured'} successfully!`);
    console.log(`\nReview Details:`);
    console.log(`  Rating: ${'⭐'.repeat(parseInt(review.rating) || 0)}`);
    console.log(`  Comment: "${review.comment}"`);
    console.log(`  Status: ${newFeaturedState ? '✨ FEATURED' : 'Standard'}`);
    console.log(`\n💡 Refresh your landing page to see the changes!`);
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
  
  process.exit(0);
}

featureReview();
