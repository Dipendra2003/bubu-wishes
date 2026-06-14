import { pgTable, text, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').default('client').notNull(),
  verified: boolean('verified').default(false).notNull(),
  suspended: boolean('suspended').default(false).notNull(),
  // Profile fields - using snake_case to match database columns
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  phone: text('phone'),
  birthday: timestamp('birthday'),
  location: text('location'),
  timezone: text('timezone'),
  loginAttempts: text('login_attempts').default('0'), // Track failed login attempts
  lockedUntil: timestamp('locked_until'), // Account lock timestamp
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const verificationCodes = pgTable('verification_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  code: text('code').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  purpose: text('purpose').notNull(), // 'verification' or 'reset_password'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const contacts = pgTable('contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  birthday: timestamp('birthday').notNull(),
  email: text('email'),
  imageUrl: text('image_url'), // Contact profile image
  relationship: text('relationship'), // 'family', 'friend', 'colleague', 'partner', 'other'
  notes: text('notes'), // Personal notes about the contact
  favorite: boolean('favorite').default(false), // Mark as favorite
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  rating: text('rating').notNull(),
  comment: text('comment').notNull(),
  featured: boolean('featured').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const cards = pgTable('cards', {
  id: uuid('id').defaultRandom().primaryKey(),
  recipient: text('recipient').notNull(),
  sender: text('sender').notNull(),
  message: text('message').notNull(),
  theme: text('theme').notNull(),
  unlockCode: text('unlock_code').notNull(),
  musicTheme: text('music_theme').notNull(),
  bgPattern: text('bg_pattern').notNull(),
  cardData: text('card_data'), // JSON string of full CardData
  imageUrl: text('image_url'),
  audioUrl: text('audio_url'),
  publicId: text('public_id'),
  mediaType: text('media_type'),
  creatorId: uuid('creator_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const mediaLibrary = pgTable('media_library', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  mediaType: text('media_type').notNull(), // 'image', 'audio', or 'video'
  mediaUrl: text('media_url').notNull(),
  publicId: text('public_id'), // Cloudinary public ID for deletion
  fileName: text('file_name'),
  fileSize: text('file_size'), // Store as string for flexibility
  mimeType: text('mime_type'),
  thumbnail: text('thumbnail'), // For images and videos
  duration: text('duration'), // For audio and video files
  usageCount: text('usage_count').default('0'), // Track how many times used
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userPreferences = pgTable('user_preferences', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }).notNull(),
  emailReminders: boolean('email_reminders').default(true).notNull(),
  reminderDays: text('reminder_days').default('1,3,7').notNull(), // Comma-separated: "1,3,7"
  reminderTime: text('reminder_time').default('08:00').notNull(), // Time in HH:mm format
  birthdayWishEmail: boolean('birthday_wish_email').default(true).notNull(), // Send on actual birthday
  timezone: text('timezone').default('UTC').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const reminderHistory = pgTable('reminder_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }).notNull(),
  reminderType: text('reminder_type').notNull(), // '1day', '3day', '7day', 'birthday'
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  emailSent: boolean('email_sent').default(true).notNull(),
  emailStatus: text('email_status').default('sent').notNull(), // 'sent', 'failed', 'queued'
  errorMessage: text('error_message'),
  contactBirthday: timestamp('contact_birthday').notNull(), // Denormalized for tracking
});

export const emailLogs = pgTable('email_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  recipientEmail: text('recipient_email').notNull(),
  subject: text('subject').notNull(),
  emailType: text('email_type').notNull(), // 'verification', 'reminder', 'birthday_wish', 'welcome', etc.
  status: text('status').default('queued').notNull(), // 'queued', 'sent', 'failed', 'bounced'
  sentAt: timestamp('sent_at'),
  failedAt: timestamp('failed_at'),
  errorMessage: text('error_message'),
  retryCount: text('retry_count').default('0').notNull(),
  metadata: text('metadata'), // JSON string with additional data
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const cardShareTokens = pgTable('card_share_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  cardId: uuid('card_id').references(() => cards.id, { onDelete: 'cascade' }).notNull(),
  shareToken: text('share_token').notNull().unique(), // Secure random token
  viewCount: text('view_count').default('0').notNull(),
  lastViewedAt: timestamp('last_viewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'), // Optional expiration
});

// Refresh tokens for JWT token rotation
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  revokedAt: timestamp('revoked_at'),
});

// Activity logs for security auditing
export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  action: text('action').notNull(), // 'login', 'logout', 'password_change', 'email_change', 'password_reset'
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  metadata: text('metadata'), // JSON string with additional context
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
