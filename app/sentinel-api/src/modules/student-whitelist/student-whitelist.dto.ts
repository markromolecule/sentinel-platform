import { z } from '@hono/zod-openapi';
import {
    bulkImportStudentWhitelistSchema as bulkImportStudentWhitelistBodySchema,
    createStudentWhitelistSchema as createStudentWhitelistBodySchema,
    deleteStudentWhitelistParamsSchema,
    getStudentWhitelistQuerySchema,
    purgeStudentWhitelistResultSchema,
    purgeStudentWhitelistSchema as purgeStudentWhitelistBodySchema,
    studentWhitelistBulkImportResultSchema,
    studentWhitelistRecordSchema,
    updateStudentWhitelistParamsSchema,
    updateStudentWhitelistSchema as updateStudentWhitelistBodySchema,
} from '@sentinel/shared/schema';

export const studentWhitelistSchemaOpenApi = z
    .object(studentWhitelistRecordSchema.shape)
    .openapi('StudentWhitelist');

export const getStudentWhitelistSchema = {
    request: {
        query: getStudentWhitelistQuerySchema,
    },
    response: z.object({
        message: z.string(),
        data: z.array(studentWhitelistSchemaOpenApi),
    }),
};

export const createStudentWhitelistSchema = {
    body: createStudentWhitelistBodySchema,
    response: z.object({
        message: z.string(),
        data: studentWhitelistSchemaOpenApi,
    }),
};

export const updateStudentWhitelistSchema = {
    params: updateStudentWhitelistParamsSchema,
    body: updateStudentWhitelistBodySchema,
    response: z.object({
        message: z.string(),
        data: studentWhitelistSchemaOpenApi,
    }),
};

export const bulkImportStudentWhitelistSchema = {
    body: bulkImportStudentWhitelistBodySchema,
    response: z.object({
        message: z.string(),
        data: studentWhitelistBulkImportResultSchema,
    }),
};

export const deleteStudentWhitelistSchema = {
    params: deleteStudentWhitelistParamsSchema,
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

export const purgeStudentWhitelistSchema = {
    body: purgeStudentWhitelistBodySchema,
    response: z.object({
        message: z.string(),
        data: purgeStudentWhitelistResultSchema,
    }),
};

export type GetStudentWhitelistResponse = z.infer<typeof getStudentWhitelistSchema.response>;
export type CreateStudentWhitelistBody = z.infer<typeof createStudentWhitelistSchema.body>;
export type CreateStudentWhitelistResponse = z.infer<typeof createStudentWhitelistSchema.response>;
export type UpdateStudentWhitelistParams = z.infer<typeof updateStudentWhitelistSchema.params>;
export type UpdateStudentWhitelistBody = z.infer<typeof updateStudentWhitelistSchema.body>;
export type UpdateStudentWhitelistResponse = z.infer<typeof updateStudentWhitelistSchema.response>;
export type BulkImportStudentWhitelistBody = z.infer<typeof bulkImportStudentWhitelistSchema.body>;
export type BulkImportStudentWhitelistResponse = z.infer<
    typeof bulkImportStudentWhitelistSchema.response
>;
export type DeleteStudentWhitelistParams = z.infer<typeof deleteStudentWhitelistSchema.params>;
export type DeleteStudentWhitelistResponse = z.infer<typeof deleteStudentWhitelistSchema.response>;
export type PurgeStudentWhitelistBody = z.infer<typeof purgeStudentWhitelistSchema.body>;
export type PurgeStudentWhitelistResponse = z.infer<typeof purgeStudentWhitelistSchema.response>;
