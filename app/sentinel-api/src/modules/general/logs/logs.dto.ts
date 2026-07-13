import { z } from '@hono/zod-openapi';

/**
 * Zod schema for a single structured audit log record.
 * Extends the database record schema with user details for client-facing displays.
 */
export const logRecordSchema = z
    .object({
        logId: z.string().uuid().openapi({
            description: 'The unique UUID of the log entry.',
            example: 'd3b07384-d113-41c3-a3d2-c518b10e3ce4',
        }),
        userId: z.string().uuid().nullable().openapi({
            description: 'The UUID of the user who performed the action.',
            example: '5f340801-4475-4309-8472-a0988cc62744',
        }),
        action: z.string().openapi({
            description: 'The name or description of the action performed.',
            example: 'user.login',
        }),
        resourceType: z
            .string()
            .nullable()
            .openapi({ description: 'The resource class or category affected.', example: 'exam' }),
        resourceId: z.string().nullable().openapi({
            description: 'The ID of the specific resource affected.',
            example: 'exam-8349',
        }),
        details: z
            .any()
            .nullable()
            .openapi({
                description: 'Additional structured context or metadata.',
                example: { browser: 'Chrome 122', os: 'macOS' },
            }),
        ipAddress: z
            .string()
            .nullable()
            .openapi({ description: 'The client IP address context.', example: '127.0.0.1' }),
        createdAt: z.string().datetime().openapi({ description: 'Timestamp of the event.' }),
        institutionId: z
            .string()
            .uuid()
            .nullable()
            .openapi({ description: 'The parent institution scope ID.', example: 'inst-9382' }),
        branchId: z
            .string()
            .uuid()
            .nullable()
            .openapi({ description: 'The branch institution scope ID.', example: 'branch-3422' }),
        userFirstName: z
            .string()
            .nullable()
            .openapi({ description: 'First name of the user.', example: 'John' }),
        userLastName: z
            .string()
            .nullable()
            .openapi({ description: 'Last name of the user.', example: 'Doe' }),
    })
    .openapi('LogRecord');

/**
 * Zod schema for querying activity logs with pagination and filters.
 */
export const logQuerySchema = z
    .object({
        page: z.coerce.number().int().min(1).optional().default(1).openapi({
            description: 'Page index to fetch.',
            example: 1,
        }),
        pageSize: z.coerce.number().int().min(1).max(100).optional().default(10).openapi({
            description: 'Number of logs per page.',
            example: 10,
        }),
        startDate: z
            .string()
            .datetime({ message: 'Invalid ISO start date format' })
            .optional()
            .openapi({
                description: 'Start range date context in ISO timestamp.',
                example: '2026-05-25T00:00:00.000Z',
            }),
        endDate: z
            .string()
            .datetime({ message: 'Invalid ISO end date format' })
            .optional()
            .openapi({
                description: 'End range date context in ISO timestamp.',
                example: '2026-05-25T23:59:59.000Z',
            }),
        action: z.string().optional().openapi({
            description: 'Filter logs by a specific action name.',
            example: 'user.login',
        }),
        resourceType: z.string().optional().openapi({
            description: 'Filter logs by a specific resource type.',
            example: 'exam',
        }),
        userId: z.string().uuid('Invalid user UUID').optional().openapi({
            description: 'Filter logs by performing user.',
            example: '5f340801-4475-4309-8472-a0988cc62744',
        }),
        branchId: z.string().uuid('Invalid branch UUID').optional().openapi({
            description: 'Filter logs by branch institution.',
            example: 'branch-3422',
        }),
        institutionId: z.string().uuid('Invalid institution UUID').optional().openapi({
            description: 'Filter logs by parent institution.',
            example: 'inst-9382',
        }),
    })
    .openapi('LogQuery');

/**
 * Zod schema representing a structured paginated response wrapper for logs.
 */
export const logPageSchema = z
    .object({
        items: z.array(logRecordSchema),
        page: z.number().int(),
        pageSize: z.number().int(),
        total: z.number().int(),
        totalPages: z.number().int(),
        hasMore: z.boolean(),
    })
    .openapi('LogPage');

export const getLogsResponseSchema = z.object({
    message: z.string().openapi({ example: 'Logs fetched successfully' }),
    data: logPageSchema,
});

export type LogRecord = z.infer<typeof logRecordSchema>;
export type LogQuery = z.infer<typeof logQuerySchema>;
export type LogPage = z.infer<typeof logPageSchema>;
