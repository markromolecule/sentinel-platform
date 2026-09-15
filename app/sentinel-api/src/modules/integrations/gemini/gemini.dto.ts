import { z } from '@hono/zod-openapi';
import {
    aiPreviewSavePayloadSchema,
    generateQuestionPreviewResponseSchema,
} from '@sentinel/shared';

export const generatePreviewMultipartSchema = z.object({
    file: z.any().openapi({
        type: 'string',
        format: 'binary',
    }),
    config: z.string().optional().openapi({
        description: 'Optional JSON string with the full AI configuration.',
    }),
    configuration: z.string().optional().openapi({
        description: 'Alias for the config field.',
    }),
    target: z.string().optional(),
    institutionId: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    tags: z.string().optional().openapi({
        description: 'Comma-separated tags or a JSON array string.',
    }),
    questionType: z.string().optional(),
    questionCount: z.string().optional(),
    difficulty: z.string().optional(),
    points: z.string().optional(),
    subjectId: z.string().optional(),
    language: z.string().optional(),
    isPublic: z.string().optional(),
    additionalInstructions: z.string().optional(),
});

export const generatePreviewRouteSchema = {
    response: z.object({
        message: z.string(),
        data: generateQuestionPreviewResponseSchema,
    }),
};

export const finalizedAiQuestionPayloadSchema = aiPreviewSavePayloadSchema;

export const generatePreviewJobResponseSchema = z.object({
    success: z.literal(true),
    data: z.object({
        jobId: z.string().uuid(),
        status: z.enum(['queued', 'processing', 'completed', 'failed']),
        createdAt: z.string(),
    }),
});

export const getPreviewJobStatusResponseSchema = z.object({
    success: z.literal(true),
    data: z.object({
        jobId: z.string().uuid(),
        status: z.enum(['queued', 'processing', 'completed', 'failed']),
        progress: z.number().int().min(0).max(100),
        currentStep: z.string().nullable(),
        result: generateQuestionPreviewResponseSchema.nullable().optional(),
        error: z.string().nullable().optional(),
        createdAt: z.string(),
        updatedAt: z.string(),
    }),
});

export const getPreviewJobParamSchema = z.object({
    id: z.string().uuid().openapi({
        param: {
            name: 'id',
            in: 'path',
        },
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
});
