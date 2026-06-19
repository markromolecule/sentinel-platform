-- Create explicit exam sharing table.
CREATE TABLE "public"."exam_shares" (
    "exam_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW(),
    CONSTRAINT "exam_shares_pkey" PRIMARY KEY ("exam_id", "user_id"),
    CONSTRAINT "exam_shares_exam_id_fkey"
        FOREIGN KEY ("exam_id")
        REFERENCES "public"."exams" ("exam_id")
        ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "exam_shares_user_id_fkey"
        FOREIGN KEY ("user_id")
        REFERENCES "auth"."users" ("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
);
