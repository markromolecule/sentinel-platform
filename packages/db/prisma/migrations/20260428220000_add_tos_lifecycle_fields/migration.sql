-- CreateEnum
CREATE TYPE "question_bank_status" AS ENUM ('ACTIVE', 'RETIRED', 'COOLING_OFF', 'ARCHIVED');

-- AlterTable
ALTER TABLE "question_bank_questions" ADD COLUMN     "actual_difficulty" "question_difficulty",
ADD COLUMN     "cognitive_level" TEXT,
ADD COLUMN     "last_used_at" TIMESTAMPTZ(6),
ADD COLUMN     "predicted_difficulty" "question_difficulty",
ADD COLUMN     "status" "question_bank_status" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "topic" TEXT,
ADD COLUMN     "usage_count" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "question_bank_questions_status_idx" ON "question_bank_questions"("status");

-- CreateIndex
CREATE INDEX "question_bank_questions_cognitive_level_idx" ON "question_bank_questions"("cognitive_level");
