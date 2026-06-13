import * as z from 'zod';

const nullableDateTimeSchema = z.union([z.string(), z.date()]).nullable();

export const examSectionAssignmentSchema = z.object({
    id: z.string().uuid(),
    examId: z.string().uuid(),
    sectionId: z.string().uuid(),
    roomId: z.string().uuid().nullable().optional(),
    instructorId: z.string().uuid().nullable().optional(),
    scheduledAt: nullableDateTimeSchema.optional(),
    createdAt: nullableDateTimeSchema.optional(),
    updatedAt: nullableDateTimeSchema.optional(),
});

export const createExamSectionAssignmentBodySchema = z.object({
    sectionId: z.string().uuid(),
    roomId: z.string().uuid().optional(),
    instructorId: z.string().uuid().optional(),
    scheduledAt: z.union([z.string(), z.date()]).optional(),
});

export const updateExamSectionAssignmentBodySchema = z.object({
    roomId: z.string().uuid().nullable().optional(),
    instructorId: z.string().uuid().nullable().optional(),
    scheduledAt: z.union([z.string(), z.date()]).nullable().optional(),
});

export type ExamSectionAssignment = z.infer<typeof examSectionAssignmentSchema>;
export type CreateExamSectionAssignmentBody = z.infer<typeof createExamSectionAssignmentBodySchema>;
export type UpdateExamSectionAssignmentBody = z.infer<typeof updateExamSectionAssignmentBodySchema>;
