import * as z from 'zod';
export declare const sectionSchema: z.ZodObject<{
    courseId: z.ZodString;
    name: z.ZodString;
    department: z.ZodString;
    yearLevel: z.ZodString;
}, z.core.$strip>;
export type SectionFormValues = z.infer<typeof sectionSchema>;
//# sourceMappingURL=section-schema.d.ts.map