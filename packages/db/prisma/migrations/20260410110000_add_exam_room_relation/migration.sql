ALTER TABLE "public"."exams"
ADD COLUMN "room_id" UUID;

CREATE INDEX "exams_room_id_idx" ON "public"."exams" ("room_id");

ALTER TABLE "public"."exams"
ADD CONSTRAINT "exams_room_id_fkey"
FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("room_id")
ON DELETE SET NULL
ON UPDATE NO ACTION;
