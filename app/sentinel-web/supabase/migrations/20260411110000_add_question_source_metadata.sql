ALTER TABLE public.question_bank_questions
    ADD COLUMN IF NOT EXISTS source_origin varchar(20) NOT NULL DEFAULT 'MANUAL',
    ADD COLUMN IF NOT EXISTS source_file_name text,
    ADD COLUMN IF NOT EXISTS source_page_number integer,
    ADD COLUMN IF NOT EXISTS source_evidence text;
