ALTER TABLE books ADD COLUMN IF NOT EXISTS style_manifest text;
ALTER TABLE books ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';
