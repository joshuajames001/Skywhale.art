-- Migration: Add language support
-- Date: 2026-02-08
-- Description: Adds a 'language' column to books, greeting_cards, and achievements to support multi-language content.

-- 1. Update 'books' table
ALTER TABLE books ADD COLUMN IF NOT EXISTS language text DEFAULT 'cs';
COMMENT ON COLUMN books.language IS 'The language the book was generated in (e.g., cs, en)';

-- 2. Update 'greeting_cards' table (if exists)
-- Assuming the table name based on common patterns in the project
DO $$ 
BEGIN 
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'greeting_cards') THEN
        ALTER TABLE greeting_cards ADD COLUMN IF NOT EXISTS language text DEFAULT 'cs';
    END IF;
END $$;

-- 3. Update 'achievements' table
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS language text DEFAULT 'cs';
COMMENT ON COLUMN achievements.language IS 'The language the achievement is displayed in';

-- 4. Create an index for language filtering performance
CREATE INDEX IF NOT EXISTS idx_books_language ON books(language);
CREATE INDEX IF NOT EXISTS idx_achievements_language ON achievements(language);

-- 5. Backfill existing records (if any were created without default)
UPDATE books SET language = 'cs' WHERE language IS NULL;
UPDATE achievements SET language = 'cs' WHERE language IS NULL;
