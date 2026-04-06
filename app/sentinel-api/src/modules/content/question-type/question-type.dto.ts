import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

export const questionTypeDefinitionSchema = z
    .object(Schema.questionTypeDefinitionSchema.shape)
    .openapi('QuestionTypeDefinition');

export const questionTypeValidationResultSchema = z
    .object(Schema.questionTypeValidationResultSchema.shape)
    .openapi('QuestionTypeValidationResult');

export const getQuestionTypesSchema = {
    response: z.object({
        message: z.string(),
        data: z.array(questionTypeDefinitionSchema),
    }),
};

export const getQuestionTypeSchema = {
    params: Schema.questionTypeParamsSchema,
    response: z.object({
        message: z.string(),
        data: questionTypeDefinitionSchema,
    }),
};

export const validateQuestionTypeContentSchema = {
    params: Schema.questionTypeParamsSchema,
    body: Schema.validateQuestionTypeContentBodySchema,
    response: z.object({
        message: z.string(),
        data: questionTypeValidationResultSchema,
    }),
};

export type GetQuestionTypeParams = z.infer<typeof getQuestionTypeSchema.params>;
export type ValidateQuestionTypeContentParams = z.infer<
    typeof validateQuestionTypeContentSchema.params
>;
export type ValidateQuestionTypeContentBody = z.infer<
    typeof validateQuestionTypeContentSchema.body
>;
export type QuestionTypeDefinition = z.infer<typeof questionTypeDefinitionSchema>;
export type QuestionTypeValidationResult = z.infer<typeof questionTypeValidationResultSchema>;
