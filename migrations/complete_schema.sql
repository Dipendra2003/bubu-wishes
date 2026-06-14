-- ============================================================
-- MERGED COMPLETE DATABASE SCHEMA MIGRATION
-- Birthday Wishing Application - BubuWish
-- Date: 2026-06-14
-- Description: Consolidated complete database schema with all tables, indexes, and constraints
-- Includes: Base schema + Auth improvements + Google OAuth support
-- ============================================================

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Users Table (with all auth improvements and OAuth support)
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "password" text DEFAULT '',
  "role" text NOT NULL DEFAULT 'client',
  "verified" boolean NOT NULL DEFAULT false,
  "suspended" boolean NOT NULL DEFAULT false,
  "avatar_url" text,
  "bio" text,
  "phone" text,
  "birthday" timestamp,
  "location" text,
  "timezone" text,
  "google_id" text UNIQUE,
  "login_attempts" text DEFAULT '0',
  "locked_until" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- Verification Codes Table
CREATE TABLE IF NOT EXISTS "verification_codes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "code" text NOT NULL,
  "expires_at" timestamp NOT NULL,
  "purpose" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- Contacts Table
CREATE TABLE IF NOT EXISTS "contacts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "birthday" timestamp NOT NULL,
  "email" text,
  "image_url" text,
  "relationship" text,
  "notes" text,
  "favorite" boolean DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS "reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "rating" text NOT NULL,
  "comment" text NOT NULL,
  "featured" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- Cards Table
CREATE TABLE IF NOT EXISTS "cards" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "recipient" text NOT NULL,
  "sender" text NOT NULL,
  "message" text NOT NULL,
  "theme" text NOT NULL,
  "unlock_code" text NOT NULL,
  "music_theme" text NOT NULL,
  "bg_pattern" text NOT NULL,
  "card_data" text,
  "image_url" text,
  "audio_url" text,
  "public_id" text,
  "media_type" text,
  "creator_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- Media Library Table
CREATE TABLE IF NOT EXISTS "media_library" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "media_type" text NOT NULL,
  "media_url" text NOT NULL,
  "public_id" text,
  "file_name" text,
  "file_size" text,
  "mime_type" text,
  "thumbnail" text,
  "duration" text,
  "usage_count" text DEFAULT '0',
  "last_used_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- ============================================================
-- BIRTHDAY REMINDER SYSTEM TABLES
-- ============================================================

-- User Preferences Table
CREATE TABLE IF NOT EXISTS "user_preferences" (
  "user_id" uuid PRIMARY KEY REFERENCES "users"("id") ON DELETE CASCADE,
  "email_reminders" boolean NOT NULL DEFAULT true,
  "reminder_days" text NOT NULL DEFAULT '1,3,7',
  "reminder_time" text NOT NULL DEFAULT '08:00',
  "birthday_wish_email" boolean NOT NULL DEFAULT true,
  "timezone" text NOT NULL DEFAULT 'UTC',
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Reminder History Table
CREATE TABLE IF NOT EXISTS "reminder_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "contact_id" uuid NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
  "reminder_type" text NOT NULL,
  "sent_at" timestamp NOT NULL DEFAULT now(),
  "email_sent" boolean NOT NULL DEFAULT true,
  "email_status" text NOT NULL DEFAULT 'sent',
  "error_message" text,
  "contact_birthday" timestamp NOT NULL
);

-- Email Logs Table
CREATE TABLE IF NOT EXISTS "email_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "recipient_email" text NOT NULL,
  "subject" text NOT NULL,
  "email_type" text NOT NULL,
  "status" text NOT NULL DEFAULT 'queued',
  "sent_at" timestamp,
  "failed_at" timestamp,
  "error_message" text,
  "retry_count" text NOT NULL DEFAULT '0',
  "metadata" text,
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- Card Share Tokens Table
CREATE TABLE IF NOT EXISTS "card_share_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "card_id" uuid NOT NULL REFERENCES "cards"("id") ON DELETE CASCADE,
  "share_token" text NOT NULL UNIQUE,
  "view_count" text NOT NULL DEFAULT '0',
  "last_viewed_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "expires_at" timestamp
);

-- ============================================================
-- AUTHENTICATION & SECURITY TABLES
-- ============================================================

-- Refresh Tokens Table
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token" text NOT NULL UNIQUE,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "revoked_at" timestamp
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS "activity_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "action" text NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "metadata" text,
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

-- User Indexes
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users"("email");
CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users"("role");
CREATE INDEX IF NOT EXISTS "idx_users_google_id" ON "users"("google_id") WHERE "google_id" IS NOT NULL;

-- Contact Indexes
CREATE INDEX IF NOT EXISTS "idx_contacts_user_id" ON "contacts"("user_id");
CREATE INDEX IF NOT EXISTS "idx_contacts_birthday" ON "contacts"("birthday");
CREATE INDEX IF NOT EXISTS "idx_contacts_favorite" ON "contacts"("user_id", "favorite") WHERE "favorite" = true;
CREATE INDEX IF NOT EXISTS "idx_contacts_relationship" ON "contacts"("user_id", "relationship");

