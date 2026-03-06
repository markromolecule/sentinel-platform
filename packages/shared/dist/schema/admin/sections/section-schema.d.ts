import * as z from 'zod';
/**
 * Base section body schema.
 * Used for form validation (frontend) AND API body validation (backend).
 */
export declare const sectionSchema: z.ZodObject<{
    name: z.ZodString;
    department_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    course_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    year_level: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type SectionFormValues = z.infer<typeof sectionSchema>;
//# sourceMappingURL=section-schema.d.ts.map