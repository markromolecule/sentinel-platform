import * as z from 'zod';

const dateTimeSchema = z.union([z.string(), z.date()]);
const nullableDateTimeSchema = dateTimeSchema.nullable();
const nullableUuidSchema = z.string().uuid().nullable();

export const examAttemptLifecycleStateSchema = z.enum([
    'IN_PROGRESS',
    'LOCKED',
    'CLOSED',
    'SUBMITTED',
    'SUPERSEDED',
]);

export const examAttemptLifecycleEventTypeSchema = z.enum([
    'STARTED',
    'SUBMITTED',
    'LOCKED',
    'REOPENED',
    'RESET',
    'CLOSED',
    'SUPERSEDED',
    'FINALIZED',
    'FINALIZATION_REVISED',
    'MAKEUP_GRANTED',
    'RETAKE_GRANTED',
    'INCIDENT_REVIEWED',
]);

export const examAttemptScoreStateSchema = z.enum(['DRAFT', 'FINALIZED', 'REVISION_REQUIRED']);

export const examAttemptLifecycleEventSchema = z.object({
    eventId: z.string().uuid(),
    attemptId: z.string().uuid(),
    examId: z.string().uuid(),
    studentId: z.string().uuid(),
    eventType: examAttemptLifecycleEventTypeSchema,
    previousState: examAttemptLifecycleStateSchema.nullable(),
    nextState: examAttemptLifecycleStateSchema.nullable(),
    actorUserId: nullableUuidSchema,
    reasonCode: z.string().trim().max(100).nullable(),
    notes: z.string().trim().max(2000).nullable(),
    relatedIncidentIds: z.array(z.string().uuid()).nullable(),
    relatedOverrideId: nullableUuidSchema,
    metadata: z.record(z.string(), z.unknown()).nullable(),
    createdAt: nullableDateTimeSchema,
});

export const examAttemptLifecycleSnapshotSchema = z.object({
    attemptId: z.string().uuid(),
    examId: z.string().uuid(),
    studentId: z.string().uuid(),
    lifecycleState: examAttemptLifecycleStateSchema,
    lifecycleReason: z.string().trim().max(100).nullable(),
    lifecycleNote: z.string().trim().max(2000).nullable(),
    lockedAt: nullableDateTimeSchema,
    lockedBy: nullableUuidSchema,
    reopenedUntil: nullableDateTimeSchema,
    closedAt: nullableDateTimeSchema,
    closedBy: nullableUuidSchema,
    closedReason: z.string().trim().max(100).nullable(),
    supersededByAttemptId: nullableUuidSchema,
    supersededAt: nullableDateTimeSchema,
    supersededBy: nullableUuidSchema,
    finalizedAt: nullableDateTimeSchema,
    finalizedBy: nullableUuidSchema,
    scoreState: examAttemptScoreStateSchema,
    events: z.array(examAttemptLifecycleEventSchema).default([]),
});

const lifecycleActionBodyBaseSchema = z.object({
    reasonCode: z.string().trim().max(100).nullable().optional(),
    notes: z.string().trim().max(2000).nullable().optional(),
});

export const lockExamAttemptLifecycleBodySchema = lifecycleActionBodyBaseSchema.extend({
    reasonCode: z.string().trim().min(1).max(100),
});

export const reopenExamAttemptLifecycleBodySchema = lifecycleActionBodyBaseSchema
    .extend({
        reopenedUntil: dateTimeSchema,
    })
    .superRefine((value, context) => {
        const reopenedUntil = new Date(value.reopenedUntil);

        if (Number.isNaN(reopenedUntil.getTime())) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['reopenedUntil'],
                message: 'Provide a valid reopen expiration time.',
            });
            return;
        }

        if (reopenedUntil.getTime() <= Date.now()) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['reopenedUntil'],
                message: 'Provide a reopen expiration time in the future.',
            });
        }
    });

export const resetExamAttemptLifecycleBodySchema = lifecycleActionBodyBaseSchema.extend({
    createReplacementAttempt: z.boolean().optional(),
});

export const closeExamAttemptLifecycleBodySchema = lifecycleActionBodyBaseSchema.extend({
    reasonCode: z.string().trim().min(1).max(100),
});

export const examRemediationTypeSchema = z.enum(['RETAKE', 'MAKEUP']);

export const examRemediationScheduleSchema = z.object({
    remediationId: z.string().uuid(),
    sourceExamId: z.string().uuid(),
    remediationExamId: z.string().uuid(),
    studentId: z.string().uuid(),
    sourceAttemptId: z.string().uuid().nullable(),
    remediationType: examRemediationTypeSchema,
    scheduledDate: dateTimeSchema,
    endDateTime: dateTimeSchema,
    createdBy: z.string().uuid(),
    createdAt: dateTimeSchema,
    notes: z.string().nullable(),
});

export const remediationExamSchema = z.object({
    examId: z.string().uuid(),
    title: z.string(),
    scheduledDate: dateTimeSchema,
    endDateTime: dateTimeSchema,
    status: z.string(),
});

export const finalizeExamAttemptLifecycleBodySchema = lifecycleActionBodyBaseSchema.extend({
    scoreState: examAttemptScoreStateSchema.default('FINALIZED'),
});

export const examAttemptLifecycleResponseSchema = z.object({
    attempt: examAttemptLifecycleSnapshotSchema,
    latestEvent: examAttemptLifecycleEventSchema,
});

export type ExamAttemptLifecycleStateType = z.infer<typeof examAttemptLifecycleStateSchema>;
export type ExamAttemptLifecycleEventTypeType = z.infer<typeof examAttemptLifecycleEventTypeSchema>;
export type ExamAttemptScoreStateType = z.infer<typeof examAttemptScoreStateSchema>;
export type ExamAttemptLifecycleEventSchemaType = z.infer<typeof examAttemptLifecycleEventSchema>;
export type ExamAttemptLifecycleSnapshotSchemaType = z.infer<
    typeof examAttemptLifecycleSnapshotSchema
>;
export type LockExamAttemptLifecycleBodyType = z.infer<typeof lockExamAttemptLifecycleBodySchema>;
export type ReopenExamAttemptLifecycleBodyType = z.infer<
    typeof reopenExamAttemptLifecycleBodySchema
>;
export type ResetExamAttemptLifecycleBodyType = z.infer<typeof resetExamAttemptLifecycleBodySchema>;
export type CloseExamAttemptLifecycleBodyType = z.infer<typeof closeExamAttemptLifecycleBodySchema>;
export type FinalizeExamAttemptLifecycleBodyType = z.infer<
    typeof finalizeExamAttemptLifecycleBodySchema
>;
export type ExamAttemptLifecycleResponseType = z.infer<typeof examAttemptLifecycleResponseSchema>;
export type ExamRemediationType = z.infer<typeof examRemediationTypeSchema>;
export type ExamRemediationSchedule = z.infer<typeof examRemediationScheduleSchema>;
export type RemediationExam = z.infer<typeof remediationExamSchema>;
