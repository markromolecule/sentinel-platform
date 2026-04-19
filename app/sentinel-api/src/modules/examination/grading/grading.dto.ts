import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

export const gradingExamSchema = z.object(Schema.gradingExamSchema.shape).openapi('GradingExam');
export const gradingStudentSchema = z
    .object(Schema.gradingStudentSchema.shape)
    .openapi('GradingStudent');

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
        data: z.array(gradingStudentSchema),
    }),
};

export type GradingExam = z.infer<typeof gradingExamSchema>;
export type GradingStudent = z.infer<typeof gradingStudentSchema>;
