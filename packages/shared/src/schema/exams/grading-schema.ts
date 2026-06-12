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

export const attemptGradingDetailSchema = z.object({
    attemptId: z.string().uuid(),
    examId: z.string().uuid().nullable(),
    examTitle: z.string(),
    subjectTitle: z.string(),
    studentId: z.string().uuid().nullable(),
    studentName: z.string(),
    studentNumber: z.string(),
    completedAt: z.string().nullable(),
    score: z.number().nullable(),
    totalScore: z.number().nullable(),
    status: z.string().nullable(),
    answers: z.record(z.string(), z.any()),
    evaluations: z.record(z.string(), z.any()),
    feedback: z.string().nullable(),
});

export const gradingQuestionSchema = z.object({
    id: z.string().uuid(),
    examId: z.string().uuid(),
    type: z.string(),
    content: z.record(z.string(), z.any()),
    points: z.number(),
    orderIndex: z.number(),
});

export const updateGradingAttemptBodySchema = z.object({
    evaluations: z.record(
        z.string().uuid(),
        z.object({
            scores: z.object({
                contentSubstance: z.number().int().min(0).max(4),
                structureOrganization: z.number().int().min(0).max(4),
                argumentationSupport: z.number().int().min(0).max(4),
                styleTone: z.number().int().min(0).max(4),
                grammarConventions: z.number().int().min(0).max(4),
            }),
            feedback: z.string().optional().nullable(),
        })
    ),
    feedback: z.string().optional().nullable(),
});

export type AttemptGradingDetailType = z.infer<typeof attemptGradingDetailSchema>;
export type GradingQuestionType = z.infer<typeof gradingQuestionSchema>;
export type UpdateGradingAttemptBodyType = z.infer<typeof updateGradingAttemptBodySchema>;
