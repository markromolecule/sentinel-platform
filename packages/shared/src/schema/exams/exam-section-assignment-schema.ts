import * as z from 'zod';

const nullableDateTimeSchema = z.union([z.string(), z.date()]).nullable();

export const examSectionAssignmentSchema = z.object({
    id: z.string().uuid(),
    examId: z.string().uuid(),
    sectionId: z.string().uuid(),
    classGroupId: z.string().uuid().nullable().optional(),
    roomId: z.string().uuid().nullable().optional(),
    instructorId: z.string().uuid().nullable().optional(),
    scheduledAt: nullableDateTimeSchema.optional(),
    createdAt: nullableDateTimeSchema.optional(),
    updatedAt: nullableDateTimeSchema.optional(),
});

export const createExamSectionAssignmentBodySchema = z.object({
    sectionId: z.string().uuid(),
    classGroupId: z.string().uuid().nullable().optional(),
    roomId: z.string().uuid().nullable().optional(),
    instructorId: z.string().uuid().nullable().optional(),
    scheduledAt: z.union([z.string(), z.date()]).nullable().optional(),
});

export const updateExamSectionAssignmentBodySchema = z.object({
    roomId: z.string().uuid().nullable().optional(),
    instructorId: z.string().uuid().nullable().optional(),
    scheduledAt: z.union([z.string(), z.date()]).nullable().optional(),
});

export const createExamSectionAssignmentBatchItemSchema = z.object({
    sectionId: z.string({ message: "Section ID is required and must be a valid UUID." }).uuid({ message: "Section ID is required and must be a valid UUID." }),
    classGroupId: z.string({ message: "Classroom is required." }).uuid({ message: "Classroom is required." }),
    roomId: z.string({ message: "Room is required." }).uuid({ message: "Room is required." }),
    instructorId: z.string({ message: "Instructor is required." }).uuid({ message: "Instructor is required." }),
    scheduledAt: z.union([z.string(), z.date()]).nullable().optional(),
});

export const createExamSectionAssignmentBatchBodySchema = z.object({
    assignments: z.array(createExamSectionAssignmentBatchItemSchema)
        .min(1, { message: "At least one classroom assignment is required." }),
});

export type ExamSectionAssignment = z.infer<typeof examSectionAssignmentSchema>;
export type CreateExamSectionAssignmentBody = z.infer<typeof createExamSectionAssignmentBodySchema>;
export type CreateExamSectionAssignmentBatchItem = z.infer<
    typeof createExamSectionAssignmentBatchItemSchema
>;
export type CreateExamSectionAssignmentBatchBody = z.infer<
    typeof createExamSectionAssignmentBatchBodySchema
>;
export type UpdateExamSectionAssignmentBody = z.infer<typeof updateExamSectionAssignmentBodySchema>;
