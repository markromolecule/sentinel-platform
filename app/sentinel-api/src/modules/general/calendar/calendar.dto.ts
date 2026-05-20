import { z } from '@hono/zod-openapi';

// ─── Shared Enums ────────────────────────────────────────────────────────────

const calendarEventTypeEnum = z.enum(['EVENT', 'ANNOUNCEMENT', 'MAINTENANCE', 'HOLIDAY', 'NOTE']);

const calendarEventAudienceEnum = z.enum([
    'ALL',
    'STUDENTS',
    'INSTRUCTORS',
    'ADMINS',
    'SPECIFIC_GROUP',
]);

// ─── Response Schema ──────────────────────────────────────────────────────────

export const calendarEventSchemaOpenApi = z
    .object({
        eventId: z.string().uuid(),
        institutionId: z.string().uuid(),
        title: z.string().max(255),
        description: z.string().nullable(),
        eventType: calendarEventTypeEnum,
        targetAudience: calendarEventAudienceEnum,
        startDate: z.union([z.coerce.date(), z.string()]),
        endDate: z.union([z.coerce.date(), z.string()]).nullable(),
        startTime: z.string().nullable(),
        endTime: z.string().nullable(),
        createdBy: z.string().uuid().nullable(),
        createdByName: z.string().nullable(),
        updatedBy: z.string().uuid().nullable(),
        createdAt: z.union([z.coerce.date(), z.string()]).nullable(),
        updatedAt: z.union([z.coerce.date(), z.string()]).nullable(),
    })
    .openapi('CalendarEvent');

// ─── Get Calendar Events ──────────────────────────────────────────────────────

export const getCalendarEventsSchema = {
    request: {
        query: z.object({
            month: z.string().optional().openapi({ description: 'Month number (1-12)' }),
            year: z.string().optional().openapi({ description: 'Full year, e.g. 2026' }),
        }),
    },
    response: z.object({
        success: z.boolean(),
        message: z.string(),
        data: z.array(calendarEventSchemaOpenApi),
    }),
};

// ─── Get Single Calendar Event ────────────────────────────────────────────────

export const getCalendarEventSchema = {
    params: z.object({
        id: z.string().uuid('Invalid calendar event ID format'),
    }),
    response: z.object({
        success: z.boolean(),
        message: z.string(),
        data: calendarEventSchemaOpenApi,
    }),
};

// ─── Create Calendar Event ────────────────────────────────────────────────────

const createCalendarEventBody = z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title must be at most 255 characters'),
    description: z.string().optional(),
    eventType: calendarEventTypeEnum.default('EVENT'),
    targetAudience: calendarEventAudienceEnum.default('ALL'),
    startDate: z.string().datetime({ message: 'startDate must be a valid ISO 8601 datetime' }),
    endDate: z
        .string()
        .datetime({ message: 'endDate must be a valid ISO 8601 datetime' })
        .optional(),
    startTime: z.string().max(10).optional().openapi({ description: 'HH:MM format, e.g. 09:00' }),
    endTime: z.string().max(10).optional().openapi({ description: 'HH:MM format, e.g. 17:00' }),
});

export const createCalendarEventSchema = {
    body: createCalendarEventBody,
    response: z.object({
        success: z.boolean(),
        message: z.string(),
        data: calendarEventSchemaOpenApi,
    }),
};

// ─── Update Calendar Event ────────────────────────────────────────────────────

const updateCalendarEventBody = z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title must be at most 255 characters').optional(),
    description: z.string().optional(),
    eventType: calendarEventTypeEnum.optional(),
    targetAudience: calendarEventAudienceEnum.optional(),
    startDate: z.string().datetime({ message: 'startDate must be a valid ISO 8601 datetime' }).optional(),
    endDate: z
        .string()
        .datetime({ message: 'endDate must be a valid ISO 8601 datetime' })
        .optional(),
    startTime: z.string().max(10).optional().openapi({ description: 'HH:MM format, e.g. 09:00' }),
    endTime: z.string().max(10).optional().openapi({ description: 'HH:MM format, e.g. 17:00' }),
});

export const updateCalendarEventSchema = {
    params: z.object({
        id: z.string().uuid('Invalid calendar event ID format'),
    }),
    body: updateCalendarEventBody,
    response: z.object({
        success: z.boolean(),
        message: z.string(),
        data: calendarEventSchemaOpenApi,
    }),
};

// ─── Delete Calendar Event ────────────────────────────────────────────────────

export const deleteCalendarEventSchema = {
    params: z.object({
        id: z.string().uuid('Invalid calendar event ID format'),
    }),
    response: z.object({
        success: z.boolean(),
        message: z.string(),
        data: z.null(),
    }),
};

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type CreateCalendarEventBody = z.infer<typeof createCalendarEventSchema.body>;
export type UpdateCalendarEventBody = z.infer<typeof updateCalendarEventSchema.body>;
export type CalendarEventRow = z.infer<typeof calendarEventSchemaOpenApi>;
