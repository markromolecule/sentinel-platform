import * as z from 'zod';

export const institutionSchema = z.object({
    name: z.string().min(1, 'Institution name is required'),
    code: z.string().min(1, 'Institution code is required'),
});

export type InstitutionFormValues = z.infer<typeof institutionSchema>;
