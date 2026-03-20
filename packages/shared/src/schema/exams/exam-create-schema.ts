import * as z from 'zod';

export const examCreateFormSchema = z.object({
    title: z.string().min(4, { message: 'Title must be at least 4 characters.' }),
    description: z.string().min(20, { message: 'Description must be at least 20 characters.' }),
    subjectId: z.string().min(1, { message: 'Subject is required.' }),
    scheduledDate: z.string().min(1, { message: 'Date is required.' }),
    scheduledTime: z.string().min(1, { message: 'Time is required.' }),
    durationMinutes: z.number().min(1, { message: 'Duration is required.' }),
    passingScore: z.number().min(0).max(100),
    shuffleQuestions: z.boolean(),
    showCorrectAnswers: z.boolean(),
    allowReview: z.boolean(),
    randomizeChoices: z.boolean(),
});

export type ExamCreateFormValues = z.infer<typeof examCreateFormSchema>;
