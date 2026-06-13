import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

export const examSectionAssignmentResponseSchema = z
    .object({
        ...Schema.examSectionAssignmentSchema.shape,
        sectionName: z.string(),
        roomName: z.string().nullable().optional(),
        instructorName: z.string().nullable().optional(),
    })
    .openapi('ExamSectionAssignmentResponse');

export const getExamSectionAssignmentsSchema = {
    params: z.object({
        examId: z.string().uuid(),
    }),
    response: z.object({
        message: z.string(),
        data: z.array(examSectionAssignmentResponseSchema),
    }),
};

export const createExamSectionAssignmentSchema = {
    params: z.object({
        examId: z.string().uuid(),
    }),
    body: z.object(Schema.createExamSectionAssignmentBodySchema.shape),
    response: z.object({
        message: z.string(),
        data: examSectionAssignmentResponseSchema,
    }),
};

export const updateExamSectionAssignmentSchema = {
    params: z.object({
        examId: z.string().uuid(),
        id: z.string().uuid(),
    }),
    body: z.object(Schema.updateExamSectionAssignmentBodySchema.shape),
    response: z.object({
        message: z.string(),
        data: examSectionAssignmentResponseSchema,
    }),
};

export const deleteExamSectionAssignmentSchema = {
    params: z.object({
        examId: z.string().uuid(),
        id: z.string().uuid(),
    }),
    response: z.object({
        message: z.string(),
        data: z.object({
            id: z.string().uuid(),
        }),
    }),
};
