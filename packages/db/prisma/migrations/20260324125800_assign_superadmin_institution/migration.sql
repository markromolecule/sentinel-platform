DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') AND EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'institutions') THEN
        UPDATE "public"."user_profiles"
        SET "institution_id" = (SELECT "id" FROM "public"."institutions" LIMIT 1)
        WHERE "user_id" = '12114abb-a8e3-41e3-bc25-b258b10e3ce4'
          AND "institution_id" IS NULL;

        INSERT INTO "public"."user_profiles" ("user_id", "first_name", "last_name", "institution_id", "status", "created_at", "updated_at")
        SELECT 
            '12114abb-a8e3-41e3-bc25-b258b10e3ce4', 
            'Superadmin', 
            '', 
            (SELECT "id" FROM "public"."institutions" LIMIT 1),
            'ACTIVE',
            NOW(),
            NOW()
        WHERE NOT EXISTS (
            SELECT 1 FROM "public"."user_profiles" WHERE "user_id" = '12114abb-a8e3-41e3-bc25-b258b10e3ce4'
        ) AND EXISTS (
            SELECT 1 FROM "public"."institutions" LIMIT 1
        );
    END IF;
END
$$;
