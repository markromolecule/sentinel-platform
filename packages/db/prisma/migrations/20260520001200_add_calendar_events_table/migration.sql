-- CreateEnum
CREATE TYPE "public"."calendar_event_type" AS ENUM ('EVENT', 'ANNOUNCEMENT', 'MAINTENANCE', 'HOLIDAY', 'NOTE');

-- CreateEnum
CREATE TYPE "public"."calendar_event_audience" AS ENUM ('ALL', 'STUDENTS', 'INSTRUCTORS', 'ADMINS', 'SPECIFIC_GROUP');

-- CreateTable
CREATE TABLE "public"."calendar_events" (
    "event_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "institution_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "event_type" "public"."calendar_event_type" NOT NULL DEFAULT 'EVENT',
    "target_audience" "public"."calendar_event_audience" NOT NULL DEFAULT 'ALL',
    "start_date" TIMESTAMPTZ(6) NOT NULL,
    "end_date" TIMESTAMPTZ(6),
    "start_time" VARCHAR(10),
    "end_time" VARCHAR(10),
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("event_id")
);

-- CreateIndex
CREATE INDEX "calendar_events_institution_id_start_date_idx" ON "public"."calendar_events"("institution_id", "start_date");

-- AddForeignKey
ALTER TABLE "public"."calendar_events" ADD CONSTRAINT "calendar_events_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."calendar_events" ADD CONSTRAINT "calendar_events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."calendar_events" ADD CONSTRAINT "calendar_events_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
