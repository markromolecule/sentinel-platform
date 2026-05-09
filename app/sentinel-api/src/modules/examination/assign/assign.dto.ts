import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

export const examAssignmentSchema = z
    .object(Schema.examAssignmentSchema.shape)
    .openapi('ExamAssignment');

export const createExamAssignmentSchema = {
    body: z.object(Schema.createExamAssignmentBodySchema.shape),
    response: z.object({
        message: z.string(),
        data: examAssignmentSchema,
    }),
};

export const getExamAssignmentsSchema = {
    response: z.object({
        message: z.string(),
        data: z.array(examAssignmentSchema),
    }),
};

export const respondToExamAssignmentSchema = {
    params: z.object({
        assignmentId: z.string().uuid(),
    }),
    response: z.object({
        message: z.string(),
        data: examAssignmentSchema,
    }),
};

export type CreateExamAssignmentBody = z.infer<typeof createExamAssignmentSchema.body>;
