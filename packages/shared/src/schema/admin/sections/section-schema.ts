import * as z from 'zod';

export const sectionSchema = z.object({
    courseId: z.string().min(1, 'Course is required'),
    name: z.string().min(2, 'Section name is required (e.g., INF231)'),
    department: z.string().min(1, 'Department is required'),
    yearLevel: z.string().min(1, 'Year level is required'),
});

export type SectionFormValues = z.infer<typeof sectionSchema>;
