import * as z from "zod";

export const courseSchema = z.object({
    code: z.string().min(2, "Course code is required"),
    title: z.string().min(5, "Course title is required"),
    department: z.string().min(1, "Department is required"),
    description: z.string().optional(),
});

export type CourseFormValues = z.infer<typeof courseSchema>;
