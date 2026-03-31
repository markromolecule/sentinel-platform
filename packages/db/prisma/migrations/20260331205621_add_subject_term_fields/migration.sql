ALTER TABLE "public"."subjects"
ADD COLUMN "term_id" UUID,
ADD COLUMN "is_opened" BOOLEAN DEFAULT false,
ADD COLUMN "offering_start_date" TIMESTAMPTZ(6),
ADD COLUMN "offering_end_date" TIMESTAMPTZ(6);

CREATE INDEX "subjects_term_id_idx" ON "public"."subjects" ("term_id");

ALTER TABLE "public"."subjects"
ADD CONSTRAINT "subjects_term_id_fkey"
FOREIGN KEY ("term_id") REFERENCES "public"."terms"("term_id")
ON DELETE SET NULL
ON UPDATE NO ACTION;
