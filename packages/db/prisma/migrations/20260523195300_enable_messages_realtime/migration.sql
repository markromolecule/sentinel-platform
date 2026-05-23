-- Migration: Enable Messages Realtime & Row-Level Security (RLS)
-- Created At: 2026-05-23T19:53:00Z
-- Description: Sets up indexes, enables RLS, creates participant-scoped select policies, and registers tables in the supabase_realtime publication.

-- ─── 1. REPLICA IDENTITY FULL (Required for Supabase Realtime updates) ─────────
ALTER TABLE "public"."messages" REPLICA IDENTITY FULL;
ALTER TABLE "public"."conversation_participants" REPLICA IDENTITY FULL;

-- ─── 2. INDEXES (To optimize chat list and message history queries) ─────────────
CREATE INDEX IF NOT EXISTS "idx_messages_conversation_id" ON "public"."messages"("conversation_id");
CREATE INDEX IF NOT EXISTS "idx_messages_created_at" ON "public"."messages"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_conversation_participants_user_id" ON "public"."conversation_participants"("user_id");

-- ─── 3. ROW LEVEL SECURITY (Enable security controls) ──────────────────────────
ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."conversation_participants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;

-- ─── 4. SELECT POLICIES (Enforce conversation participant boundary) ────────────

-- Only allow conversation participants to read conversations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polrelid = 'public.conversations'::regclass 
          AND polname = 'conversations_participant_select'
    ) THEN
        CREATE POLICY "conversations_participant_select"
        ON "public"."conversations"
        FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM "public"."conversation_participants" cp
                WHERE cp.conversation_id = conversation_id
                  AND cp.user_id = auth.uid()
            )
        );
    END IF;
END
$$;

-- Only allow conversation participants to read participant lists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polrelid = 'public.conversation_participants'::regclass 
          AND polname = 'conversation_participants_select'
    ) THEN
        CREATE POLICY "conversation_participants_select"
        ON "public"."conversation_participants"
        FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM "public"."conversation_participants" cp
                WHERE cp.conversation_id = conversation_id
                  AND cp.user_id = auth.uid()
            )
        );
    END IF;
END
$$;

-- Only allow conversation participants to read messages
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polrelid = 'public.messages'::regclass 
          AND polname = 'messages_participant_select'
    ) THEN
        CREATE POLICY "messages_participant_select"
        ON "public"."messages"
        FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM "public"."conversation_participants" cp
                WHERE cp.conversation_id = conversation_id
                  AND cp.user_id = auth.uid()
            )
        );
    END IF;
END
$$;

-- ─── 5. SUPABASE REALTIME PUBLICATION ───────────────────────────────────────────

-- Add messages to realtime publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
          AND schemaname = 'public' 
          AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE "public"."messages";
    END IF;
END
$$;

-- Add conversation_participants to realtime publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
          AND schemaname = 'public' 
          AND tablename = 'conversation_participants'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE "public"."conversation_participants";
    END IF;
END
$$;


-- ─── ROLLBACK SQL ──────────────────────────────────────────────────────────────
-- ALTER PUBLICATION supabase_realtime DROP TABLE "public"."messages";
-- ALTER PUBLICATION supabase_realtime DROP TABLE "public"."conversation_participants";
-- DROP POLICY IF EXISTS "messages_participant_select" ON "public"."messages";
-- DROP POLICY IF EXISTS "conversation_participants_select" ON "public"."conversation_participants";
-- DROP POLICY IF EXISTS "conversations_participant_select" ON "public"."conversations";
-- ALTER TABLE "public"."messages" DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE "public"."conversation_participants" DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE "public"."conversations" DISABLE ROW LEVEL SECURITY;
-- DROP INDEX IF EXISTS "idx_conversation_participants_user_id";
-- DROP INDEX IF EXISTS "idx_messages_created_at";
-- DROP INDEX IF EXISTS "idx_messages_conversation_id";
