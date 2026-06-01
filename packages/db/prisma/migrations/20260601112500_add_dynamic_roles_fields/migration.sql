-- AlterTable
ALTER TABLE "public"."roles" ADD COLUMN "slug" VARCHAR(50);
ALTER TABLE "public"."roles" ADD COLUMN "domain_scope" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "public"."roles" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "public"."roles" ADD COLUMN "assignable_by" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "roles_slug_key" ON "public"."roles"("slug");