-- Card Indexes
CREATE INDEX IF NOT EXISTS "idx_cards_creator_id" ON "cards"("creator_id");
CREATE INDEX IF NOT EXISTS "idx_cards_created_at" ON "cards"("created_at");

-- Reminder System Indexes
CREATE INDEX IF NOT EXISTS "idx_reminder_history_user_id" ON "reminder_history"("user_id");
CREATE INDEX IF NOT EXISTS "idx_reminder_history_contact_id" ON "reminder_history"("contact_id");
CREATE INDEX IF NOT EXISTS "idx_reminder_history_sent_at" ON "reminder_history"("sent_at");

-- Email Logs Indexes
CREATE INDEX IF NOT EXISTS "idx_email_logs_status" ON "email_logs"("status");
CREATE INDEX IF NOT EXISTS "idx_email_logs_created_at" ON "email_logs"("created_at");
CREATE INDEX IF NOT EXISTS "idx_email_logs_recipient" ON "email_logs"("recipient_email");

-- Card Share Tokens Indexes
CREATE INDEX IF NOT EXISTS "idx_card_share_tokens_token" ON "card_share_tokens"("share_token");
CREATE INDEX IF NOT EXISTS "idx_card_share_tokens_card_id" ON "card_share_tokens"("card_id");

-- Verification Codes Indexes
CREATE INDEX IF NOT EXISTS "idx_verification_codes_user_id" ON "verification_codes"("user_id");
CREATE INDEX IF NOT EXISTS "idx_verification_codes_code" ON "verification_codes"("code");

-- Media Library Indexes
CREATE INDEX IF NOT EXISTS "idx_media_library_user_id" ON "media_library"("user_id");
CREATE INDEX IF NOT EXISTS "idx_media_library_media_type" ON "media_library"("media_type");

-- Auth & Security Indexes
CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_user_id" ON "refresh_tokens"("user_id");
CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_token" ON "refresh_tokens"("token");
CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_expires_at" ON "refresh_tokens"("expires_at");
CREATE INDEX IF NOT EXISTS "idx_activity_logs_user_id" ON "activity_logs"("user_id");
CREATE INDEX IF NOT EXISTS "idx_activity_logs_action" ON "activity_logs"("action");
CREATE INDEX IF NOT EXISTS "idx_activity_logs_created_at" ON "activity_logs"("created_at");

-- ============================================================
-- TABLE COMMENTS FOR DOCUMENTATION
-- ============================================================

COMMENT ON TABLE "users" IS 'Application users with authentication, profile data, and OAuth support';
COMMENT ON TABLE "contacts" IS 'Birthday contacts managed by users';
COMMENT ON TABLE "cards" IS 'Created birthday cards with media and customization';
COMMENT ON TABLE "user_preferences" IS 'User email and reminder preferences for birthday notifications';
COMMENT ON TABLE "reminder_history" IS 'Track all sent birthday reminders to prevent duplicates';
COMMENT ON TABLE "email_logs" IS 'Comprehensive email delivery logs for monitoring and debugging';
COMMENT ON TABLE "card_share_tokens" IS 'Secure tokens for public card sharing';
COMMENT ON TABLE "media_library" IS 'User-uploaded media files for card customization';
COMMENT ON TABLE "verification_codes" IS 'Email verification and password reset codes';
COMMENT ON TABLE "reviews" IS 'User reviews and testimonials';
COMMENT ON TABLE "refresh_tokens" IS 'Stores refresh tokens for JWT token rotation';
COMMENT ON TABLE "activity_logs" IS 'Tracks user security-related activities for auditing';

-- ============================================================
-- COLUMN COMMENTS FOR KEY FIELDS
-- ============================================================

COMMENT ON COLUMN "users"."password" IS 'Hashed password (nullable for OAuth-only accounts)';
COMMENT ON COLUMN "users"."google_id" IS 'Google OAuth user ID for Google Sign-In (unique)';
COMMENT ON COLUMN "users"."login_attempts" IS 'Number of consecutive failed login attempts';
COMMENT ON COLUMN "users"."locked_until" IS 'Timestamp until account is locked after too many failed attempts';
COMMENT ON COLUMN "contacts"."birthday" IS 'Birthday date (year is ignored for annual reminders)';
COMMENT ON COLUMN "user_preferences"."reminder_days" IS 'Comma-separated days before birthday to send reminders (e.g., "1,3,7")';
COMMENT ON COLUMN "reminder_history"."reminder_type" IS 'Type of reminder: "1day", "3day", "7day", "0day", or "birthday_wish"';
COMMENT ON COLUMN "email_logs"."email_type" IS 'Type: "verification", "birthday_reminder", "birthday_wish", "welcome", etc.';
COMMENT ON COLUMN "cards"."unlock_code" IS 'PIN or puzzle code to unlock the birthday card';

-- ============================================================
-- END OF MERGED MIGRATION
-- ============================================================
