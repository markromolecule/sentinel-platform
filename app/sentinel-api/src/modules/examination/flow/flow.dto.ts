import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

export const startSessionSchema = {
    body: z.object({
        examId: z.string().uuid(),
    }),
    response: z.object({
        message: z.string(),
        data: z.object({
            sessionId: z.string().uuid().optional(),
            configSnapshot: Schema.examConfigurationStateSchema.optional(),
            isResumed: z.boolean().optional(),
            answers: z.record(z.string(), z.any()).optional(),
            elapsedSeconds: z.number().int().min(0).optional(),
            reconnectAttemptCount: z.number().int().min(0).optional(),
            maxReconnectAttempts: z.number().int().min(0).optional(),
            attemptId: z.string().uuid().optional(),
            error: z.string().optional(),
            errorCode: z
                .enum([
                    'ATTEMPT_ALREADY_COMPLETED',
                    'ATTEMPT_LOCKED',
                    'ATTEMPT_CLOSED',
                    'ATTEMPT_SUPERSEDED',
                ])
                .optional(),
        }),
    }),
};

export const completeSessionSchema = {
    body: z.object({
        sessionId: z.string().uuid(),
        answers: z.record(z.string(), z.any()),
        elapsedSeconds: z.number().int().min(0),
    }),
    response: z.object({
        message: z.string(),
        data: z.object({
            attemptId: z.string().uuid(),
            score: z.number().int().min(0),
            totalScore: z.number().int().min(0),
            percentage: z.number().int().min(0).max(100).nullable(),
            answeredCount: z.number().int().min(0),
            autoGradableQuestionCount: z.number().int().min(0),
            manualReviewQuestionCount: z.number().int().min(0),
            requiresManualReview: z.boolean(),
            completedAt: z.string(),
        }),
    }),
};

export const syncSessionSchema = {
    body: z.object({
        sessionId: z.string().uuid(),
        answeredCount: z.number().int().min(0),
        elapsedSeconds: z.number().int().min(0),
        answers: z.record(z.string(), z.any()).optional(),
    }),
    response: z.object({
        message: z.string(),
    }),
};

export type StartSessionBody = z.infer<typeof startSessionSchema.body>;
export type StartSessionResponse = z.infer<typeof startSessionSchema.response>;
export type CompleteSessionBody = z.infer<typeof completeSessionSchema.body>;
export type CompleteSessionResponse = z.infer<typeof completeSessionSchema.response>;
export type SyncSessionBody = z.infer<typeof syncSessionSchema.body>;
