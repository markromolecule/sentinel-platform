-- AlterTable roles
ALTER TABLE "public"."roles" ADD COLUMN "permission_sync_mode" VARCHAR(20) NOT NULL DEFAULT 'BLUEPRINT';

-- Backfill roles
UPDATE "public"."roles" SET "permission_sync_mode" = 'CUSTOM' WHERE "is_system" = false OR "is_system" IS NULL;
UPDATE "public"."roles" SET "permission_sync_mode" = 'BLUEPRINT' WHERE "is_system" = true;

-- Drop defaults from exams
ALTER TABLE "public"."exams" ALTER COLUMN "passing_score" DROP DEFAULT;

-- Drop defaults from exam_configurations
ALTER TABLE "public"."exam_configurations" 
  ALTER COLUMN "shuffle_questions" DROP DEFAULT,
  ALTER COLUMN "show_correct_answers" DROP DEFAULT,
  ALTER COLUMN "allow_review" DROP DEFAULT,
  ALTER COLUMN "randomize_choices" DROP DEFAULT,
  ALTER COLUMN "lobby_admission_mode" DROP DEFAULT,
  ALTER COLUMN "max_reconnect_attempts" DROP DEFAULT,
  ALTER COLUMN "strict_mode" DROP DEFAULT,
  ALTER COLUMN "camera_required" DROP DEFAULT,
  ALTER COLUMN "mic_required" DROP DEFAULT,
  ALTER COLUMN "screen_lock" DROP DEFAULT,
  ALTER COLUMN "auto_submit_timeout_minutes" DROP DEFAULT;
