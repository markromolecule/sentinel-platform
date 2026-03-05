import * as z from 'zod';

/**
 * Base section body schema.
 * Used for form validation (frontend) AND API body validation (backend).
 */
export const sectionSchema = z.object({
    name: z.string().min(2, 'Section name is required (e.g., INF231)'),
    departmentId: z.string().uuid('Invalid department ID').optional().nullable(),
    courseId: z.string().uuid('Invalid course ID').optional().nullable(),
    yearLevel: z.coerce.number().optional(),
});

export type SectionFormValues = z.infer<typeof sectionSchema>;
