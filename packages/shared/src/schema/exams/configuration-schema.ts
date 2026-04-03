import * as z from 'zod';
import { examConfigurationSchema, examSettingsSchema } from './assessment-schema';

export const examConfigurationStateSchema = z.object({
    settings: examSettingsSchema,
    configuration: examConfigurationSchema,
});

export const examConfigurationParamsSchema = z.object({
    examId: z.string().uuid(),
});

export const updateExamConfigurationBodySchema = z.object({
    shuffleQuestions: z.boolean().optional(),
    showCorrectAnswers: z.boolean().optional(),
    allowReview: z.boolean().optional(),
    randomizeChoices: z.boolean().optional(),
    settings: examSettingsSchema.partial().optional(),
    configuration: examConfigurationSchema.partial().optional(),
});
