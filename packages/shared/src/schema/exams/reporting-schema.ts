import * as z from 'zod';
import { monitoringIncidentSeveritySchema } from './monitoring-schema';
import { telemetryIncidentTypeSchema } from '../telemetry/telemetry-schema';

const nullableDateTimeSchema = z.union([z.string(), z.date()]).nullable();

export const examReportStudentStatusSchema = z.enum([
    'absent',
    'submitted',
    'flagged',
    'in_progress',
]);

export const examReportSubmissionTypeSchema = z.enum([
    'manual_submit',
    'auto_submit',
    'force_close',
    'absent',
    'retake',
]);

export const examReportAttemptKindSchema = z.enum(['primary', 'makeup', 'retake']);

export const examReportIncidentOutcomeSummarySchema = z.object({
    pending: z.number().int().min(0),
    reviewed: z.number().int().min(0),
    confirmed: z.number().int().min(0),
    dismissed: z.number().int().min(0),
});

export const examReportIncidentTypeBreakdownSchema = z.object({
    type: telemetryIncidentTypeSchema,
    count: z.number().int().min(0),
});

export const examReportIncidentSeverityBreakdownSchema = z.object({
    severity: monitoringIncidentSeveritySchema,
    count: z.number().int().min(0),
});

export const examReportActionItemSchema = z.object({
    id: z.string().uuid(),
    studentId: z.string().uuid(),
    attemptId: z.string().uuid().nullable(),
    studentNo: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    reason: z.string(),
});

export const examReportExamSchema = z.object({
    id: z.string().uuid(),
    title: z.string(),
    subject: z.string(),
    scheduledDate: nullableDateTimeSchema,
    endDateTime: nullableDateTimeSchema,
    durationMinutes: z.number().int().min(0),
    passingScore: z.number().int().min(0),
});

export const examReportStudentSummarySchema = z.object({
    id: z.string().uuid(),
    studentId: z.string().uuid(),
    attemptId: z.string().uuid().nullable(),
    studentNo: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    sectionId: z.string().uuid().nullable(),
    sectionName: z.string().nullable(),
    status: examReportStudentStatusSchema,
    startedAt: nullableDateTimeSchema,
    completedAt: nullableDateTimeSchema,
    score: z.number().int().nullable(),
    totalScore: z.number().int().nullable(),
    percentage: z.number().min(0).max(100).nullable(),
    timeSpentMinutes: z.number().int().min(0).nullable(),
    incidentCount: z.number().int().min(0),
    openIncidentCount: z.number().int().min(0),
    primaryIncidentType: telemetryIncidentTypeSchema.nullable(),
    highestIncidentSeverity: monitoringIncidentSeveritySchema.nullable(),
    incidentOutcomes: examReportIncidentOutcomeSummarySchema,
    submissionType: examReportSubmissionTypeSchema.nullable(),
    attemptKind: examReportAttemptKindSchema.nullable(),
    attemptCount: z.number().int().min(0),
    isFlagged: z.boolean(),
    needsReview: z.boolean(),
    needsMakeup: z.boolean(),
    needsRetake: z.boolean(),
});

export const examReportSummarySchema = z.object({
    totalAssignedStudents: z.number().int().min(0),
    totalStarted: z.number().int().min(0),
    totalSubmitted: z.number().int().min(0),
    totalAbsent: z.number().int().min(0),
    flaggedStudentsCount: z.number().int().min(0),
    averageScore: z.number().min(0).max(100).nullable(),
    passRate: z.number().min(0).max(100).nullable(),
    incidentBreakdownByType: z.array(examReportIncidentTypeBreakdownSchema),
    incidentBreakdownBySeverity: z.array(examReportIncidentSeverityBreakdownSchema),
    needsReviewCount: z.number().int().min(0),
    needsMakeupCount: z.number().int().min(0),
    needsRetakeCount: z.number().int().min(0),
});

export const examReportActionItemsSchema = z.object({
    review: z.array(examReportActionItemSchema),
    makeup: z.array(examReportActionItemSchema),
    retake: z.array(examReportActionItemSchema),
});

export const examReportSchema = z.object({
    exam: examReportExamSchema,
    summary: examReportSummarySchema,
    students: z.array(examReportStudentSummarySchema),
    actionItems: examReportActionItemsSchema,
});

export type ExamReportStudentStatusType = z.infer<typeof examReportStudentStatusSchema>;
export type ExamReportSubmissionTypeSchemaType = z.infer<typeof examReportSubmissionTypeSchema>;
export type ExamReportAttemptKindType = z.infer<typeof examReportAttemptKindSchema>;
export type ExamReportIncidentOutcomeSummaryType = z.infer<
    typeof examReportIncidentOutcomeSummarySchema
>;
export type ExamReportIncidentTypeBreakdownType = z.infer<
    typeof examReportIncidentTypeBreakdownSchema
>;
export type ExamReportIncidentSeverityBreakdownType = z.infer<
    typeof examReportIncidentSeverityBreakdownSchema
>;
export type ExamReportActionItemType = z.infer<typeof examReportActionItemSchema>;
export type ExamReportExamType = z.infer<typeof examReportExamSchema>;
export type ExamReportStudentSummaryType = z.infer<typeof examReportStudentSummarySchema>;
export type ExamReportSummaryType = z.infer<typeof examReportSummarySchema>;
export type ExamReportActionItemsType = z.infer<typeof examReportActionItemsSchema>;
export type ExamReportType = z.infer<typeof examReportSchema>;
