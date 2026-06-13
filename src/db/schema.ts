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
