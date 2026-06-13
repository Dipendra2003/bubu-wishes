-- Add imageUrl column to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS image_url TEXT;
