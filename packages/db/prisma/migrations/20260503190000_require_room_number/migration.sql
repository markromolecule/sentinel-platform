-- Backfill room_number from the existing room_name before enforcing required room numbers.
UPDATE "public"."rooms"
SET "room_number" = LEFT(TRIM("room_name"), 50)
WHERE "room_number" IS NULL
  AND "room_name" IS NOT NULL
  AND TRIM("room_name") <> '';

-- Any remaining blank room_number values are invalid for new room-number based naming.
UPDATE "public"."rooms"
SET "room_number" = "room_id"::text
WHERE "room_number" IS NULL
   OR TRIM("room_number") = '';

ALTER TABLE "public"."rooms"
ALTER COLUMN "room_number" SET NOT NULL;
