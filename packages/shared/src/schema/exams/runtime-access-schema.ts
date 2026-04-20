import * as z from 'zod';

const nullableDateTimeSchema = z.union([z.string(), z.date()]).nullable();

export const examRuntimeAccessStateSchema = z.enum([
    'before_start',
    'open',
    'locked',
    'reopened',
    'closed',
]);

export const examRuntimeAccessReasonCodeSchema = z.enum([
    'NOT_STARTED',
    'OPEN',
    'LOCKED',
    'REOPENED',
    'CLOSED',
]);

export const examRuntimeAccessSchema = z.object({
    state: examRuntimeAccessStateSchema,
    reasonCode: examRuntimeAccessReasonCodeSchema,
    message: z.string(),
    canStart: z.boolean(),
    canResume: z.boolean(),
    hasActiveAttempt: z.boolean(),
    startsAt: nullableDateTimeSchema,
    endsAt: nullableDateTimeSchema,
    reopenedUntil: nullableDateTimeSchema,
});

export const examRuntimeAccessUpdateStateSchema = z.enum(['open', 'locked', 'reopened', 'closed']);

export const updateExamRuntimeAccessBodyBaseSchema = z.object({
    state: examRuntimeAccessUpdateStateSchema,
    reopenedUntil: nullableDateTimeSchema.optional(),
});

export const updateExamRuntimeAccessBodySchema = updateExamRuntimeAccessBodyBaseSchema.superRefine(
    (value, context) => {
        if (value.state !== 'reopened') {
            return;
        }

        if (!value.reopenedUntil) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['reopenedUntil'],
                message: 'Provide a reopen expiration time when state is reopened.',
            });
            return;
        }

        const reopenedUntil = new Date(value.reopenedUntil);

        if (Number.isNaN(reopenedUntil.getTime())) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['reopenedUntil'],
                message: 'Provide a valid reopen expiration time.',
            });
        }
    },
);

export type ExamRuntimeAccessStateType = z.infer<typeof examRuntimeAccessStateSchema>;
export type ExamRuntimeAccessReasonCodeType = z.infer<typeof examRuntimeAccessReasonCodeSchema>;
export type ExamRuntimeAccessType = z.infer<typeof examRuntimeAccessSchema>;
export type UpdateExamRuntimeAccessBodyType = z.infer<typeof updateExamRuntimeAccessBodySchema>;
