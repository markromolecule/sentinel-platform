import { z } from '@hono/zod-openapi';

// ─── Query Params ─────────────────────────────────────────────────────────────

export const analyticsQuerySchema = z.object({
    institution_id: z.string().uuid().optional().openapi({
        description:
            'Optional institution ID to scope analytics (defaults to authenticated institution)',
        example: 'd3b07384-d113-495f-a558-145c38d52367',
    }),
});

// ─── KPI Schema ───────────────────────────────────────────────────────────────

export const analyticsKPIsSchema = z
    .object({
        totalExams: z
            .number()
            .int()
            .nonnegative()
            .openapi({ description: 'Total non-draft exams' }),
        totalAttempts: z
            .number()
            .int()
            .nonnegative()
            .openapi({ description: 'Total exam attempts' }),
        completedAttempts: z
            .number()
            .int()
            .nonnegative()
            .openapi({ description: 'Total completed attempts' }),
        totalIncidents: z
            .number()
            .int()
            .nonnegative()
            .openapi({ description: 'Total flagged incidents across attempts' }),
        flaggedAttempts: z
            .number()
            .int()
            .nonnegative()
            .openapi({ description: 'Total exam attempts with at least one flagged incident' }),
        activeExams: z
            .number()
            .int()
            .nonnegative()
            .openapi({ description: 'Total active/available/in-progress exams' }),
        integrityIndex: z.number().openapi({
            description:
                'Calculated exam integrity score (percentage of unflagged completed exams)',
        }),
    })
    .openapi('AnalyticsKPIs');

export const analyticsKPIsResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: analyticsKPIsSchema,
});

// ─── Incident Severity Schema ──────────────────────────────────────────────────

export const incidentSeverityMetricSchema = z
    .object({
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH']).openapi({ description: 'Severity category' }),
        count: z.number().int().nonnegative().openapi({ description: 'Number of incidents' }),
        percentage: z.number().openapi({ description: 'Percentage share of total incidents' }),
    })
    .openapi('IncidentSeverityMetric');

export const analyticsIncidentSeverityResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.array(incidentSeverityMetricSchema),
});

// ─── Incident Type Schema ──────────────────────────────────────────────────────

export const incidentTypeMetricSchema = z
    .object({
        type: z.string().openapi({ description: 'Type of flagged incident, e.g. MULTIPLE_PEOPLE' }),
        count: z
            .number()
            .int()
            .nonnegative()
            .openapi({ description: 'Number of incidents of this type' }),
        percentage: z.number().openapi({ description: 'Percentage share of total incidents' }),
    })
    .openapi('IncidentTypeMetric');

export const analyticsIncidentTypeResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.array(incidentTypeMetricSchema),
});

// ─── Department Integrity Schema ────────────────────────────────────────────────

export const departmentIntegrityMetricSchema = z
    .object({
        department: z.string().openapi({ description: 'Name of the department' }),
        completed: z
            .number()
            .int()
            .nonnegative()
            .openapi({ description: 'Total completed attempts' }),
        flagged: z
            .number()
            .int()
            .nonnegative()
            .openapi({ description: 'Total attempts with flagged incidents' }),
        dropped: z.number().int().nonnegative().openapi({
            description: 'Total attempts that were dropped or not completed without incidents',
        }),
    })
    .openapi('DepartmentIntegrityMetric');

export const analyticsDepartmentIntegrityResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.array(departmentIntegrityMetricSchema),
});

// ─── Exam Completions Schema ──────────────────────────────────────────────────

export const examCompletionMetricSchema = z
    .object({
        name: z.string().openapi({ description: 'Day of week, e.g. Mon, Tue' }),
        completed: z
            .number()
            .int()
            .nonnegative()
            .openapi({ description: 'Number of completed attempts' }),
        dropped: z
            .number()
            .int()
            .nonnegative()
            .openapi({ description: 'Number of dropped attempts' }),
    })
    .openapi('ExamCompletionMetric');

export const analyticsExamCompletionsResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.array(examCompletionMetricSchema),
});

// ─── Incident Trends Schema ───────────────────────────────────────────────────

export const incidentTrendMetricSchema = z
    .object({
        name: z.string().openapi({ description: 'Week label, e.g. Week 1, Week 2' }),
        incidents: z
            .number()
            .int()
            .nonnegative()
            .openapi({ description: 'Number of flagged incidents' }),
    })
    .openapi('IncidentTrendMetric');

export const analyticsIncidentTrendsResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.array(incidentTrendMetricSchema),
});

// ─── Reports Schema ───────────────────────────────────────────────────────────

