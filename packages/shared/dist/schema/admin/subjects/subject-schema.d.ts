import * as z from "zod";
export declare const subjectFormSchema: z.ZodObject<{
    code: z.ZodString;
    title: z.ZodString;
    section: z.ZodOptional<z.ZodString>;
    department: z.ZodString;
    yearLevel: z.ZodString;
}, z.core.$strip>;
export type SubjectFormValues = z.infer<typeof subjectFormSchema>;
//# sourceMappingURL=subject-schema.d.ts.map