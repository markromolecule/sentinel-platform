import type { z } from 'zod';
import type {
    examReportActionItemSchema,
    examReportActionItemsSchema,
    examReportExamSchema,
    examReportIncidentOutcomeSummarySchema,
    examReportIncidentSeverityBreakdownSchema,
    examReportIncidentTypeBreakdownSchema,
    examReportSchema,
    examReportStudentStatusSchema,
    examReportStudentSummarySchema,
    examReportSubmissionTypeSchema,
    examReportSummarySchema,
} from '../../../../../schema/exams/reporting-schema';

export type ExamReportStudentStatus = z.infer<typeof examReportStudentStatusSchema>;
export type ExamReportSubmissionType = z.infer<typeof examReportSubmissionTypeSchema>;
export type ExamReportIncidentOutcomeSummary = z.infer<
    typeof examReportIncidentOutcomeSummarySchema
>;
export type ExamReportIncidentTypeBreakdown = z.infer<typeof examReportIncidentTypeBreakdownSchema>;
export type ExamReportIncidentSeverityBreakdown = z.infer<
    typeof examReportIncidentSeverityBreakdownSchema
>;
export type ExamReportActionItem = z.infer<typeof examReportActionItemSchema>;
export type ExamReportExam = z.infer<typeof examReportExamSchema>;
export type ExamReportStudentSummary = z.infer<typeof examReportStudentSummarySchema>;
export type ExamReportSummary = z.infer<typeof examReportSummarySchema>;
export type ExamReportActionItems = z.infer<typeof examReportActionItemsSchema>;
export type ExamReport = z.infer<typeof examReportSchema>;
