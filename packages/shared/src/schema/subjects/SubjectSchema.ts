import * as z from "zod";

export const subjectFormSchema = z.object({
    code: z.string().min(2, "Code must be at least 2 characters"),
    title: z.string().min(3, "Title must be at least 3 characters"),
    department_ids: z.array(z.string().uuid("Invalid department ID")).default([]),
    course_ids: z.array(z.string().uuid("Invalid course ID")).default([]),
    section_ids: z.array(z.string().uuid("Invalid section ID")).default([]),
    year_levels: z
        .array(
            z
                .coerce
                .number()
                .int()
                .min(1, "Year level must be at least 1")
                .max(6, "Year level must be at most 6"),
        )
        .default([]),
});

export type SubjectFormValues = z.infer<typeof subjectFormSchema>;
