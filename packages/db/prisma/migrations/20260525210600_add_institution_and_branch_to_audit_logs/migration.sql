-- AlterTable
ALTER TABLE "public"."audit_logs" ADD COLUMN "institution_id" UUID,
ADD COLUMN "branch_id" UUID;

-- CreateIndex
CREATE INDEX "audit_logs_institution_id_idx" ON "public"."audit_logs"("institution_id");

-- CreateIndex
CREATE INDEX "audit_logs_branch_id_idx" ON "public"."audit_logs"("branch_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "public"."audit_logs"("created_at");
