INSERT INTO "public"."roles" ("role_name")
SELECT 'support'
WHERE NOT EXISTS (
    SELECT 1
    FROM "public"."roles"
    WHERE "role_name" = 'support'
);
