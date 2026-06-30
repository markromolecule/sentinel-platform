import * as z from 'zod';

export const feedbackRatingSchema = z.number().int().min(1).max(5);

export const createFeedbackSchema = z.object({
    attemptId: z.string().uuid(),
    rating: feedbackRatingSchema,
    experience: z.string().trim().max(2000).nullable().optional(),
});

export const feedbackRecordSchema = z.object({
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
    rating: feedbackRatingSchema,
    experience: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export const feedbackPageSchema = z.object({
    items: z.array(feedbackRecordSchema),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
    hasMore: z.boolean(),
});

export const getFeedbacksQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
    rating: feedbackRatingSchema.optional(),
    examId: z.string().uuid().optional(),
    search: z.string().trim().min(1).optional(),
    sortBy: z.enum(['createdAt', 'rating', 'studentName', 'examTitle']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateFeedbackSchemaValues = z.infer<typeof createFeedbackSchema>;
export type FeedbackRecord = z.infer<typeof feedbackRecordSchema>;
export type FeedbackPage = z.infer<typeof feedbackPageSchema>;
export type GetFeedbacksQuery = z.infer<typeof getFeedbacksQuerySchema>;
