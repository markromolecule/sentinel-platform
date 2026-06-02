-- AlterEnum
ALTER TYPE "notification_action_type" ADD VALUE 'ANNOUNCEMENT_PUBLISHED';
ALTER TYPE "notification_action_type" ADD VALUE 'ANNOUNCEMENT_UPDATED';

-- AlterEnum
ALTER TYPE "notification_resource_type" ADD VALUE 'ANNOUNCEMENT';

-- AlterTable
ALTER TABLE "announcements" RENAME COLUMN "announcement_id" TO "id";
ALTER TABLE "announcements" ADD COLUMN "deleted_at" TIMESTAMPTZ(6);
ALTER TABLE "announcements" ADD COLUMN "unpublished_at" TIMESTAMPTZ(6);
ALTER TABLE "announcements" ADD COLUMN "slug" VARCHAR(255);

-- Generate slug from title for existing rows
UPDATE "announcements" SET "slug" = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g')) WHERE "slug" IS NULL;
UPDATE "announcements" SET "slug" = id::text WHERE "slug" IS NULL OR "slug" = '';

-- Make slug NOT NULL
ALTER TABLE "announcements" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "announcements_slug_key" ON "announcements"("slug");

-- Drop old columns
ALTER TABLE "announcements" DROP COLUMN IF EXISTS "status";
ALTER TABLE "announcements" DROP COLUMN IF EXISTS "target_audience";

-- Set NOT NULL and default values
ALTER TABLE "announcements" ALTER COLUMN "created_at" SET NOT NULL;
ALTER TABLE "announcements" ALTER COLUMN "updated_at" SET NOT NULL;
ALTER TABLE "announcements" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
