import * as z from 'zod';

/**
 * Base course body schema.
 * Used for form validation (frontend) AND API body validation (backend).
 * Fields use snake_case matching the database contract.
 */
export const courseSchema = z.object({
    institution_id: z.string().uuid('Invalid institution ID').optional(),
    code: z.string().min(1, 'Course code is required').max(20),
    title: z.string().min(1, 'Course title is required').max(255),
    department_id: z.string().uuid('Invalid department ID').optional().nullable(),
    description: z.string().optional().nullable(),
});

export type CourseFormValues = z.infer<typeof courseSchema>;
