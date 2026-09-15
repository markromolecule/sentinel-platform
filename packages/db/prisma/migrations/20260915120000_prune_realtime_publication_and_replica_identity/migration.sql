-- Migration: 20260915120000_prune_realtime_publication_and_replica_identity
-- Description: Revert unnecessary REPLICA IDENTITY FULL to DEFAULT on exam_lobby_admissions, notifications, messages, and conversation_participants.
-- Drop exam_lobby_admissions from supabase_realtime publication to eliminate WAL amplification and multi-second stalls in realtime.list_changes.

-- 1. Revert exam_lobby_admissions from REPLICA IDENTITY FULL to DEFAULT
ALTER TABLE "public"."exam_lobby_admissions" REPLICA IDENTITY DEFAULT;

-- 2. Drop exam_lobby_admissions from supabase_realtime publication (Lobby sync uses in-memory REST Broadcasts)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'exam_lobby_admissions'
    ) THEN
        ALTER PUBLICATION supabase_realtime DROP TABLE "public"."exam_lobby_admissions";
    END IF;
END
$$;

-- 3. Revert notifications from REPLICA IDENTITY FULL to DEFAULT (Client listeners only trigger query invalidations)
ALTER TABLE "public"."notifications" REPLICA IDENTITY DEFAULT;

-- 4. Revert messages & conversation_participants from REPLICA IDENTITY FULL to DEFAULT (Primary keys suffice for cache mutations)
ALTER TABLE "public"."messages" REPLICA IDENTITY DEFAULT;
ALTER TABLE "public"."conversation_participants" REPLICA IDENTITY DEFAULT;
