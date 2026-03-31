import * as z from 'zod';

/**
 * Base semester body schema.
 * Used for form validation (frontend) AND API body validation (backend).
 * Fields use snake_case matching the database contract.
 */
export const semesterSchema = z.object({
    institution_id: z.string().uuid('Invalid institution ID').optional(),
    academic_year: z.string().min(1, 'Academic year is required'),
    semester: z.string().min(1, 'Semester name is required'),
    is_active: z.boolean().default(false),
    start_date: z.union([z.string(), z.date()]).optional().nullable(),
    end_date: z.union([z.string(), z.date()]).optional().nullable(),
});

export type SemesterFormValues = z.infer<typeof semesterSchema>;
