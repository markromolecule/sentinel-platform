-- Rollback: 20260915120000_prune_realtime_publication_and_replica_identity
-- Description: Re-enable REPLICA IDENTITY FULL and re-add exam_lobby_admissions to supabase_realtime publication if required.

ALTER TABLE "public"."exam_lobby_admissions" REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_publication
        WHERE pubname = 'supabase_realtime'
    ) AND NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'exam_lobby_admissions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE "public"."exam_lobby_admissions";
    END IF;
END
$$;

ALTER TABLE "public"."notifications" REPLICA IDENTITY FULL;
ALTER TABLE "public"."messages" REPLICA IDENTITY FULL;
ALTER TABLE "public"."conversation_participants" REPLICA IDENTITY FULL;
