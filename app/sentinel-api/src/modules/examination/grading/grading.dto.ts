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
