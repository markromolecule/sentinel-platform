import * as z from 'zod';
/**
 * Base section body schema.
 * Used for form validation (frontend) AND API body validation (backend).
 */
export declare const sectionSchema: z.ZodObject<{
    name: z.ZodString;
    departmentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    courseId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    yearLevel: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type SectionFormValues = z.infer<typeof sectionSchema>;
//# sourceMappingURL=section-schema.d.ts.map