-- =========================
-- ADD ROOM TYPE TO ROOMS
-- =========================

-- Create room_type enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'room_type') THEN
        CREATE TYPE public.room_type AS ENUM ('LECTURE', 'LABORATORY');
    END IF;
END$$;

-- Add room_type column to rooms table
ALTER TABLE public.rooms 
ADD COLUMN room_type public.room_type DEFAULT 'LECTURE' NOT NULL;

-- Update RLS policies (optional, but good to ensure they remain consistent)
-- No changes needed to RLS as we are just adding a column and select/insert are permissive.
