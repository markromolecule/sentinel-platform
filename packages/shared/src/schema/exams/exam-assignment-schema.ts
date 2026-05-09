import * as z from 'zod';

const nullableDateTimeSchema = z.union([z.string(), z.date()]).nullable();

export const examAssignmentStatusSchema = z.enum([
    'PENDING',
    'ACCEPTED',
    'DECLINED',
    'ACTIVE',
    'COMPLETED',
    'SCHEDULED',
]);

export const examAssignmentRelationshipSchema = z.enum(['INBOUND', 'OUTBOUND']);

export const examAssignmentActorSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
});

export const examAssignmentExamSummarySchema = z.object({
    id: z.string().uuid(),
    title: z.string(),
    subjectTitle: z.string().nullable(),
    scheduledDate: nullableDateTimeSchema,
    endDateTime: nullableDateTimeSchema,
});

export const examAssignmentSchema = z.object({
    id: z.string().uuid(),
    relationship: examAssignmentRelationshipSchema,
    exam: examAssignmentExamSummarySchema,
    assigner: examAssignmentActorSchema,
    assignee: examAssignmentActorSchema,
    status: examAssignmentStatusSchema,
    scheduledAt: nullableDateTimeSchema,
    createdAt: nullableDateTimeSchema,
    updatedAt: nullableDateTimeSchema,
});

export const createExamAssignmentBodySchema = z.object({
    examId: z.string().uuid(),
    assigneeId: z.string().uuid(),
});

export type ExamAssignmentSchemaValues = z.infer<typeof examAssignmentSchema>;
export type CreateExamAssignmentBodySchemaValues = z.infer<typeof createExamAssignmentBodySchema>;
