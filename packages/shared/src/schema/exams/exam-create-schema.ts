import * as z from 'zod';

const MAX_EXAM_DURATION_MINUTES = 240;

const parseLocalDateTime = (value: string) => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const examCreateFormSchema = z
    .object({
        title: z
            .string()
            .min(4, { message: 'Title must be at least 4 characters.' })
            .max(100, { message: 'Title cannot exceed 100 characters.' }),
        description: z
            .string()
            .min(20, { message: 'Description must be at least 20 characters.' })
            .max(250, { message: 'Description cannot exceed 250 characters.' }),
        classroomIds: z
            .array(z.string().uuid({ message: 'Select a valid classroom.' }))
            .min(1, { message: 'Select at least one classroom.' }),
        roomId: z.string().uuid({ message: 'Select a valid room.' }).optional(),
        startDateTime: z.string().min(1, { message: 'Start date and time is required.' }),
        endDateTime: z.string().min(1, { message: 'End date and time is required.' }),
        durationMinutes: z
            .number()
            .min(1, { message: 'Duration is required.' })
            .max(MAX_EXAM_DURATION_MINUTES, {
                message: 'Duration cannot exceed (4 hours) 240 minutes.',
            }),
        passingScore: z
            .number()
            .min(0, { message: 'Passing score cannot be negative.' })
            .max(100, { message: 'Passing score cannot exceed 100.' }),
        shuffleQuestions: z.boolean(),
        showCorrectAnswers: z.boolean(),
        allowReview: z.boolean(),
        randomizeChoices: z.boolean(),
        instructorId: z.string().uuid({ message: 'Select a valid instructor.' }).optional(),
        instructorIds: z.array(z.string().uuid({ message: 'Select a valid instructor.' })).optional(),
    })
    .superRefine((values, context) => {
        const startDateTime = parseLocalDateTime(values.startDateTime);
        const endDateTime = parseLocalDateTime(values.endDateTime);

        if (!startDateTime) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['startDateTime'],
                message: 'Enter a valid start date and time.',
            });
        }

        if (!endDateTime) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['endDateTime'],
                message: 'Enter a valid end date and time.',
            });
        }

        if (!startDateTime || !endDateTime) {
            return;
        }

        const durationMinutes = Math.round(
            (endDateTime.getTime() - startDateTime.getTime()) / 60000,
        );

        if (durationMinutes <= 0) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['endDateTime'],
                message: 'End date and time must be after the start date and time.',
            });
        }

        if (durationMinutes > MAX_EXAM_DURATION_MINUTES) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['endDateTime'],
                message: 'Exam duration cannot exceed 4 hours.',
            });
        }
    });

export type ExamCreateFormValues = z.infer<typeof examCreateFormSchema>;
