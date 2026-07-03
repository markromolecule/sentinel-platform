import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

export const examAttemptLifecycleEventSchema = z
    .object(Schema.examAttemptLifecycleEventSchema.shape)
    .openapi('ExamAttemptLifecycleEvent');

export const examAttemptLifecycleSnapshotSchema = z
    .object(Schema.examAttemptLifecycleSnapshotSchema.shape)
    .openapi('ExamAttemptLifecycleSnapshot');

export const examAttemptLifecycleResponseSchema = z.object({
    message: z.string(),
    data: z.object(Schema.examAttemptLifecycleResponseSchema.shape),
});

export const lifecycleAttemptParamsSchema = Schema.examIdParamsSchema.extend({
    attemptId: z.string().uuid(),
});

export const lifecycleStudentParamsSchema = Schema.examIdParamsSchema.extend({
    studentId: z.string().uuid(),
});

export const reviseFinalizedAttemptScoreBodySchema = z.object({
    reasonCode: z.string().trim().min(1).max(100),
    notes: z.string().trim().max(2000).nullable().optional(),
});

export const grantMakeupExamWindowBodySchema = z.object({
    availableFrom: z.union([z.string(), z.date()]),
    availableUntil: z.union([z.string(), z.date()]),
    allowedAttempts: z.number().int().min(1).default(1),
    notes: z.string().trim().max(1000).nullable().optional(),
});

export const grantRetakeExamWindowBodySchema = z
    .object({
        availableFrom: z.union([z.string(), z.date()]),
        availableUntil: z.union([z.string(), z.date()]),
        allowedAttempts: z.number().int().min(1).default(1),
        sourceAttemptId: z.string().uuid(),
        notes: z.string().trim().max(1000).nullable().optional(),
    })
    .superRefine((value, context) => {
        const availableFrom = new Date(value.availableFrom);
        const availableUntil = new Date(value.availableUntil);

        if (
            !Number.isNaN(availableFrom.getTime()) &&
            !Number.isNaN(availableUntil.getTime()) &&
            availableUntil.getTime() <= availableFrom.getTime()
        ) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['availableUntil'],
                message: 'The availability end time must be after the start time.',
            });
        }
    });

export const lockExamAttemptLifecycleSchema = {
    params: lifecycleAttemptParamsSchema,
    body: Schema.lockExamAttemptLifecycleBodySchema,
    response: examAttemptLifecycleResponseSchema,
};

export const reopenExamAttemptLifecycleSchema = {
    params: lifecycleAttemptParamsSchema,
    body: Schema.reopenExamAttemptLifecycleBodySchema,
    response: examAttemptLifecycleResponseSchema,
};

export const resetExamAttemptLifecycleSchema = {
    params: lifecycleAttemptParamsSchema,
    body: Schema.resetExamAttemptLifecycleBodySchema,
    response: examAttemptLifecycleResponseSchema,
};

export const closeExamAttemptLifecycleSchema = {
    params: lifecycleAttemptParamsSchema,
    body: Schema.closeExamAttemptLifecycleBodySchema,
    response: examAttemptLifecycleResponseSchema,
};

export const finalizeExamAttemptScoreSchema = {
    params: lifecycleAttemptParamsSchema,
    body: Schema.finalizeExamAttemptLifecycleBodySchema,
    response: examAttemptLifecycleResponseSchema,
};

export const reviseFinalizedAttemptScoreSchema = {
    params: lifecycleAttemptParamsSchema,
    body: reviseFinalizedAttemptScoreBodySchema,
    response: examAttemptLifecycleResponseSchema,
};

export const grantMakeupExamWindowSchema = {
    params: lifecycleStudentParamsSchema,
    body: grantMakeupExamWindowBodySchema,
    response: z.object({
        message: z.string(),
        data: z.object({
            override: z.object(Schema.studentExamAccessOverrideSchema.shape),
            latestEvent: examAttemptLifecycleEventSchema.nullable(),
        }),
    }),
};

export const grantRetakeExamWindowSchema = {
    params: lifecycleStudentParamsSchema,
    body: grantRetakeExamWindowBodySchema,
    response: z.object({
        message: z.string(),
        data: z.object({
            override: z.object(Schema.studentExamAccessOverrideSchema.shape),
            latestEvent: examAttemptLifecycleEventSchema,
        }),
    }),
};

export type LifecycleAttemptParams = z.infer<typeof lifecycleAttemptParamsSchema>;
export type LifecycleStudentParams = z.infer<typeof lifecycleStudentParamsSchema>;
export type LockExamAttemptLifecycleBody = z.infer<typeof lockExamAttemptLifecycleSchema.body>;
export type ReopenExamAttemptLifecycleBody = z.infer<typeof reopenExamAttemptLifecycleSchema.body>;
export type ResetExamAttemptLifecycleBody = z.infer<typeof resetExamAttemptLifecycleSchema.body>;
export type CloseExamAttemptLifecycleBody = z.infer<typeof closeExamAttemptLifecycleSchema.body>;
export type FinalizeExamAttemptScoreBody = z.infer<typeof finalizeExamAttemptScoreSchema.body>;
export type ReviseFinalizedAttemptScoreBody = z.infer<
    typeof reviseFinalizedAttemptScoreSchema.body
>;
export type GrantMakeupExamWindowBody = z.infer<typeof grantMakeupExamWindowSchema.body>;
export type GrantRetakeExamWindowBody = z.infer<typeof grantRetakeExamWindowSchema.body>;
