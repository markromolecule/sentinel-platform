import { describe, expect, it } from 'vitest';
import {
    closeExamAttemptLifecycleBodySchema,
    examAttemptLifecycleResponseSchema,
    finalizeExamAttemptLifecycleBodySchema,
    lockExamAttemptLifecycleBodySchema,
    reopenExamAttemptLifecycleBodySchema,
    resetExamAttemptLifecycleBodySchema,
} from './lifecycle-schema';

describe('exam lifecycle schemas', () => {
    it('validates a lock payload', () => {
        const result = lockExamAttemptLifecycleBodySchema.safeParse({
            reasonCode: 'PROCTOR_LOCK',
            notes: 'Student was paused for review.',
        });

        expect(result.success).toBe(true);
    });

    it('validates a reopen payload with a future window', () => {
        const result = reopenExamAttemptLifecycleBodySchema.safeParse({
            reopenedUntil: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            reasonCode: 'MANUAL_REOPEN',
            notes: 'Allow the student to resume.',
        });

        expect(result.success).toBe(true);
    });

    it('rejects a reopen payload with a past window', () => {
        const result = reopenExamAttemptLifecycleBodySchema.safeParse({
            reopenedUntil: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            reasonCode: 'MANUAL_REOPEN',
        });

        expect(result.success).toBe(false);
    });

    it('validates a reset payload', () => {
        const result = resetExamAttemptLifecycleBodySchema.safeParse({
            createReplacementAttempt: true,
            reasonCode: 'ATTEMPT_RESET',
            notes: 'Invalidate the current attempt and allow a fresh one.',
        });

        expect(result.success).toBe(true);
    });

    it('validates a close payload', () => {
        const result = closeExamAttemptLifecycleBodySchema.safeParse({
            reasonCode: 'ACADEMIC_REVIEW',
            notes: 'Close the attempt after incident review.',
        });

        expect(result.success).toBe(true);
    });

    it('validates a finalize payload and lifecycle response', () => {
        const finalizeResult = finalizeExamAttemptLifecycleBodySchema.safeParse({
            scoreState: 'FINALIZED',
            notes: 'Manual review complete.',
        });

        expect(finalizeResult.success).toBe(true);

        const responseResult = examAttemptLifecycleResponseSchema.safeParse({
            attempt: {
                attemptId: 'c5102538-3f5d-4a33-81a7-2984ea5c99e9',
                examId: '2e6bbfed-cad8-493e-b6c4-cc0ca8bfc3f8',
                studentId: '75851d34-0fc1-47a0-b53b-d16ec4cddeaf',
                lifecycleState: 'SUBMITTED',
                lifecycleReason: null,
                lifecycleNote: null,
                lockedAt: null,
                lockedBy: null,
                reopenedUntil: null,
                closedAt: null,
                closedBy: null,
                closedReason: null,
                supersededByAttemptId: null,
                supersededAt: null,
                supersededBy: null,
                finalizedAt: new Date().toISOString(),
                finalizedBy: 'c7bb8726-b3af-471c-aea1-b7f0f06fcaf0',
                scoreState: 'FINALIZED',
                events: [],
            },
            latestEvent: {
                eventId: '6d421adb-3c77-4b87-b524-b3060cf21f41',
                attemptId: 'c5102538-3f5d-4a33-81a7-2984ea5c99e9',
                examId: '2e6bbfed-cad8-493e-b6c4-cc0ca8bfc3f8',
                studentId: '75851d34-0fc1-47a0-b53b-d16ec4cddeaf',
                eventType: 'FINALIZED',
                previousState: 'SUBMITTED',
                nextState: 'SUBMITTED',
                actorUserId: 'c7bb8726-b3af-471c-aea1-b7f0f06fcaf0',
                reasonCode: null,
                notes: 'Manual review complete.',
                relatedIncidentIds: null,
                relatedOverrideId: null,
                metadata: null,
                createdAt: new Date().toISOString(),
            },
        });

        expect(responseResult.success).toBe(true);
    });
});
