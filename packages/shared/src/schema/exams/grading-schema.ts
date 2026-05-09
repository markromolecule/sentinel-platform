import { z } from 'zod';

export const gradingStatusSchema = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']);
export const submissionStatusSchema = z.enum(['NOT_SUBMITTED', 'SUBMITTED', 'GRADED']);

export const gradingExamSchema = z.object({
    id: z.string().uuid(),
    title: z.string(),
    subject: z.string(),
    scheduledDate: z.string().nullable(),
    totalStudents: z.number().int().min(0),
    submittedCount: z.number().int().min(0),
    gradedCount: z.number().int().min(0),
    status: gradingStatusSchema,
    sectionIds: z.array(z.string().uuid()),
    sectionNames: z.array(z.string()),
});

export const gradingStudentSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    studentId: z.string(),
    sectionId: z.string().uuid().nullable(),
    sectionName: z.string().nullable(),
    submissionDate: z.string().nullable(),
    score: z.number().int().nullable(),
    maxScore: z.number().int().min(0),
    status: submissionStatusSchema,
    attemptId: z.string().uuid().nullable().optional(),
    feedback: z.string().optional(),
});

export const gradingStudentSectionSchema = z.object({
    sectionId: z.string().uuid().nullable(),
    sectionName: z.string().nullable(),
    totalStudents: z.number().int().min(0),
    submittedCount: z.number().int().min(0),
    gradedCount: z.number().int().min(0),
    students: z.array(gradingStudentSchema),
});

export const gradingStudentListSchema = z.object({
    students: z.array(gradingStudentSchema),
    sections: z.array(gradingStudentSectionSchema),
});

export type GradingExamType = z.infer<typeof gradingExamSchema>;
export type GradingStudentType = z.infer<typeof gradingStudentSchema>;
export type GradingStudentSectionType = z.infer<typeof gradingStudentSectionSchema>;
export type GradingStudentListType = z.infer<typeof gradingStudentListSchema>;
