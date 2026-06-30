import { z } from '@hono/zod-openapi';
import {
    createFeedbackSchema as sharedCreateFeedbackSchema,
    feedbackRecordSchema,
    feedbackPageSchema,
    getFeedbacksQuerySchema as sharedGetFeedbacksQuerySchema,
} from '@sentinel/shared/schema';

export const feedbackRecordOpenApi = z
    .object({
        feedbackId: z.string().uuid(),
        attemptId: z.string().uuid(),
        examId: z.string().uuid().nullable(),
        examTitle: z.string().nullable(),
        studentId: z.string().uuid().nullable(),
        studentUserId: z.string().uuid().nullable(),
        studentNumber: z.string().nullable(),
        studentName: z.string().nullable(),
        studentEmail: z.string().email().nullable(),
        institutionId: z.string().uuid().nullable(),
        institutionName: z.string().nullable(),
        rating: z.number().int().min(1).max(5),
        experience: z.string().nullable(),
        createdAt: z.string(),
        updatedAt: z.string(),
    })
    .openapi('FeedbackRecord');

const createFeedbackBody = z
    .object(sharedCreateFeedbackSchema.shape)
    .openapi('CreateFeedbackBody');

const getFeedbacksQuery = z.object(sharedGetFeedbacksQuerySchema.shape);

export const createFeedbackRouteSchema = {
    body: createFeedbackBody,
    response: z.object({
        success: z.boolean(),
        message: z.string(),
        data: feedbackRecordOpenApi,
    }),
};

export const getFeedbackRouteSchema = {
    params: z.object({
        id: z.string().uuid('Invalid feedback ID format'),
    }),
    response: z.object({
        success: z.boolean(),
        message: z.string(),
        data: feedbackRecordOpenApi,
    }),
};

export const getFeedbacksRouteSchema = {
    request: {
        query: getFeedbacksQuery,
    },
    response: z.object({
        success: z.boolean(),
        message: z.string(),
        data: z.object(feedbackPageSchema.shape),
    }),
};

export type CreateFeedbackBody = z.infer<typeof createFeedbackBody>;
export type GetFeedbacksQueryParams = z.infer<typeof getFeedbacksQuery>;
export type FeedbackRecordRow = z.infer<typeof feedbackRecordSchema>;
