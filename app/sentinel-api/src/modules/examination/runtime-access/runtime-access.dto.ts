import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

export const examRuntimeAccessSchema = z
    .object(Schema.examRuntimeAccessSchema.shape)
    .openapi('ExamRuntimeAccess');

export const updateExamRuntimeAccessSchema = {
    params: Schema.examIdParamsSchema,
    body: Schema.updateExamRuntimeAccessBodySchema,
    response: z.object({
        message: z.string(),
        data: examRuntimeAccessSchema,
    }),
};

export type ExamRuntimeAccess = z.infer<typeof examRuntimeAccessSchema>;
export type UpdateExamRuntimeAccessBody = z.infer<typeof updateExamRuntimeAccessSchema.body>;
