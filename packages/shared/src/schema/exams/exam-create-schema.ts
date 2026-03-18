import * as z from 'zod';

export const examCreateFormSchema = z.object({
    title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
    description: z.string().optional(),
    subjectId: z.string().min(1, { message: 'Subject is required.' }),
    scheduledDate: z.string().optional(),
    scheduledTime: z.string().optional(),
    durationMinutes: z.number().min(1, { message: 'Duration is required.' }),
    passingScore: z.number().min(0).max(100),
    shuffleQuestions: z.boolean(),
    showCorrectAnswers: z.boolean(),
    allowReview: z.boolean(),
    randomizeChoices: z.boolean(),
});

export type ExamCreateFormValues = z.infer<typeof examCreateFormSchema>;
