-- AlterTable
ALTER TABLE "analytics_reports" 
  ADD COLUMN "institution_id" UUID,
  ADD COLUMN "period_start_at" TIMESTAMPTZ(6),
  ADD COLUMN "period_end_at" TIMESTAMPTZ(6),
  ADD COLUMN "timezone" VARCHAR(50),
  ADD COLUMN "template_id" UUID,
  ADD COLUMN "template_snapshot" JSONB,
  ADD COLUMN "storage_bucket" VARCHAR(100),
  ADD COLUMN "storage_path" VARCHAR(255),
  ADD COLUMN "failure_code" VARCHAR(50),
  ADD COLUMN "failure_message" TEXT,
  ADD COLUMN "started_at" TIMESTAMPTZ(6),
  ADD COLUMN "completed_at" TIMESTAMPTZ(6),
  ADD COLUMN "expires_at" TIMESTAMPTZ(6),
  ADD COLUMN "retry_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "request_snapshot" JSONB;

-- CreateTable
CREATE TABLE "pdf_templates" (
  "template_id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "institution_id" UUID,
  "document_kind" VARCHAR(50) NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "status" VARCHAR(20) NOT NULL,
  "header_config" JSONB NOT NULL,
  "footer_config" JSONB NOT NULL,
  "created_by" UUID,
  "updated_by" UUID,
  "published_by" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "published_at" TIMESTAMPTZ(6),

  CONSTRAINT "pdf_templates_pkey" PRIMARY KEY ("template_id")
);

-- CreateTable
CREATE TABLE "institution_pdf_branding" (
  "institution_id" UUID NOT NULL,
  "logo_storage_bucket" VARCHAR(100) NOT NULL,
  "logo_storage_path" VARCHAR(255) NOT NULL,
  "logo_mime_type" VARCHAR(100) NOT NULL,
  "logo_size_bytes" INTEGER NOT NULL,
  "logo_hash_sha256" VARCHAR(64) NOT NULL,
  "logo_original_name" VARCHAR(255) NOT NULL,
  "updated_by" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "institution_pdf_branding_pkey" PRIMARY KEY ("institution_id")
);

-- CreateTable
CREATE TABLE "exam_answer_key_exports" (
  "export_id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "exam_id" UUID NOT NULL,
  "institution_id" UUID NOT NULL,
  "template_id" UUID NOT NULL,
  "template_snapshot" JSONB NOT NULL,
  "storage_bucket" VARCHAR(100),
  "storage_path" VARCHAR(255),
  "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  "failure_code" VARCHAR(50),
  "failure_message" TEXT,
  "retry_count" INTEGER NOT NULL DEFAULT 0,
  "request_snapshot" JSONB,
  "created_by" UUID,
  "started_at" TIMESTAMPTZ(6),
  "completed_at" TIMESTAMPTZ(6),
  "expires_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "exam_answer_key_exports_pkey" PRIMARY KEY ("export_id")
);

-- CreateIndex
CREATE INDEX "pdf_templates_institution_id_idx" ON "pdf_templates"("institution_id");
CREATE INDEX "pdf_templates_document_kind_idx" ON "pdf_templates"("document_kind");
CREATE INDEX "pdf_templates_status_idx" ON "pdf_templates"("status");

-- Partial Unique Indexes for Published Templates
CREATE UNIQUE INDEX "pdf_templates_global_published_unique" 
  ON "pdf_templates"("document_kind") 
  WHERE "institution_id" IS NULL AND "status" = 'PUBLISHED';

CREATE UNIQUE INDEX "pdf_templates_institution_published_unique" 
  ON "pdf_templates"("institution_id", "document_kind") 
  WHERE "institution_id" IS NOT NULL AND "status" = 'PUBLISHED';

-- CreateIndex
CREATE INDEX "exam_answer_key_exports_exam_id_idx" ON "exam_answer_key_exports"("exam_id");
CREATE INDEX "exam_answer_key_exports_institution_id_idx" ON "exam_answer_key_exports"("institution_id");
CREATE INDEX "exam_answer_key_exports_template_id_idx" ON "exam_answer_key_exports"("template_id");

-- CreateIndex
CREATE INDEX "analytics_reports_institution_id_idx" ON "analytics_reports"("institution_id");
CREATE INDEX "analytics_reports_template_id_idx" ON "analytics_reports"("template_id");

-- AddForeignKey
ALTER TABLE "pdf_templates" 
  ADD CONSTRAINT "pdf_templates_institution_id_fkey" 
  FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pdf_templates" 
  ADD CONSTRAINT "pdf_templates_created_by_fkey" 
  FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pdf_templates" 
  ADD CONSTRAINT "pdf_templates_updated_by_fkey" 
  FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pdf_templates" 
  ADD CONSTRAINT "pdf_templates_published_by_fkey" 
  FOREIGN KEY ("published_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_pdf_branding" 
  ADD CONSTRAINT "institution_pdf_branding_institution_id_fkey" 
  FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "institution_pdf_branding" 
  ADD CONSTRAINT "institution_pdf_branding_updated_by_fkey" 
  FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_answer_key_exports" 
  ADD CONSTRAINT "exam_answer_key_exports_exam_id_fkey" 
  FOREIGN KEY ("exam_id") REFERENCES "exams"("exam_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_answer_key_exports" 
  ADD CONSTRAINT "exam_answer_key_exports_institution_id_fkey" 
  FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_answer_key_exports" 
  ADD CONSTRAINT "exam_answer_key_exports_template_id_fkey" 
  FOREIGN KEY ("template_id") REFERENCES "pdf_templates"("template_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_answer_key_exports" 
  ADD CONSTRAINT "exam_answer_key_exports_created_by_fkey" 
  FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_reports" 
  ADD CONSTRAINT "analytics_reports_institution_id_fkey" 
  FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_reports" 
  ADD CONSTRAINT "analytics_reports_template_id_fkey" 
  FOREIGN KEY ("template_id") REFERENCES "pdf_templates"("template_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill analytics_reports.institution_id from creator's profile
UPDATE "analytics_reports" r
SET "institution_id" = p."institution_id"
FROM "user_profiles" p
WHERE r."created_by" = p."user_id"
  AND p."institution_id" IS NOT NULL;

-- Mark unresolved legacy placeholder rows EXPIRED
UPDATE "analytics_reports"
SET "status" = 'EXPIRED'
WHERE "institution_id" IS NULL;

-- Setup private storage buckets idempotently if storage schema exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'storage' 
          AND table_name   = 'buckets'
    ) THEN
        INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
        VALUES 
          ('sentinel-pdf-artifacts', 'sentinel-pdf-artifacts', false, ARRAY['application/pdf']::text[], 20971520),
          ('sentinel-pdf-assets', 'sentinel-pdf-assets', false, ARRAY['image/png', 'image/jpeg', 'image/webp']::text[], 2097152)
        ON CONFLICT (id) DO UPDATE SET
          public = EXCLUDED.public,
          allowed_mime_types = EXCLUDED.allowed_mime_types,
          file_size_limit = EXCLUDED.file_size_limit;
    END IF;
END $$;
