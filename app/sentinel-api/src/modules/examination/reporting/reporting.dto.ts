import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

export const examReportIncidentOutcomeSummarySchema = z
    .object(Schema.examReportIncidentOutcomeSummarySchema.shape)
    .openapi('ExamReportIncidentOutcomeSummary');

export const examReportIncidentTypeBreakdownSchema = z
    .object(Schema.examReportIncidentTypeBreakdownSchema.shape)
    .openapi('ExamReportIncidentTypeBreakdown');

export const examReportIncidentSeverityBreakdownSchema = z
    .object(Schema.examReportIncidentSeverityBreakdownSchema.shape)
    .openapi('ExamReportIncidentSeverityBreakdown');

export const examReportActionItemSchema = z
    .object(Schema.examReportActionItemSchema.shape)
    .openapi('ExamReportActionItem');

export const examReportExamSchema = z
    .object(Schema.examReportExamSchema.shape)
    .openapi('ExamReportExam');

export const examReportStudentSummarySchema = z
    .object(Schema.examReportStudentSummarySchema.shape)
    .openapi('ExamReportStudentSummary');

export const examReportSummarySchema = z
    .object(Schema.examReportSummarySchema.shape)
    .openapi('ExamReportSummary');

export const examReportActionItemsSchema = z
    .object(Schema.examReportActionItemsSchema.shape)
    .openapi('ExamReportActionItems');

export const examReportSchema = z.object(Schema.examReportSchema.shape).openapi('ExamReport');
export const attemptReportSchema = z
    .object({
        attempt: z.object(Schema.attemptGradingDetailSchema.shape),
        questions: z.array(z.object(Schema.gradingQuestionSchema.shape)),
    })
    .openapi('AttemptReport');

export const getExamReportSchema = {
    params: Schema.examIdParamsSchema,
    query: Schema.getExamReportQuerySchema,
    response: z.object({
        message: z.string(),
        data: examReportSchema,
    }),
};

export const getAttemptReportSchema = {
    params: z.object({
        attemptId: z.string().uuid().openapi({ description: 'ID of the student exam attempt' }),
    }),
    response: z.object({
        message: z.string(),
        data: attemptReportSchema,
    }),
};

export type ExamReport = z.infer<typeof examReportSchema>;
export type AttemptReport = z.infer<typeof attemptReportSchema>;
export type ExamReportExam = z.infer<typeof examReportExamSchema>;
export type ExamReportSummary = z.infer<typeof examReportSummarySchema>;
export type ExamReportStudentSummary = z.infer<typeof examReportStudentSummarySchema>;
export type ExamReportActionItems = z.infer<typeof examReportActionItemsSchema>;
export type ExamReportActionItem = z.infer<typeof examReportActionItemSchema>;

export const getExamReportsQuerySchema = z.object({
    page: z.coerce
        .number()
        .int()
        .min(1)
        .default(1)
        .optional()
        .openapi({ description: 'Page index to fetch' }),
    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(9)
        .optional()
        .openapi({ description: 'Number of items per page' }),
    pageSize: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .openapi({ description: 'Alternative to limit' }),
    search: z.string().optional().openapi({ description: 'Search filter' }),
});

export const examReportSummaryItemSchema = z
    .object(Schema.examSummarySchema.shape)
    .openapi('ExamReportSummaryItem');

export const getExamReportsSchema = {
    query: getExamReportsQuerySchema,
    response: z.object({
        message: z.string(),
        data: z.array(examReportSummaryItemSchema),
        meta: z.object({
            total: z.number().int(),
            page: z.number().int(),
            limit: z.number().int(),
            totalPages: z.number().int(),
        }),
    }),
};

export type GetExamReportsQuery = z.infer<typeof getExamReportsQuerySchema>;