export const analyticsReportRecordSchema = z
    .object({
        reportId: z.string().uuid().openapi({ description: 'Unique report identifier' }),
        title: z.string().openapi({ description: 'Report Title' }),
        type: z.string().openapi({
            description:
                'Report category type, e.g. completion, incident, performance, or ANALYTICS_OVERALL',
        }),
        generatedAt: z
            .string()
            .nullable()
            .openapi({ description: 'ISO-8601 date when report was generated' }),
        format: z
            .string()
            .nullable()
            .openapi({ description: 'Report file format, e.g. pdf, csv, xlsx' }),
        status: z
            .string()
            .nullable()
            .openapi({ description: 'Processing status, e.g. PENDING, READY, FAILED, EXPIRED' }),
        fileUrl: z
            .string()
            .nullable()
            .openapi({ description: 'URL link to download generated report file' }),
        createdBy: z.string().uuid().nullable().openapi({ description: 'User ID of the creator' }),
        creatorFirstName: z.string().nullable().openapi({ description: 'Creator first name' }),
        creatorLastName: z.string().nullable().openapi({ description: 'Creator last name' }),
        institutionId: z.string().uuid().nullable().openapi({ description: 'Institution ID' }),
        failureCode: z
            .string()
            .nullable()
            .openapi({ description: 'Error code if generation failed' }),
        failureMessage: z
            .string()
            .nullable()
            .openapi({ description: 'Error message if generation failed' }),
        expiresAt: z
            .string()
            .nullable()
            .openapi({ description: 'ISO-8601 date when report expires' }),
        retryCount: z.number().int().openapi({ description: 'Retried attempts count' }),
    })
    .openapi('AnalyticsReportRecord');

export const getReportsQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).optional().openapi({
        description: 'Pagination limit (defaults to 10)',
        example: 10,
    }),
    page: z.coerce.number().int().min(1).optional().openapi({
        description: 'Pagination page number (defaults to 1)',
        example: 1,
    }),
    institutionId: z.string().uuid().optional().openapi({
        description: 'Optional institution ID to filter list',
        example: 'd3b07384-d113-495f-a558-145c38d52367',
    }),
});

export const analyticsReportsResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.object({
        records: z.array(analyticsReportRecordSchema),
        total_records: z
            .number()
            .int()
            .nonnegative()
            .openapi({ description: 'Total matching report records' }),
        limit: z.number().int().positive().openapi({ description: 'Pagination page limit' }),
        page: z.number().int().positive().openapi({ description: 'Pagination current page' }),
    }),
});

// ─── Create Report Schema ─────────────────────────────────────────────────────

export const generateAnalyticsReportBodySchema = z
    .object({
        title: z
            .string()
            .min(1, 'Title is required')
            .max(255, 'Title must be at most 255 characters')
            .openapi({
                description: 'Descriptive title for the report',
                example: 'Quarterly Security Integrity Review',
            }),
        institutionId: z.string().uuid().optional().nullable().openapi({
            description: 'Target institution ID to scope the overall analytics report',
            example: 'd3b07384-d113-495f-a558-145c38d52367',
        }),
        period: z
            .enum(['LAST_7_DAYS', 'LAST_30_DAYS', 'LAST_90_DAYS', 'CUSTOM'])
            .default('LAST_30_DAYS')
            .openapi({
                description: 'Predefined report period preset',
                example: 'LAST_30_DAYS',
            }),
        startDate: z.string().optional().nullable().openapi({
            description: 'ISO start date (YYYY-MM-DD), required if period is CUSTOM',
            example: '2026-06-15',
        }),
        endDate: z.string().optional().nullable().openapi({
            description: 'ISO end date (YYYY-MM-DD), required if period is CUSTOM',
            example: '2026-07-15',
        }),
        timezone: z.string().optional().default('Asia/Manila').openapi({
            description: 'Target timezone context for daily trend aggregation',
            example: 'Asia/Manila',
        }),
    })
    .openapi('GenerateAnalyticsReportBody');

export const createdAnalyticsReportSchema = z
    .object({
        reportId: z.string().uuid().openapi({ description: 'Unique report identifier' }),
        title: z.string(),
        type: z.string(),
        generatedAt: z.string().nullable(),
        format: z.string().nullable(),
        status: z.string().nullable(),
        fileUrl: z.string().nullable(),
        createdBy: z.string().uuid().nullable(),
        institutionId: z.string().uuid().nullable(),
        failureCode: z.string().nullable(),
        failureMessage: z.string().nullable(),
        expiresAt: z.string().nullable(),
        retryCount: z.number().int(),
    })
    .openapi('CreatedAnalyticsReport');

export const generateAnalyticsReportResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: createdAnalyticsReportSchema,
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type AnalyticsKPIsSummary = z.infer<typeof analyticsKPIsSchema>;
export type IncidentSeverityDistribution = z.infer<typeof incidentSeverityMetricSchema>;
export type IncidentTypeDistribution = z.infer<typeof incidentTypeMetricSchema>;
export type DepartmentIntegrityMetric = z.infer<typeof departmentIntegrityMetricSchema>;
export type ExamCompletionMetric = z.infer<typeof examCompletionMetricSchema>;
export type IncidentTrendMetric = z.infer<typeof incidentTrendMetricSchema>;
export type PaginatedAnalyticsReports = z.infer<typeof analyticsReportsResponseSchema>['data'];
export type GenerateAnalyticsReportBody = z.infer<typeof generateAnalyticsReportBodySchema>;
export type AnalyticsReport = z.infer<typeof createdAnalyticsReportSchema>;
