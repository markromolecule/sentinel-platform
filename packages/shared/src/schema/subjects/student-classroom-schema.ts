import * as z from 'zod';

export const studentClassroomSchema = z.object({
    id: z.string().uuid(),
    subjectId: z.string().uuid(),
    subjectCode: z.string(),
    subjectTitle: z.string(),
    sectionId: z.string().uuid(),
    sectionName: z.string(),
    termId: z.string().uuid(),
    term: z.string(),
    instructorName: z.string().nullable(),
    enrolledAt: z.union([z.coerce.date(), z.string()]).nullable(),
});

export type StudentClassroom = z.infer<typeof studentClassroomSchema>;
