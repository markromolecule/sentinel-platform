-- Create explicit collection sharing table.
CREATE TABLE "public"."question_bank_collection_shares" (
    "collection_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW(),
    CONSTRAINT "question_bank_collection_shares_pkey" PRIMARY KEY ("collection_id", "user_id"),
    CONSTRAINT "question_bank_collection_shares_collection_id_fkey"
        FOREIGN KEY ("collection_id")
        REFERENCES "public"."question_bank_collections" ("collection_id")
        ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "question_bank_collection_shares_user_id_fkey"
        FOREIGN KEY ("user_id")
        REFERENCES "auth"."users" ("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
);
