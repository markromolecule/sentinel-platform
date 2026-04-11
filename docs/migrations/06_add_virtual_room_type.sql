-- =========================
-- ADD VIRTUAL TO ROOM TYPE
-- =========================

-- Add VIRTUAL to room_type enum
-- Note: ALTER TYPE ... ADD VALUE cannot be executed inside a transaction block in some Postgres versions, 
-- but since this is a migration script we usually run them individually or handle transactions accordingly.
ALTER TYPE public.room_type ADD VALUE 'VIRTUAL';
