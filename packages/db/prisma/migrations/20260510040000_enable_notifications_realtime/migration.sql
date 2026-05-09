ALTER TABLE "public"."notifications" REPLICA IDENTITY FULL;

ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policy
        WHERE polrelid = 'public.notifications'::regclass
          AND polname = 'notifications_recipient_select'
    ) THEN
        CREATE POLICY "notifications_recipient_select"
        ON "public"."notifications"
        FOR SELECT
        TO authenticated
        USING (auth.uid() = recipient_user_id);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE "public"."notifications";
    END IF;
END
$$;
