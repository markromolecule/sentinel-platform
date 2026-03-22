import * as z from 'zod';

export const examCreateFormSchema = z.object({
    title: z
        .string()
        .min(4, { message: 'Title must be at least 4 characters.' })
        .max(100, { message: 'Title cannot exceed 100 characters.' }),
    description: z
        .string()
        .min(20, { message: 'Description must be at least 20 characters.' })
        .max(250, { message: 'Description cannot exceed 250 characters.' }),
    subjectId: z.string().trim().min(1, { message: 'Subject is required.' }),
    section: z.string().trim().min(1, { message: 'Section is required.' }),
    scheduledDate: z.string().min(1, { message: 'Date is required.' }),
    scheduledTime: z.string().min(1, { message: 'Time is required.' }),
    durationMinutes: z
        .number()
        .min(1, { message: 'Duration is required.' })
        .max(240, { message: 'Duration cannot exceed (4 hours) 240 minutes.' }),
    passingScore: z
        .number()
        .min(0, { message: 'Passing score cannot be negative.' })
        .max(100, { message: 'Passing score cannot exceed 100.' }),
    shuffleQuestions: z.boolean(),
    showCorrectAnswers: z.boolean(),
    allowReview: z.boolean(),
    randomizeChoices: z.boolean(),
});

export type ExamCreateFormValues = z.infer<typeof examCreateFormSchema>;
