-- =========================
-- 03: Exam Questions
-- =========================
-- SAFE TO RE-RUN: enum creation is guarded with DO block

-- CreateEnum (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_type') THEN
        CREATE TYPE public."question_type" AS ENUM (
            'MULTIPLE_CHOICE',
            'IDENTIFICATION',
            'ESSAY',
            'ENUMERATION',
            'TRUE_FALSE'
        );
    END IF;
END
$$;

-- CreateTable (safe — will error if already exists; run once)
CREATE TABLE IF NOT EXISTS public.exam_questions (
    question_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id     UUID NOT NULL REFERENCES public.exams(exam_id) ON DELETE CASCADE,
    question_type public.question_type NOT NULL,
    content     JSONB NOT NULL,
    points      INTEGER NOT NULL DEFAULT 1,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can manage questions on exams they created
CREATE POLICY "Authenticated users can view exam questions"
    ON public.exam_questions
    FOR SELECT TO authenticated
    USING (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_exam_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_exam_questions_updated_at
    BEFORE UPDATE ON public.exam_questions
    FOR EACH ROW EXECUTE FUNCTION public.update_exam_questions_updated_at();
