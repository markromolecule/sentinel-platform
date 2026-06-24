-- Prevent the roles identity sequence from capping at SMALLINT and widen
-- all foreign-key columns that reference roles.role_id.

-- Drop foreign keys before altering the referenced and referencing columns.
ALTER TABLE "public"."class_roles"
DROP CONSTRAINT IF EXISTS "class_roles_role_id_fkey";

ALTER TABLE "public"."rbac_role_permissions"
DROP CONSTRAINT IF EXISTS "rbac_role_permissions_role_id_fkey";

ALTER TABLE "public"."user_roles"
DROP CONSTRAINT IF EXISTS "user_roles_role_id_fkey";

ALTER TABLE "public"."roles"
ALTER COLUMN "role_id" TYPE INTEGER;

ALTER TABLE "public"."class_roles"
ALTER COLUMN "role_id" TYPE INTEGER USING "role_id"::INTEGER;

ALTER TABLE "public"."rbac_role_permissions"
ALTER COLUMN "role_id" TYPE INTEGER USING "role_id"::INTEGER;

ALTER TABLE "public"."user_roles"
ALTER COLUMN "role_id" TYPE INTEGER USING "role_id"::INTEGER;

ALTER SEQUENCE "public"."roles_role_id_seq" AS INTEGER;
ALTER SEQUENCE "public"."roles_role_id_seq" NO MINVALUE NO MAXVALUE;

SELECT setval(
    'public.roles_role_id_seq',
    COALESCE((SELECT MAX("role_id") FROM "public"."roles"), 0) + 1,
    false
);

ALTER TABLE "public"."class_roles"
ADD CONSTRAINT "class_roles_role_id_fkey"
FOREIGN KEY ("role_id")
REFERENCES "public"."roles"("role_id")
ON DELETE NO ACTION
ON UPDATE NO ACTION;

ALTER TABLE "public"."rbac_role_permissions"
ADD CONSTRAINT "rbac_role_permissions_role_id_fkey"
FOREIGN KEY ("role_id")
REFERENCES "public"."roles"("role_id")
ON DELETE CASCADE
ON UPDATE NO ACTION;

ALTER TABLE "public"."user_roles"
ADD CONSTRAINT "user_roles_role_id_fkey"
FOREIGN KEY ("role_id")
REFERENCES "public"."roles"("role_id")
ON DELETE CASCADE
ON UPDATE NO ACTION;
