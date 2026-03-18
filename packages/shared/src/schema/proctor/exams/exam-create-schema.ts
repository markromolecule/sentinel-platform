import * as z from 'zod';

export const examCreateFormSchema = z.object({
    title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
    description: z.string().optional(),
    subject_id: z.string().min(1, { message: 'Subject is required.' }),
    scheduled_date: z.string().optional(),
    scheduled_time: z.string().optional(),
    duration_minutes: z.number().min(1, { message: 'Duration is required.' }),
    passing_score: z.number().min(0).max(100),
    shuffle_questions: z.boolean(),
    show_correct_answers: z.boolean(),
    allow_review: z.boolean(),
    randomize_choices: z.boolean(),
});

export type ExamCreateFormValues = z.infer<typeof examCreateFormSchema>;
