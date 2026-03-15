import * as z from 'zod';

/**
 * Base department body schema.
 * Used for form validation (frontend) AND API body validation (backend).
 * Fields use snake_case matching the database contract.
 */
export const departmentSchema = z.object({
    institution_id: z.uuid('Invalid institution ID').optional(),
    name: z.string().min(1, 'Department name is required'),
    code: z.string().optional(),
});

export type DepartmentFormValues = z.infer<typeof departmentSchema>;
