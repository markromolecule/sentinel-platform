import * as z from 'zod';

/**
 * Base classroom create schema.
 * Shared across frontend forms and backend request validation.
 */
export const classroomFormSchema = z.object({
    classGroupId: z.string().uuid('Invalid class group ID'),
    className: z.string().trim().min(1, 'Classroom name is required').max(255),
});

/**
 * Classroom update schema.
 * Rename-only for Phase 1 so the classroom module owns metadata while the
 * underlying class group scope stays unchanged.
 */
export const classroomUpdateFormSchema = z.object({
    className: z.string().trim().min(1, 'Classroom name is required').max(255),
});

export type ClassroomFormValues = z.infer<typeof classroomFormSchema>;
export type ClassroomUpdateFormValues = z.infer<typeof classroomUpdateFormSchema>;
