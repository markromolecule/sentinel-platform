import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

export const examSettingsSchema = Schema.examSettingsSchema;
export const examConfigurationSchema = Schema.examConfigurationSchema;

export const examConfigurationStateSchema = z
    .object({
        settings: Schema.examSettingsSchema,
        configuration: Schema.examConfigurationSchema,
    })
    .openapi('ExamConfigurationState');

export const examinationConfigurationDefaultsSchema = z
    .object({
        message: z.string(),
        data: Schema.examinationGlobalSettingsValueSchema,
    })
    .openapi('ExaminationConfigurationDefaultsResponse');

export const getExamConfigurationSchema = {
    params: Schema.examConfigurationParamsSchema,
    response: z.object({
        message: z.string(),
        data: examConfigurationStateSchema,
    }),
};

export const updateExamConfigurationSchema = {
    params: Schema.examConfigurationParamsSchema,
    body: Schema.updateExamConfigurationBodySchema,
    response: z.object({
        message: z.string(),
        data: examConfigurationStateSchema,
    }),
};

export const getExaminationConfigurationDefaultsSchema = {
    response: examinationConfigurationDefaultsSchema,
};

export type GetExamConfigurationParams = z.infer<typeof getExamConfigurationSchema.params>;
export type UpdateExamConfigurationParams = z.infer<typeof updateExamConfigurationSchema.params>;
export type UpdateExamConfigurationBody = z.infer<typeof updateExamConfigurationSchema.body>;
export type ExamConfigurationState = z.infer<typeof examConfigurationStateSchema>;
export type ExaminationConfigurationDefaultsResponse = z.infer<
    typeof examinationConfigurationDefaultsSchema
>;
