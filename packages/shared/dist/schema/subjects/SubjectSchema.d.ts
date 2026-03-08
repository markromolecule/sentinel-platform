import * as z from "zod";
export declare const subjectFormSchema: z.ZodObject<{
    code: z.ZodString;
    title: z.ZodString;
    department_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
    course_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
    section_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
    year_levels: z.ZodDefault<z.ZodArray<z.ZodCoercedNumber<unknown>>>;
}, z.core.$strip>;
export type SubjectFormValues = z.infer<typeof subjectFormSchema>;
//# sourceMappingURL=SubjectSchema.d.ts.map