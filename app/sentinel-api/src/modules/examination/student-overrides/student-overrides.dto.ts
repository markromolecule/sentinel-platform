import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

export const studentExamAccessOverrideSchema = z
    .object(Schema.studentExamAccessOverrideSchema.shape)
    .openapi('StudentExamAccessOverride');

export const createStudentExamAccessOverrideSchema = {
    params: Schema.examIdParamsSchema,
    body: Schema.createStudentExamAccessOverrideBodySchema,
    response: z.object({
        message: z.string(),
        data: studentExamAccessOverrideSchema,
    }),
};

export type StudentExamAccessOverride = z.infer<typeof studentExamAccessOverrideSchema>;
export type CreateStudentExamAccessOverrideBody = z.infer<
    typeof createStudentExamAccessOverrideSchema.body
>;
