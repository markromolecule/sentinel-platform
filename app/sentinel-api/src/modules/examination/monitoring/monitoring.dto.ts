import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

export const monitoringIncidentSchema = z
    .object(Schema.monitoringIncidentSchema.shape)
    .openapi('MonitoringIncident');

export const monitoringExamSchema = z
    .object(Schema.monitoringExamSchema.shape)
    .openapi('MonitoringExam');

export const monitoringStatsSchema = z
    .object(Schema.monitoringStatsSchema.shape)
    .openapi('MonitoringStats');

export const monitoringStudentSummarySchema = z
    .object(Schema.monitoringStudentSummarySchema.shape)
    .extend({
        lifecycleState: Schema.examAttemptLifecycleStateSchema.nullable().optional(),
        scoreState: Schema.examAttemptScoreStateSchema.nullable().optional(),
        closedReason: z.string().nullable().optional(),
        reopenedUntil: z.union([z.string(), z.date()]).nullable().optional(),
        finalizedAt: z.union([z.string(), z.date()]).nullable().optional(),
    })
    .openapi('MonitoringStudentSummary');

export const monitoringStudentDetailSchema = z
    .object(Schema.monitoringStudentDetailSchema.shape)
    .extend({
        lifecycleState: Schema.examAttemptLifecycleStateSchema.nullable().optional(),
        scoreState: Schema.examAttemptScoreStateSchema.nullable().optional(),
        closedReason: z.string().nullable().optional(),
        reopenedUntil: z.union([z.string(), z.date()]).nullable().optional(),
        finalizedAt: z.union([z.string(), z.date()]).nullable().optional(),
        lifecycleEvents: z.array(z.object(Schema.examAttemptLifecycleEventSchema.shape)).optional(),
    })
    .openapi('MonitoringStudentDetail');

export const monitoringOverviewSchema = z
    .object(Schema.monitoringOverviewSchema.shape)
    .openapi('MonitoringOverview');

export const getExamMonitoringOverviewSchema = {
    params: Schema.examIdParamsSchema,
    response: z.object({
        message: z.string(),
        data: monitoringOverviewSchema,
    }),
};

export const getExamMonitoringStudentSchema = {
    params: Schema.monitoringStudentParamsSchema,
    response: z.object({
        message: z.string(),
        data: monitoringStudentDetailSchema,
    }),
};

export type MonitoringOverview = z.infer<typeof monitoringOverviewSchema>;
export type MonitoringExam = z.infer<typeof monitoringExamSchema>;
export type MonitoringIncident = z.infer<typeof monitoringIncidentSchema>;
export type MonitoringStats = z.infer<typeof monitoringStatsSchema>;
export type MonitoringStudentSummary = z.infer<typeof monitoringStudentSummarySchema>;
export type MonitoringStudentDetail = z.infer<typeof monitoringStudentDetailSchema>;
export type MonitoringStudentStatus = z.infer<typeof Schema.monitoringStudentStatusSchema>;
