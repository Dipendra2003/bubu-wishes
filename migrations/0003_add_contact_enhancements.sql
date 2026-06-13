-- Add enhanced fields to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS relationship TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS favorite BOOLEAN DEFAULT false;

-- Create index for faster favorite queries
CREATE INDEX IF NOT EXISTS idx_contacts_favorite ON contacts(user_id, favorite) WHERE favorite = true;

-- Create index for relationship filtering
CREATE INDEX IF NOT EXISTS idx_contacts_relationship ON contacts(user_id, relationship);
