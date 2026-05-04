-- AlterTable
ALTER TABLE "public"."institution_naming_conventions" DROP COLUMN "course_id_format";

-- AlterTable
ALTER TABLE "public"."rooms" ADD COLUMN "room_number" VARCHAR(50);
