import * as z from 'zod';

export const institutionSchema = z.object({
    name: z
        .string()
        .min(1, 'Institution name is required')
        .max(100, 'Institution name must not exceed 100 characters'),
    code: z
        .string()
        .min(1, 'Institution code is required')
        .max(10, 'Institution code must not exceed 10 characters'),
});

export type InstitutionFormValues = z.infer<typeof institutionSchema>;
