import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

export const gradingExamSchema = z.object(Schema.gradingExamSchema.shape).openapi('GradingExam');
export const gradingStudentSchema = z
    .object(Schema.gradingStudentSchema.shape)
    .openapi('GradingStudent');
export const gradingStudentSectionSchema = z
    .object(Schema.gradingStudentSectionSchema.shape)
    .openapi('GradingStudentSection');
export const gradingStudentListSchema = z
    .object(Schema.gradingStudentListSchema.shape)
    .openapi('GradingStudentList');

export const getGradingExamsSchema = {
    request: {
        query: z.object({
            sectionId: z
                .string()
                .uuid()
                .optional()
                .openapi({ description: 'Filter by specific section ID' }),
        }),
    },
    response: z.object({
        message: z.string(),
        data: z.array(gradingExamSchema),
    }),
};

export const getGradingStudentsSchema = {
    request: {
        params: Schema.examIdParamsSchema,
        query: z.object({
            sectionId: z
                .string()
                .uuid()
                .optional()
                .openapi({ description: 'Filter by specific section ID' }),
        }),
    },
    response: z.object({
        message: z.string(),
        data: gradingStudentListSchema,
    }),
};

export type GradingExam = z.infer<typeof gradingExamSchema>;
export type GradingStudent = z.infer<typeof gradingStudentSchema>;
export type GradingStudentSection = z.infer<typeof gradingStudentSectionSchema>;
export type GradingStudentList = z.infer<typeof gradingStudentListSchema>;

export const attemptGradingDetailSchema = z
    .object(Schema.attemptGradingDetailSchema.shape)
    .openapi('AttemptGradingDetail');

export const gradingQuestionSchema = z
    .object(Schema.gradingQuestionSchema.shape)
    .openapi('GradingQuestion');

export const getGradingAttemptDetailSchema = {
    request: {
        params: z.object({
            attemptId: z.string().uuid().openapi({ description: 'ID of the student exam attempt' }),
        }),
    },
    response: z.object({
        message: z.string(),
        data: z.object({
            attempt: attemptGradingDetailSchema,
            questions: z.array(gradingQuestionSchema),
        }),
    }),
};

export const updateGradingAttemptBodySchema = z
    .object(Schema.updateGradingAttemptBodySchema.shape)
    .openapi('UpdateGradingAttemptBody');

export const updateGradingAttemptSchema = {
    request: {
        params: z.object({
            attemptId: z.string().uuid().openapi({ description: 'ID of the student exam attempt' }),
        }),
        body: updateGradingAttemptBodySchema,
    },
    response: z.object({
        message: z.string(),
        data: z.object({
            attemptId: z.string().uuid(),
            score: z.number(),
            totalScore: z.number().nullable(),
        }),
    }),
};

export const bulkFinalizeAttemptsSchema = {
    request: {
        params: z.object({
            examId: z.string().uuid().openapi({ description: 'ID of the exam' }),
        }),
    },
    response: z.object({
        message: z.string(),
        data: z.object({
            count: z.number(),
        }),
    }),
};
