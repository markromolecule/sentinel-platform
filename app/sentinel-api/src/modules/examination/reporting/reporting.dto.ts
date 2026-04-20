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

export const getExamReportSchema = {
    params: Schema.examIdParamsSchema,
    response: z.object({
        message: z.string(),
        data: examReportSchema,
    }),
};

export type ExamReport = z.infer<typeof examReportSchema>;
export type ExamReportExam = z.infer<typeof examReportExamSchema>;
export type ExamReportSummary = z.infer<typeof examReportSummarySchema>;
export type ExamReportStudentSummary = z.infer<typeof examReportStudentSummarySchema>;
export type ExamReportActionItems = z.infer<typeof examReportActionItemsSchema>;
export type ExamReportActionItem = z.infer<typeof examReportActionItemSchema>;
