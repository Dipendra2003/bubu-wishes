-- Add profile fields to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bio" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "birthday" timestamp;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "location" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "timezone" text;
