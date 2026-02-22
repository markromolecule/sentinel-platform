import * as z from 'zod';
import type { ExamQuestion } from '@sentinel/shared/types';

// ────────────────────────────────────────────────────────────────────
// Form Schemas
// ────────────────────────────────────────────────────────────────────

export const examCreateFormSchema = z.object({
    title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
    description: z.string().optional(),
    subject_id: z.string().min(1, { message: 'Subject is required.' }),
    duration_minutes: z.number().min(5, { message: 'Duration must be at least 5 minutes.' }),
    passing_score: z.number().min(0, { message: 'Passing score cannot be negative.' }),
    difficulty: z.string().optional(),
    scheduled_date: z.date(),
    scheduled_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'Time must be in HH:mm format.',
    }),
});

export type ExamCreateFormValues = z.infer<typeof examCreateFormSchema>;

// ────────────────────────────────────────────────────────────────────
// Component Prop Types
// ────────────────────────────────────────────────────────────────────

export type ExamCreateDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export type ExamCreateFormProps = {
    onClose: () => void;
};

export type ExamAssignDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    examTitle: string;
};

export type ExamActionCellProps = {
    exam: import('@sentinel/shared/types').ProctorExam;
};

export type QuestionCardProps = {
    question: ExamQuestion;
    isActive: boolean;
    onActivate: () => void;
};

export type QuestionFormProps = {
    content: import('@sentinel/shared/types').ExamQuestionContent;
    onChange: (updates: Partial<import('@sentinel/shared/types').ExamQuestionContent>) => void;
};
