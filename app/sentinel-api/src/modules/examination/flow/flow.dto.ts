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
            error: z.string().optional(),
        }),
    }),
};

export type StartSessionBody = z.infer<typeof startSessionSchema.body>;
export type StartSessionResponse = z.infer<typeof startSessionSchema.response>;
