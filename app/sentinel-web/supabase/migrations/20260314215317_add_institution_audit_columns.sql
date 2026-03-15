-- Add audit columns to institutions table
ALTER TABLE "public"."institutions" ADD COLUMN "created_by" uuid;
ALTER TABLE "public"."institutions" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();
ALTER TABLE "public"."institutions" ADD COLUMN "updated_by" uuid;
