import * as z from 'zod';
/**
 * Base course body schema.
 * Used for form validation (frontend) AND API body validation (backend).
 * Fields use snake_case matching the database contract.
 */
export declare const courseSchema: z.ZodObject<{
    code: z.ZodString;
    title: z.ZodString;
    department_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type CourseFormValues = z.infer<typeof courseSchema>;
//# sourceMappingURL=course-schema.d.ts.map